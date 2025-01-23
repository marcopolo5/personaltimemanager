using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore.V1;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{

    private readonly FirebaseAuth _auth;
    private readonly FirestoreDb _firestoreDb;

    public LoginController()
    {
        _auth = FirebaseAuth.DefaultInstance;

        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());

    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Token))
        {
            return BadRequest(new { message = "Token is required." });
        }

        try
        {
            // verificarea tokenului de autentificare în Firebase Authentication
            var decodedToken = await _auth.VerifyIdTokenAsync(request.Token);
            var userId = decodedToken.Uid;

            // preia datele utilizatorului din Firestore
            var docSnapshot = await _firestoreDb.Collection("users").Document(userId).GetSnapshotAsync();
            if (!docSnapshot.Exists)
            {
                return Unauthorized(new { message = "User not found in Firestore." });
            }

            var userData = docSnapshot.ToDictionary();

            return Ok(new
            {
                message = "Login successful.",
                user = new
                {
                    uid = userId,
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
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Token { get; set; }
}