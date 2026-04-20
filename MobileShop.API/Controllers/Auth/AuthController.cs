using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;
using MobileShop.Domain.Entities;
using BCrypt.Net; // Thêm thư viện băm mật khẩu

namespace MobileShop.API.Controllers.Auth
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context; // Khai báo DB

        public AuthController(IConfiguration configuration, ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // 1. API ĐĂNG NHẬP VỚI DATABASE THẬT
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Tìm tài khoản trong Database
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
            
            // Nếu không tìm thấy, HOẶC mật khẩu nhập vào (bị băm ra) không khớp với mã băm trong DB
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Sai tài khoản hoặc mật khẩu.");
            }

            // Nếu đúng, tiến hành tạo Token
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role) // Lấy quyền thật từ DB
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new { token = tokenHandler.WriteToken(token), message = "Đăng nhập thành công" });
        }

        // 2. API TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN (Dùng 1 lần)
        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin()
        {
            // Kiểm tra xem DB đã có ai chưa, nếu có rồi thì chặn luôn không cho tạo nữa
            if (await _context.Users.AnyAsync()) 
            {
                return BadRequest("Hệ thống đã có tài khoản, không thể chạy lệnh này nữa.");
            }

            var adminUser = new User 
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), // Băm mật khẩu trước khi lưu
                Role = "Admin"
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            return Ok("Khởi tạo tài khoản Admin thành công! Mật khẩu là 123456");
        }
    }
}