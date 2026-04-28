using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;
using MobileShop.Infrastructure.Data;
using MobileShop.API.DTOs;
using Microsoft.AspNetCore.Authorization;
namespace MobileShop.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/categories")] // Đường dẫn API sẽ là: /api/admin/categories
    [Authorize(Roles = "Admin,Staff")]
    public class AdminCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AdminCategoryController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // 1. API Lấy danh sách tất cả danh mục
        // 1. Lấy danh sách (Trả về CategoryResponseDto)
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .OrderByDescending(c => c.Id)
                .Select(c => new CategoryResponseDto // Chuyển đổi Entity sang DTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    LogoUrl = c.LogoUrl
                })
                .ToListAsync();

            return Ok(categories);
        }

        // 2. Thêm mới (Nhận vào CategoryCreateDto)
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromForm] CategoryCreateDto dto)
        {
            string? logoUrl = null;

            // Xử lý lưu file ảnh nếu có
            if (dto.Logo != null)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads/categories");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Logo.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Logo.CopyToAsync(fileStream);
                }
                
                logoUrl = "/uploads/categories/" + uniqueFileName;
            }

            var newCategory = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                LogoUrl = logoUrl,
                IsDeleted = false
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            // Trả về DTO cho Frontend (Bổ sung LogoUrl)
            var responseDto = new CategoryResponseDto
            {
                Id = newCategory.Id,
                Name = newCategory.Name,
                Description = newCategory.Description,
                LogoUrl = newCategory.LogoUrl 
            };

            return Ok(responseDto);
        }

        // 3. Cập nhật danh mục (Sửa)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryCreateDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null || category.IsDeleted) 
                return NotFound("Không tìm thấy danh mục");

            // Cập nhật thông tin chữ
            category.Name = dto.Name;
            category.Description = dto.Description;

            // Nếu người dùng có chọn ảnh mới thì mới cập nhật ảnh, không thì giữ nguyên ảnh cũ
            if (dto.Logo != null)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads/categories");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Logo.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Logo.CopyToAsync(fileStream);
                }
                
                category.LogoUrl = "/uploads/categories/" + uniqueFileName;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // 4. Xóa mềm danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null || category.IsDeleted) 
                return NotFound("Không tìm thấy danh mục");

            // KIỂM TRA QUAN TRỌNG: Có sản phẩm nào đang xài danh mục này không?
            bool hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id && !p.IsDeleted);
            if (hasProducts)
            {
                // Nếu có, trả về lỗi 400 và chặn đứng việc xóa
                return BadRequest("Không thể xóa! Hãng này đang có sản phẩm bên trong. Vui lòng xóa hết sản phẩm của hãng này trước.");
            }

            // Nếu an toàn, tiến hành xóa mềm
            category.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa danh mục thành công!" });
        }
    }
}