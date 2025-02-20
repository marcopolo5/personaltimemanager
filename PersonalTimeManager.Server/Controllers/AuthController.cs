using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;
using System.Text.RegularExpressions;
using System.Net.Http;
using PersonalTimeManager.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseAuth _auth;
    private readonly FirestoreDb _firestoreDb;
    private readonly ILogger<AuthController> _logger;
    private readonly string _firebaseApiKey;
    private readonly HttpClient _httpClient;

    public AuthController(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<AuthController> logger)
    {
        _firebaseApiKey = configuration["Firebase:ApiKey"];
        if (string.IsNullOrEmpty(_firebaseApiKey))
        {
            throw new Exception("Firebase API Key is missing in appsettings.json!");
        }

        _httpClient = httpClientFactory.CreateClient();
        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());

        _auth = FirebaseAuth.DefaultInstance;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Register request)
    {
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.ConfirmPassword))
            return BadRequest(new { message = "All fields are required." });

        if (request.Password != request.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match." });

        if (!Regex.IsMatch(request.Email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
            return BadRequest(new { message = "Invalid email format." });

        try
        {
            var userRecord = await _auth.CreateUserAsync(new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.Name
            });

            var userDoc = new Dictionary<string, object>
            {
                { "uid", userRecord.Uid },
                { "name", request.Name },
                { "email", request.Email },
                { "created_at", Timestamp.GetCurrentTimestamp() }
            };

            await _firestoreDb.Collection("users").Document(userRecord.Uid).SetAsync(userDoc);
            var token = await _auth.CreateCustomTokenAsync(userRecord.Uid);

            return Ok(new { message = "User registered successfully.", token, user = userDoc });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration.");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Login request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { message = "Email and Password are required." });

        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_firebaseApiKey}",
                new { email = request.Email, password = request.Password, returnSecureToken = true });

            if (!response.IsSuccessStatusCode)
                return Unauthorized(new { message = "Invalid email or password." });

            var result = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            if (result == null || !result.ContainsKey("idToken") || !result.ContainsKey("localId"))
                return Unauthorized(new { message = "Invalid response from Firebase." });

            var docSnapshot = await _firestoreDb.Collection("users").Document(result["localId"].ToString()).GetSnapshotAsync();
            if (!docSnapshot.Exists)
                return Unauthorized(new { message = "User not found." });

            return Ok(new { message = "Login successful.", token = result["idToken"], user = docSnapshot.ToDictionary() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login.");
            return StatusCode(500, new { message = ex.Message });
        }
    }
}