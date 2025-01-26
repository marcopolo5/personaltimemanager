using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using PersonalTimeManager.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseAuth _auth;
    private readonly FirestoreDb _firestoreDb;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _auth = FirebaseAuth.DefaultInstance;
        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Register request)
    {
        _logger.LogInformation("Register endpoint called with data: {@Request}", request);

        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            _logger.LogWarning("Missing required fields in Register request.");
            return BadRequest(new { message = "Name, Email, and Password are required." });
        }

        if (!Regex.IsMatch(request.Email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
        {
            _logger.LogWarning("Invalid email format: {Email}", request.Email);
            return BadRequest(new { message = "Invalid email format." });
        }

        if (!Regex.IsMatch(request.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"))
        {
            _logger.LogWarning("Weak password provided.");
            return BadRequest(new { message = "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character." });
        }

        try
        {
            _logger.LogInformation("Creating user in Firebase Authentication...");
            var userRecordArgs = new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.Name,
            };

            var userRecord = await _auth.CreateUserAsync(userRecordArgs);
            _logger.LogInformation("User created in Firebase: {Uid}", userRecord.Uid);

            _logger.LogInformation("Saving user to Firestore...");
            var userDocument = new Dictionary<string, object>
            {
                { "uid", userRecord.Uid },
                { "name", request.Name },
                { "email", request.Email },
                { "created_at", Timestamp.GetCurrentTimestamp() }
            };

            await _firestoreDb.Collection("users").Document(userRecord.Uid).SetAsync(userDocument);
            _logger.LogInformation("User saved to Firestore successfully.");

            _logger.LogInformation("Generating custom Firebase token...");
            var token = await _auth.CreateCustomTokenAsync(userRecord.Uid);
            _logger.LogInformation("Token generated successfully: {Token}", token);

            return Ok(new
            {
                message = "User registered successfully.",
                token,
                user = new
                {
                    uid = userRecord.Uid,
                    name = request.Name,
                    email = request.Email
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user registration.");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Login request)
    {
        _logger.LogInformation("Login endpoint called with email: {Email}", request.Email);

        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            _logger.LogWarning("Missing required fields in Login request.");
            return BadRequest(new { message = "Email and Password are required." });
        }

        try
        {
            _logger.LogInformation("Fetching user from Firebase by email: {Email}", request.Email);
            var user = await _auth.GetUserByEmailAsync(request.Email);
            _logger.LogInformation("User fetched from Firebase: {Uid}", user.Uid);

            _logger.LogInformation("Validating user exists in Firestore...");
            var docSnapshot = await _firestoreDb.Collection("users").Document(user.Uid).GetSnapshotAsync();
            if (!docSnapshot.Exists)
            {
                _logger.LogWarning("User not found in Firestore: {Uid}", user.Uid);
                return Unauthorized(new { message = "User not found." });
            }

            _logger.LogInformation("Generating custom Firebase token...");
            var token = await _auth.CreateCustomTokenAsync(user.Uid);
            _logger.LogInformation("Token generated successfully: {Token}", token);

            return Ok(new
            {
                message = "Login successful.",
                token,
                user = new
                {
                    uid = user.Uid,
                    name = docSnapshot.GetValue<string>("name"),
                    email = docSnapshot.GetValue<string>("email"),
                    created_at = docSnapshot.GetValue<Timestamp>("created_at").ToDateTime()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during user login.");
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
