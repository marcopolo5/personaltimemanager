using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseAuth _auth;

    public AuthController()
    {
        _auth = FirebaseAuth.DefaultInstance;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match" });
        }

        try
        {
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
