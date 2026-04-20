using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;

namespace MobileShop.API.Controllers.Public
{
    [ApiController]
    // Đường dẫn có chữ "public" để phân biệt với admin
    [Route("api/public/categories")] 
    public class PublicCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicCategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            // Lấy danh sách danh mục (không cần token)
            var categories = await _context.Categories
                .Select(c => new { c.Id, c.Name, c.Description, c.LogoUrl })
                .ToListAsync();
                
            return Ok(categories);
        }
    }
}