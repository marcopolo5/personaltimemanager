using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using System.Collections;

[ApiController]
[Route("api/[controller]")]
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

    [HttpPost("add")]
    public async Task<IActionResult> AddTask([FromBody] TaskEntity request)
    {
        _logger.LogInformation("Adding a new task: {@Request}", request);

        if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Name))
        {
            return BadRequest(new { message = "UserId and Name are required." });
        }

        DocumentReference docRef = await _firestoreDb.Collection(CollectionName).AddAsync(request);
        request.Id = docRef.Id;

        return Ok(new { message = "Task added successfully.", task = request });
    }

    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTaskById(string taskId)
    {
        DocumentReference docRef = _firestoreDb.Collection(CollectionName).Document(taskId);
        DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return NotFound(new { message = "Task not found." });
        }

        TaskEntity task = snapshot.ConvertTo<TaskEntity>();
        return Ok(task);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserTasks(string userId)
    {
        Query query = _firestoreDb.Collection(CollectionName).WhereEqualTo("UserId", userId);
        QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

        List<TaskEntity> tasks = new();
        foreach (DocumentSnapshot doc in querySnapshot.Documents)
        {
            tasks.Add(doc.ConvertTo<TaskEntity>());
        }

        return Ok(tasks);
    }

    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateTask(string taskId, [FromBody] TaskEntity request)
    {
        DocumentReference docRef = _firestoreDb.Collection(CollectionName).Document(taskId);
        DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return NotFound(new { message = "Task not found." });
        }

        await docRef.SetAsync(request, SetOptions.Overwrite);
        return Ok(new { message = "Task updated successfully." });
    }

    [HttpDelete("{taskId}")]
    public async Task<IActionResult> DeleteTask(string taskId)
    {
        DocumentReference docRef = _firestoreDb.Collection(CollectionName).Document(taskId);
        await docRef.DeleteAsync();

        return Ok(new { message = "Task deleted successfully." });
    }
}
