using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

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
    public async Task<IActionResult> AddTask(string userId, [FromBody] Task request)
    {
        _logger.LogInformation("Adding a new task for user {UserId}: {@Request}", userId, request);

        if (string.IsNullOrEmpty(request.Name))
        {
            return BadRequest(new { message = "Task Name is required." });
        }

        request.UserId = userId;
        request.StartTime ??= "00:00";
        request.EndTime ??= "00:00";
        DocumentReference docRef = await _firestoreDb.Collection(CollectionName).AddAsync(request);
        request.Id = docRef.Id;

        return StatusCode(201, new { message = "Task added successfully.", data = request });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserTasks(string userId)
    {
        Query query = _firestoreDb.Collection(CollectionName).WhereEqualTo("UserId", userId);
        QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

        List<Task> tasks = new();
        foreach (DocumentSnapshot doc in querySnapshot.Documents)
        {
            tasks.Add(doc.ConvertTo<Task>());
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

        Task task = snapshot.Documents[0].ConvertTo<Task>();

        return Ok(new { message = "Task retrieved successfully.", data = task });
    }


    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateTask(string userId, string taskId, [FromBody] Task request)
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
        await docRef.SetAsync(request, SetOptions.Overwrite);

        return Ok(new { message = "Task updated successfully.", data = request });
    }

    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(string userId, string taskId)
    {
        DocumentReference docRef = _firestoreDb.Collection(CollectionName).Document(taskId);
        DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists || snapshot.GetValue<string>("UserId") != userId)
        {
            return NotFound(new { message = "Task not found for this user." });
        }

        await docRef.DeleteAsync();
        return StatusCode(204);
    }
}
