using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;

    public TokenValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var path = context.Request.Path.Value.ToLower();

        if (path.StartsWith("/api/Users/"))
        {
            var segments = path.Split('/');
            if (segments.Length < 4)
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("Invalid request path.");
                return;
            }

            string requestedUserId = segments[3];

            if (!context.Request.Headers.TryGetValue("Authorization", out StringValues authHeader) || !authHeader.Any())
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authentication token missing.");
                return;
            }

            var token = authHeader.FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid token.");
                return;
            }

            string tokenUserId = GetUserIdFromToken(token);
            if (string.IsNullOrEmpty(tokenUserId) || tokenUserId != requestedUserId)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Forbidden access.");
                return;
            }
        }

        await _next(context);
    }

    private string GetUserIdFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            return jwtToken.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
        }
        catch
        {
            return null;
        }
    }
}