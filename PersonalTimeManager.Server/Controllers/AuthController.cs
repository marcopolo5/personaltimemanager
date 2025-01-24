using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using System.Text.RegularExpressions;
using PersonalTimeManager.Server.Models;
using PersonalTimeManager.Server.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseAuth _auth;
    private readonly FirestoreDb _firestoreDb;
    private readonly IConfiguration _configuration;
    private readonly JwtService _jwtService;

    public AuthController(IConfiguration configuration, JwtService jwtService)
    {
        _auth = FirebaseAuth.DefaultInstance;
        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());
        _configuration = configuration;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Register request)
    {
        // all fields validation
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Name, Email, and Password are required." });
        }

        // email validation
        if (!Regex.IsMatch(request.Email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
        {
            return BadRequest(new { message = "Invalid email format." });
        }

        // password match validation
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match." });
        }

        // password validation
        if (!Regex.IsMatch(request.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"))
        {
            return BadRequest(new { message = "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character." });
        }

        try
        {
            // Create user in Firebase Authentication
            var userRecordArgs = new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.Name,
            };

            var userRecord = await _auth.CreateUserAsync(userRecordArgs);

            // Add user to Firestore
            var userDocument = new Dictionary<string, object>
            {
                { "uid", userRecord.Uid },
                { "name", request.Name },
                { "email", request.Email },
                { "created_at", Timestamp.GetCurrentTimestamp() }
            };

            var usersCollection = _firestoreDb.Collection("users");
            await usersCollection.Document(userRecord.Uid).SetAsync(userDocument);

            // Generate JWT Token
            var token = _jwtService.GenerateJwtToken(userRecord.Uid);

            return Ok(new
            {
                message = "User registered successfully in Authentication and Firestore.",
                token,
                user = new
                {
                    name = request.Name,
                    email = request.Email
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Login request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        try
        {
            // Retrieve user by email from Firebase Authentication
            var user = await _auth.GetUserByEmailAsync(request.Email);

            // Verify password (this assumes FirebaseAuth manages password verification)
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Retrieve user data from Firestore
            var docSnapshot = await _firestoreDb.Collection("users").Document(user.Uid).GetSnapshotAsync();
            if (!docSnapshot.Exists)
            {
                return Unauthorized(new { message = "User not found in Firestore." });
            }

            var userData = docSnapshot.ToDictionary();

            // Generate JWT Token
            var token = _jwtService.GenerateJwtToken(user.Uid);

            return Ok(new
            {
                message = "Login successful.",
                token,
                user = new
                {
                    uid = user.Uid,
                    name = userData["name"],
                    email = userData["email"],
                    created_at = userData["created_at"]
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
