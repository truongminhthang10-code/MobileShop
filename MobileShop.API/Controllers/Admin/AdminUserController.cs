using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;
using MobileShop.Infrastructure.Data;
using MobileShop.Application.DTOs;

namespace MobileShop.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // BẢO MẬT TỐI ĐA: Chỉ Admin mới được gọi các API này
    public class AdminUserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách toàn bộ User
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.AuthProvider })
                .OrderByDescending(u => u.Id)
                .ToListAsync();
            return Ok(users);
        }

        // 2. Tạo tài khoản nội bộ mới (Staff hoặc Admin)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Tên đăng nhập này đã tồn tại trong hệ thống!");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Role = request.Role, 
                AuthProvider = "Local",
                // Sử dụng BCrypt để mã hóa mật khẩu (Đồng bộ với DB của bạn)
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tạo tài khoản thành công!" });
        }

        // 3. Cập nhật thông tin và Phân quyền
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy User");
            
            // Chốt chặn: Không cho phép tự hạ quyền Admin của mình hoặc người khác xuống
            if (user.Role == "Admin" && request.Role != "Admin") 
                return BadRequest("Hệ thống từ chối hạ quyền của tài khoản Admin!");

            user.Email = request.Email;
            user.Role = request.Role;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }

        // 4. Reset Mật khẩu về mặc định
        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy User");
            if (user.AuthProvider != "Local") 
                return BadRequest("Không thể can thiệp mật khẩu của tài khoản Google/Facebook!");

            // Hash lại mật khẩu mặc định
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("MobileShop@123");
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Đã reset mật khẩu thành: MobileShop@123" });
        }

        // 5. Xóa tài khoản
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy User");
            if (user.Role == "Admin") return BadRequest("Không thể xóa tài khoản Admin!");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok("Đã xóa tài khoản thành công!");
        }
    }
}