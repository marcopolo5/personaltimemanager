using Google.Cloud.Firestore;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;

namespace PersonalTimeManager.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly FirestoreDb _firestoreDb;

        public UsersController()
        {
            _firestoreDb = FirestoreDb.Create("personaltimemanager"); 
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserModel userModel)
        {
            try
            {
                if (string.IsNullOrEmpty(userModel.Name) || string.IsNullOrEmpty(userModel.Email) || string.IsNullOrEmpty(userModel.Password))
                {
                    return BadRequest(new { message = "Name, Email, and Password are required." });
                }

                
                UserRecordArgs userArgs = new UserRecordArgs
                {
                    Email = userModel.Email,
                    Password = userModel.Password,
                    DisplayName = userModel.Name,
                };

                UserRecord userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

                
                var usersCollection = _firestoreDb.Collection("users");
                var newUser = new Dictionary<string, object>
                {
                    { "uid", userRecord.Uid },
                    { "name", userModel.Name },
                    { "email", userModel.Email },
                    { "created_at", Timestamp.GetCurrentTimestamp() }
                };

                await usersCollection.AddAsync(newUser);

                return Ok(new { message = "User registered successfully in Authentication and Firestore." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class UserModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
