using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly FirestoreDb _firestoreDb;

    public TasksController()
    {
        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());
    }

    // Create a new task
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] TaskEntity task)
    {
        if (task == null || string.IsNullOrEmpty(task.UserId))
        {
            return BadRequest(new { message = "Invalid task data." });
        }

        task.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
        task.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);

        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, new
        {
            message = "Task successfully created",
            data = task
        });
    }

    // Get task by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(string id)
    {
        var task = new TaskEntity
        {
            Id = id,
            UserId = "sample_user",
            Name = "Sample Task",
            Description = "This is a sample task",
            Type = "work",
            Dates = new List<string> { "2025-02-01" },
            CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
            UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
        };

        return Ok(new { message = "Task fetched successfully", data = task });
    }

    // Get tasks by user ID
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetTasksByUserId(string userId)
    {
        var tasks = new List<TaskEntity>
        {
            new() { Id = "task_1", UserId = userId, Name = "Task 1", Description = "First task", Type = "work", Dates = new List<string> { "2025-02-01" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_2", UserId = userId, Name = "Task 2", Description = "Second task", Type = "personal", Dates = new List<string> { "2025-02-02" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_3", UserId = userId, Name = "Task 3", Description = "Third task", Type = "urgent", Dates = new List<string> { "2025-02-03" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_4", UserId = userId, Name = "Task 4", Description = "Fourth task", Type = "home", Dates = new List<string> { "2025-02-04" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_5", UserId = userId, Name = "Task 5", Description = "Fifth task", Type = "work", Dates = new List<string> { "2025-02-05" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_6", UserId = userId, Name = "Task 6", Description = "Sixth task", Type = "study", Dates = new List<string> { "2025-02-06" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_7", UserId = userId, Name = "Task 7", Description = "Seventh task", Type = "work", Dates = new List<string> { "2025-02-07" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_8", UserId = userId, Name = "Task 8", Description = "Eighth task", Type = "personal", Dates = new List<string> { "2025-02-08" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_9", UserId = userId, Name = "Task 9", Description = "Ninth task", Type = "urgent", Dates = new List<string> { "2025-02-09" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) },
            new() { Id = "task_10", UserId = userId, Name = "Task 10", Description = "Tenth task", Type = "misc", Dates = new List<string> { "2025-02-10" }, CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow), UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow) }
        };

        return Ok(new
        {
            message = "Tasks fetched successfully",
            data = tasks
        });
    }
}
