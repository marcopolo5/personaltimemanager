﻿using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/Users/{userId}/Tasks")]
public class TaskController : ControllerBase
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "tasks";
    private readonly ILogger<TaskController> _logger;

    public TaskController(ILogger<TaskController> logger)
    {
        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> AddTask(string userId, [FromBody] TaskEntity request)
    {
        _logger.LogInformation("Adding a new task for user {UserId}: {@Request}", userId, request);

        if (string.IsNullOrEmpty(request.Name))
        {
            return BadRequest(new { message = "Task Name is required." });
        }

        request.UserId = userId;
        request.StartTime ??= "--:--";

        DocumentReference docRef = await _firestoreDb.Collection(CollectionName).AddAsync(request);

        request.Id = docRef.Id;
        request.IsCompleted = false;

        return StatusCode(201, new { message = "Task added successfully.", data = request });
    }


    [HttpGet]
    public async Task<IActionResult> GetUserTasks(string userId)
    {
        Query query = _firestoreDb.Collection(CollectionName).WhereEqualTo("UserId", userId);
        QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

        List<TaskEntity> tasks = new();
        foreach (DocumentSnapshot doc in querySnapshot.Documents)
        {
            tasks.Add(doc.ConvertTo<TaskEntity>());
        }

        return Ok(new { message = "Tasks retrieved successfully.", data = tasks });
    }

    [HttpGet("Date/{date}")]
    public async Task<IActionResult> GetTasksByDate(string userId, string date)
    {
        if (!DateTime.TryParse(date, out DateTime parsedDate))
        {
            _logger.LogWarning("Invalid date format: {Date}", date);
            return BadRequest(new { message = "Invalid date format. Please provide a valid date in the format YYYY-MM-DD." });
        }

        string formattedDate = parsedDate.ToString("yyyy-MM-dd");

        Query query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("UserId", userId)
            .WhereArrayContains("Dates", formattedDate);

        QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

        List<TaskEntity> tasks = new();
        foreach (DocumentSnapshot doc in querySnapshot.Documents)
        {
            tasks.Add(doc.ConvertTo<TaskEntity>());
        }

        if (tasks.Count == 0)
        {
            return NotFound(new { message = "No tasks found for the specified date." });
        }

        return Ok(new { message = "Tasks retrieved successfully.", data = tasks });
    }


    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTaskById(string userId, string taskId)
    {
        Query query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("Id", taskId)
            .WhereEqualTo("UserId", userId);
        QuerySnapshot snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0)
        {
            return NotFound(new { message = "Task not found." });
        }

        TaskEntity task = snapshot.Documents[0].ConvertTo<TaskEntity>();

        return Ok(new { message = "Task retrieved successfully.", data = task });
    }


    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateTask(string userId, string taskId, [FromBody] TaskEntity request)
    {
        Query query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("Id", taskId)
            .WhereEqualTo("UserId", userId);
        QuerySnapshot snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0)
        {
            return NotFound(new { message = "Task not found for this user." });
        }

        DocumentReference docRef = snapshot.Documents[0].Reference;
        request.UserId = userId;
        request.StartTime ??= "--:--";

        if (request.Type == "one-time")
        {
            request.Dates = request.Dates != null && request.Dates.Any()
            ? new List<string> { request.Dates.Last() }
            : new List<string>();
        }

        await docRef.SetAsync(request, SetOptions.Overwrite);

        return Ok(new { message = "Task updated successfully.", data = request });
    }

    [HttpPatch("{taskId}")]
    public async Task<IActionResult> Update(string userId, string taskId)
    {
        Query query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("Id", taskId)
            .WhereEqualTo("UserId", userId);
        QuerySnapshot snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0)
        {
            return NotFound(new { message = "Task not found for this user." });
        }

        DocumentReference docRef = snapshot.Documents[0].Reference;
        DocumentSnapshot docSnapshot = await docRef.GetSnapshotAsync();
        TaskEntity existingTask = docSnapshot.ConvertTo<TaskEntity>();

        existingTask.IsCompleted = !existingTask.IsCompleted;

        await docRef.SetAsync(existingTask, SetOptions.Overwrite);

        return Ok(new { message = "Task updated successfully.", data = existingTask });
    }

    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(string userId, string taskId)
    {
        Query query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("Id", taskId)
            .WhereEqualTo("UserId", userId);
        QuerySnapshot snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0)
        {
            return NotFound(new { message = "Task not found for this user." });
        }
        DocumentReference docRef = snapshot.Documents[0].Reference;
        await docRef.DeleteAsync();
        return StatusCode(204);
    }
}