using System.Net;
using System.Security.Cryptography.X509Certificates;
using WagayaDiscord.Server;

var builder = WebApplication.CreateBuilder(args);

// HTTPS configuration with self-signed certificate
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    var certPath = Environment.GetEnvironmentVariable("CERT_PATH") ?? "/app/certs/server.pfx";
    var certPassword = Environment.GetEnvironmentVariable("CERT_PASSWORD") ?? "password";

    if (File.Exists(certPath))
    {
        var certificate = new X509Certificate2(certPath, certPassword);
        serverOptions.Listen(IPAddress.Any, 6120, listenOptions =>
        {
            listenOptions.UseHttps(certificate);
        });
    }
    else
    {
        // HTTP fallback for development
        serverOptions.Listen(IPAddress.Any, 6120);
    }
});

// Use Startup class
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

startup.Configure(app, app.Environment);

app.Run();
