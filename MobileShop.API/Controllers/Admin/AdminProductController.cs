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
    [Authorize(Roles = "Admin,Staff")]
    public class AdminProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AdminProductController(ApplicationDbContext context, IWebHostEnvironment environment) 
        {
            _context = context;
            _environment = environment;
        }

        // 1. Lấy danh sách Sản phẩm
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products
                .Where(p => !p.IsDeleted)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .Include(p => p.Images) // NỐI BẢNG THƯ VIỆN ẢNH MỚI
                .Select(p => new 
                {
                    p.Id,
                    p.Name,
                    p.BasePrice,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có",
                    TotalStock = p.Variants.Sum(v => v.StockQuantity),
                    Variants = p.Variants.Select(v => new { v.Color, v.Storage, v.Price, v.StockQuantity, v.ImageUrl }),
                    Images = p.Images.Select(i => i.ImageUrl).ToList() // TRẢ VỀ MẢNG URL ẢNH
                })
                .ToListAsync();

            return Ok(products);
        }

        // 2. Thêm mới Sản phẩm
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto dto)
        {
            var isDuplicate = await _context.Products.AnyAsync(p => p.Name == dto.Name && !p.IsDeleted);
            if (isDuplicate) return BadRequest("Tên sản phẩm này đã tồn tại trong hệ thống.");

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId && !c.IsDeleted);
            if (!categoryExists) return BadRequest("Danh mục không tồn tại.");

            var newProduct = new Product
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                BasePrice = dto.BasePrice,
                Description = dto.Description,
                IsDeleted = false,
                
                Variants = dto.Variants.Select(v => new ProductVariant
                {
                    Color = v.Color,
                    Storage = v.Storage,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl
                }).ToList(),

                Specifications = dto.Specifications?.Select(s => new Specification
                {
                    SpecKey = s.SpecKey,
                    SpecValue = s.SpecValue
                }).ToList() ?? new List<Specification>(),

                // THÊM DỮ LIỆU VÀO BẢNG PRODUCT_IMAGES
                Images = dto.Images?.Select(url => new ProductImage
                {
                    ImageUrl = url
                }).ToList() ?? new List<ProductImage>()
            };

            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sản phẩm thành công!", productId = newProduct.Id });
        }

        // 3. Cập nhật Sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Specifications)
                .Include(p => p.Images) // BAO GỒM CẢ BẢNG ẢNH
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || product.IsDeleted) 
                return NotFound("Không tìm thấy sản phẩm.");

            // Dọn rác ổ cứng an toàn cho Variants
            foreach (var oldVariant in product.Variants)
            {
                bool isImageStillUsed = dto.Variants.Any(v => v.ImageUrl == oldVariant.ImageUrl);
                if (!isImageStillUsed) DeletePhysicalFile(oldVariant.ImageUrl);
            }

            // DỌN RÁC Ổ CỨNG CHO THƯ VIỆN ẢNH (Product_Images)
            foreach (var oldImage in product.Images)
            {
                bool isImageStillUsed = dto.Images != null && dto.Images.Contains(oldImage.ImageUrl);
                if (!isImageStillUsed) DeletePhysicalFile(oldImage.ImageUrl);
            }

            // Cập nhật thông tin cơ bản
            product.Name = dto.Name;
            product.CategoryId = dto.CategoryId;
            product.BasePrice = dto.BasePrice;
            product.Description = dto.Description;

            // Xóa cũ thêm mới
            _context.ProductVariants.RemoveRange(product.Variants);
            _context.Specifications.RemoveRange(product.Specifications);
            _context.ProductImages.RemoveRange(product.Images); // XÓA ẢNH CŨ TRONG DB

            product.Variants = dto.Variants.Select(v => new ProductVariant
            {
                Color = v.Color,
                Storage = v.Storage,
                Price = v.Price,
                StockQuantity = v.StockQuantity,
                ImageUrl = v.ImageUrl
            }).ToList();

            if (dto.Specifications != null)
            {
                product.Specifications = dto.Specifications.Select(s => new Specification
                {
                    SpecKey = s.SpecKey,
                    SpecValue = s.SpecValue
                }).ToList();
            }

            // INSERT LẠI MẢNG ẢNH MỚI VÀO DB
            if (dto.Images != null)
            {
                product.Images = dto.Images.Select(url => new ProductImage
                {
                    ImageUrl = url
                }).ToList();
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật sản phẩm thành công!" });
        }

        // 4. Xóa Sản phẩm
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted)
                return NotFound("Không tìm thấy sản phẩm.");

            product.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm thành công." });
        }

        // 5. Lấy Chi tiết Sản phẩm
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Specifications)
                .Include(p => p.Images) // NỐI BẢNG ẢNH
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            var result = new 
            {
                id = product.Id,
                name = product.Name,
                categoryId = product.CategoryId,
                description = product.Description,
                basePrice = product.BasePrice,
                variants = product.Variants.Select(v => new 
                {
                    id = v.Id,
                    color = v.Color,
                    storage = v.Storage,
                    price = v.Price,
                    stockQuantity = v.StockQuantity,
                    imageUrl = v.ImageUrl
                }).ToList(),
                specifications = product.Specifications?.Select(s => new 
                {
                    specKey = s.SpecKey,
                    specValue = s.SpecValue
                }).ToList(),
                
                // TRẢ VỀ DANH SÁCH ẢNH CHO FRONTEND HIỂN THỊ
                images = product.Images.Select(i => i.ImageUrl).ToList() 
            };

            return Ok(result);
        }

        // Hàm hỗ trợ xóa file vật lý
        private void DeletePhysicalFile(string? relativePath)
        {
            if (string.IsNullOrEmpty(relativePath)) return;

            var filePath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath.TrimStart('/'));

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }
    }
}