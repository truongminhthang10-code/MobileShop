using Microsoft.AspNetCore.Http; // Thêm dòng này để dùng IFormFile
using System.ComponentModel.DataAnnotations;

namespace MobileShop.API.DTOs
{
    public class CategoryCreateDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Dùng IFormFile để nhận file vật lý
        public IFormFile? Logo { get; set; } 
    }
}