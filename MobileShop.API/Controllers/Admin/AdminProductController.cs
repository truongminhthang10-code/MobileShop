using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;
using MobileShop.Infrastructure.Data;
using MobileShop.API.DTOs;
using Microsoft.AspNetCore.Authorization;
namespace MobileShop.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "Admin")]
    public class AdminProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        
        public AdminProductController(ApplicationDbContext context, IWebHostEnvironment environment) 
        {
            _context = context;
            _environment = environment;
        }

        // 1. Lấy danh sách Sản phẩm (Kèm theo Biến thể và Tên Danh mục)
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products
                .Where(p => !p.IsDeleted)
                .Include(p => p.Category) // Nối bảng để lấy Tên Danh mục
                .Include(p => p.Variants) // Nối bảng lấy Biến thể
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.BasePrice,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có",
                    TotalStock = p.Variants.Sum(v => v.StockQuantity), // Tự tính tổng tồn kho
                    Variants = p.Variants.Select(v => new { v.Color, v.Storage, v.Price, v.StockQuantity,v.ImageUrl })
                })
                .ToListAsync();

            return Ok(products);
        }

        // 2. Thêm mới Sản phẩm (Kèm Biến thể và Thông số)
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto dto)
        {
            var isDuplicate = await _context.Products.AnyAsync(p => p.Name == dto.Name && !p.IsDeleted);
            if (isDuplicate) 
            {
                return BadRequest("Tên sản phẩm này đã tồn tại trong hệ thống.");
            }
            // Kiểm tra xem CategoryId có tồn tại trong DB không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId && !c.IsDeleted);
            if (!categoryExists)
            {
                return BadRequest("Danh mục không tồn tại.");
            }

            // Map từ DTO sang Entity chính
            var newProduct = new Product
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                BasePrice = dto.BasePrice,
                Description = dto.Description,
                IsDeleted = false,
                
                // EF Core rất thông minh, nó sẽ tự động map các List con này và tạo Khóa ngoại (ProductId)
                Variants = dto.Variants.Select(v => new ProductVariant
                {
                    Color = v.Color,
                    Storage = v.Storage,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl
                }).ToList(),

                Specifications = dto.Specifications.Select(s => new Specification
                {
                    SpecKey = s.SpecKey,
                    SpecValue = s.SpecValue
                }).ToList()
            };

            // Lưu toàn bộ 3 bảng vào Database chỉ với 2 dòng code
            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sản phẩm thành công!", productId = newProduct.Id });
        }

        //Cập nhật Sản phẩm (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateDto dto)
        {
            // Tìm sản phẩm kèm theo các bảng con
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Specifications)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || product.IsDeleted) 
                return NotFound("Không tìm thấy sản phẩm.");

            // KIỂM TRA VÀ DỌN RÁC Ổ CỨNG AN TOÀN
            foreach (var oldVariant in product.Variants)
            {
                // Kiểm tra xem ảnh cũ này có còn được dùng trong danh sách mới không?
                // (Nếu dto.Variants không chứa cái link này, nghĩa là Admin đã up ảnh khác thay thế)
                bool isImageStillUsed = dto.Variants.Any(v => v.ImageUrl == oldVariant.ImageUrl);
                
                if (!isImageStillUsed)
                {
                    DeletePhysicalFile(oldVariant.ImageUrl); // An tâm xóa
                }
            }

            // Cập nhật thông tin cơ bản
            product.Name = dto.Name;
            product.CategoryId = dto.CategoryId;
            product.BasePrice = dto.BasePrice;
            product.Description = dto.Description;

            // Xử lý các bảng con (Xóa cấu hình cũ - Thêm cấu hình mới)
            _context.ProductVariants.RemoveRange(product.Variants);
            _context.Specifications.RemoveRange(product.Specifications);

            product.Variants = dto.Variants.Select(v => new ProductVariant
            {
                Color = v.Color,
                Storage = v.Storage,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                ImageUrl = v.ImageUrl
            }).ToList();

            // Check null để tránh lỗi nếu Frontend chưa code phần Specifications
            if (dto.Specifications != null)
            {
                product.Specifications = dto.Specifications.Select(s => new Specification
                {
                    SpecKey = s.SpecKey,
                    SpecValue = s.SpecValue
                }).ToList();
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật sản phẩm thành công!" });
        }

        //Xóa Sản phẩm (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null || product.IsDeleted)
                return NotFound("Không tìm thấy sản phẩm.");

            // Đánh dấu xóa mềm
            product.IsDeleted = true;
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm thành công." });
        }

        private void DeletePhysicalFile(string? relativePath)
        {
            if (string.IsNullOrEmpty(relativePath)) return;

            // Chuyển đường dẫn tương đối (/uploads/abc.jpg) thành đường dẫn tuyệt đối trên ổ đĩa
            var filePath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath.TrimStart('/'));

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Specifications)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            // TẠO MỘT GÓI HÀNG MỚI (Ẩn danh) CHỈ CHỨA DỮ LIỆU CẦN THIẾT
            var result = new 
            {
                id = product.Id,
                name = product.Name,
                categoryId = product.CategoryId,
                description = product.Description,
                basePrice = product.BasePrice,
                // Chỉ lấy các trường của Variant, bỏ qua việc tham chiếu ngược lại Product
                variants = product.Variants.Select(v => new 
                {
                    id = v.Id,
                    color = v.Color,
                    storage = v.Storage,
                    price = v.Price,
                    stockQuantity = v.StockQuantity,
                    imageUrl = v.ImageUrl
                }).ToList(),
                // Nếu có Specifications thì cũng lấy ra
                specifications = product.Specifications?.Select(s => new 
                {
                    specKey = s.SpecKey,
                    specValue = s.SpecValue
                }).ToList()
            };

            return Ok(result);
        }


    }
}