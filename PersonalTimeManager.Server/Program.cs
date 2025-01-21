<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.

//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//app.UseDefaultFiles();
//app.UseStaticFiles();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//app.UseAuthorization();

//app.MapControllers();

//app.MapFallbackToFile("/index.html");

//app.Run();

//**************

using FirebaseAdmin;
=======
﻿using FirebaseAdmin;
>>>>>>> Stashed changes
using Google.Apis.Auth.OAuth2;

>>>>>>> Stashed changes
var builder = WebApplication.CreateBuilder(args);

<<<<<<< Updated upstream
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
=======

FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("Keys/serviceAccountKey.json")
});
Console.WriteLine("Firebase initialized successfully.");


builder.Services.AddControllers();
>>>>>>> Stashed changes
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

<<<<<<< Updated upstream
=======
app.UseStaticFiles();

>>>>>>> Stashed changes
app.Run();