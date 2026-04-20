using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;

namespace MobileShop.API.Controllers.Public
{
    [ApiController]
    [Route("api/products")] // Chú ý: Đường dẫn này không có chữ "admin"
    // LƯU Ý QUAN TRỌNG: Ở đây KHÔNG có [Authorize], ai cũng có thể gọi được!
    public class PublicProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách sản phẩm cho Trang chủ (Rút gọn dữ liệu cho web load nhanh)
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Where(p => !p.IsDeleted)
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.BasePrice,
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    // Lấy hình ảnh của cấu hình đầu tiên làm ảnh đại diện ngoài trang chủ
                    ImageUrl = p.Variants.FirstOrDefault() != null ? p.Variants.FirstOrDefault()!.ImageUrl : null
                })
                .ToListAsync();

            return Ok(products);
        }

        // 2. Lấy chi tiết 1 sản phẩm khi khách hàng bấm vào xem
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductDetails(int id)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Specifications)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null) return NotFound("Sản phẩm không tồn tại");

            var result = new 
            {
                product.Id,
                product.Name,
                product.Description,
                product.BasePrice,
                CategoryName = product.Category?.Name,
                Variants = product.Variants.Select(v => new {
                    v.Id, v.Color, v.Storage, v.Price, v.StockQuantity, v.ImageUrl
                }).ToList(),
                Specifications = product.Specifications?.Select(s => new {
                    s.SpecKey, s.SpecValue
                }).ToList()
            };

            return Ok(result);
        }
    }
}