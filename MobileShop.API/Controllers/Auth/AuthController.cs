using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;
using MobileShop.Domain.Entities;
using BCrypt.Net;

namespace MobileShop.API.Controllers.Auth
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

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

        // THÊM MỚI: Class hứng dữ liệu Đăng ký từ Frontend
        public class RegisterRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string? FullName { get; set; } 
        }

        // 1. API ĐĂNG NHẬP VỚI DATABASE THẬT
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Tìm tài khoản trong Database
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
            
            // CẬP NHẬT TẤM KHIÊN BẢO VỆ: Kiểm tra thêm user.PasswordHash == null (dành cho tk Google)
            if (user == null || user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
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
                    new Claim(ClaimTypes.Role, user.Role) 
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            // ĐÃ SỬA LỖI Ở ĐÂY: Thêm role = user.Role vào cục dữ liệu trả về
            return Ok(new { 
                token = tokenHandler.WriteToken(token), 
                role = user.Role, 
                message = "Đăng nhập thành công" 
            });
        }

        // 2. THÊM MỚI: API ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Kiểm tra xem Username đã bị ai đăng ký chưa
            var isExist = await _context.Users.AnyAsync(u => u.Username == request.Username);
            if (isExist)
            {
                return BadRequest("Tên đăng nhập này đã có người sử dụng!");
            }

            // Tạo tài khoản mới (Mã hóa mật khẩu bằng BCrypt)
            var newUser = new User 
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "User", // Mặc định khách tự đăng ký là User thường
                AuthProvider = "Local",
                
                // Lưu ý: Nếu trong file Models/Entities (User.cs) của bạn có chứa cột FullName 
                // thì bạn có thể mở dấu comment dòng bên dưới ra để lưu tên nhé:
                // FullName = request.FullName 
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!" });
        }

        // 3. API TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN (Dùng 1 lần)
        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin()
        {
            if (await _context.Users.AnyAsync()) 
            {
                return BadRequest("Hệ thống đã có tài khoản, không thể chạy lệnh này nữa.");
            }

            var adminUser = new User 
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role = "Admin",
                AuthProvider = "Local" // Cẩn thận set thêm thuộc tính này
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            return Ok("Khởi tạo tài khoản Admin thành công! Mật khẩu là 123456");
        }
    }
}