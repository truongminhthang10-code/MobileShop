using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;
using MobileShop.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace MobileShop.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/reviews")]
    [Authorize(Roles = "Admin")]
    public class AdminReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách tất cả Đánh giá
        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Product) // Nối bảng lấy thông tin Sản phẩm
                .Include(r => r.User)    // Nối bảng lấy thông tin Người dùng
                .Select(r => new 
                {
                    r.Id,
                    r.Rating,
                    r.Content,
                    r.CreatedAt,
                    ProductName = r.Product != null ? r.Product.Name : "Sản phẩm đã xóa",
                    Username = r.User != null ? r.User.Username : "Khách ẩn danh"
                })
                .OrderByDescending(r => r.CreatedAt) // Sắp xếp mới nhất lên đầu
                .ToListAsync();

            return Ok(reviews);
        }

        // 2. Xóa Đánh giá (nếu khách chửi bậy, spam)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
                return NotFound("Không tìm thấy đánh giá này.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa đánh giá thành công." });
        }
    }
}