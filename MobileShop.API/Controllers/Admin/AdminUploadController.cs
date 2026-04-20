using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace MobileShop.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/upload")]
    [Authorize(Roles = "Admin")]
    public class AdminUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public AdminUploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost]
        // Báo cho Swagger biết API này dùng để gửi File
        [Consumes("multipart/form-data")] 
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // Kiểm tra xem có file được gửi lên không
            if (file == null || file.Length == 0)
            {
                return BadRequest("Vui lòng chọn một file ảnh.");
            }

            // Kiểm tra định dạng file (Chỉ cho phép ảnh)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png, .gif, .webp)");
            }

            // 1. Xác định đường dẫn thư mục lưu ảnh (wwwroot/uploads)
            string uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads/products");
            
            // Nếu thư mục chưa tồn tại thì tự động tạo mới
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 2. Tạo tên file độc nhất (tránh việc 2 ảnh cùng tên bị ghi đè)
            // Ví dụ: 5f9b3b..._iphone-15.jpg
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 3. Copy file vào thư mục
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 4. Trả về đường link để lưu vào Database
            string fileUrl = $"/uploads/products/{uniqueFileName}";
            
            return Ok(new { url = fileUrl, message = "Upload ảnh thành công!" });
        }
    }
}