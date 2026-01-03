using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using WagayaDiscord.Server.Entities;
using WagayaDiscord.Server.Hubs;
using WagayaDiscord.Server.Services;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server;

public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        services.AddSignalR();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        // Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite("Data Source=wagaya.db"));

        // DI
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IChannelService, ChannelService>();
        services.AddSingleton<IVoiceProcessingService, VoiceProcessingService>();

        // Authentication
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "WagayaAuth";
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromDays(7);
                options.SlidingExpiration = true;
                // API利用のためリダイレクトせず401を返す
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
            });

        // CORS (for React dev server)
        services.AddCors(options =>
        {
            options.AddPolicy("ClientPermission", policy =>
            {
                policy.AllowAnyHeader()
                      .AllowAnyMethod()
                      .WithOrigins("http://localhost:5173") // Vite default port
                      .AllowCredentials();
            });
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        // DB自動作成 (簡易的)
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        }

        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("ClientPermission");

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/hubs/chat");
            endpoints.MapHub<VoiceHub>("/hubs/voice");
        });
    }
}
