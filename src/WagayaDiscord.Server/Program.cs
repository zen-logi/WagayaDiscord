using WagayaDiscord.Server;

var builder = WebApplication.CreateBuilder(args);

// Use Startup class
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

startup.Configure(app, app.Environment);

app.Run();
