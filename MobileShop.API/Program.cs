using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database
var conectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(conectionString, ServerVersion.Parse("8.0.30-mysql")));

// 2. THÊM: Kích hoạt tính năng Controllers (Rất quan trọng cho AdminCategoryController)
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // Cổng mặc định của React và Vite
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// 3. THÊM: Cấu hình giao diện Swagger
builder.Services.AddEndpointsApiExplorer();


// CẤU HÌNH JWT AUTHENTICATION
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Cấu hình Swagger để nó hiện nút "Authorize" (Cái ổ khóa) cho phép nhập Token
// Cấu hình Swagger để nó hiện nút "Authorize" (Cái ổ khóa) cho phép nhập Token
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập 'Bearer' [khoảng trắng] và chuỗi Token của bạn vào đây.\r\n\r\nVí dụ: Bearer eyJhbGciOiJIUzI1..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});



var app = builder.Build();

// 4. Kích hoạt Swagger UI khi ở môi trường code (Development)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ExceptionMiddleware>();
app.UseStaticFiles();


app.UseCors("AllowReactApp");
app.UseAuthentication(); 
app.UseAuthorization();
// 5. THÊM: Kết nối các API (Controllers) vào hệ thống mạng của ứng dụng
app.MapControllers();

app.Run();