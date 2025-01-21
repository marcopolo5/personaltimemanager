<<<<<<< Updated upstream
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

=======
﻿using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.AspNetCore.Mvc;
>>>>>>> Stashed changes

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseAuth _auth;
<<<<<<< Updated upstream
=======
    private readonly FirestoreDb _firestoreDb;
>>>>>>> Stashed changes

    public AuthController()
    {
        _auth = FirebaseAuth.DefaultInstance;
<<<<<<< Updated upstream
=======

        _firestoreDb = FirestoreDb.Create("personaltimemanager", new FirestoreClientBuilder
        {
            Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
        }.Build());

>>>>>>> Stashed changes
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
<<<<<<< Updated upstream
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match" });
=======
        if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Name, Email, and Password are required." });
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match." });
>>>>>>> Stashed changes
        }

        try
        {
<<<<<<< Updated upstream
            var userRecordArgs = new UserRecordArgs
            {
                Email = request.Email,
                EmailVerified = false,
                Password = request.Password,
                DisplayName = request.Name,
                Disabled = false,
            };

            var userRecord = await _auth.CreateUserAsync(userRecordArgs);
            return Ok(new { userId = userRecord.Uid, message = "User registered successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
=======
            // creeaza utilizator in Firebase Authentication
            var userRecordArgs = new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.Name,
            };

            var userRecord = await _auth.CreateUserAsync(userRecordArgs);

            // adauga utilizatorul in Firestore
            var userDocument = new Dictionary<string, object>
            {
                { "uid", userRecord.Uid },
                { "name", request.Name },
                { "email", request.Email },
                { "created_at", Timestamp.GetCurrentTimestamp() }
            };

            var usersCollection = _firestoreDb.Collection("users");
            await usersCollection.Document(userRecord.Uid).SetAsync(userDocument);

            return Ok(new { message = "User registered successfully in Authentication and Firestore." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
>>>>>>> Stashed changes
        }
    }
}

public class RegisterRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
}
