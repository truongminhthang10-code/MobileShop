using System.ComponentModel.DataAnnotations;

namespace MobileShop.API.DTOs
{
    // DTO cho Biến thể (Màu, Dung lượng, Giá riêng)
    public class VariantCreateDto
    {
        public string? Color { get; set; }
        public string? Storage { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    // DTO cho Thông số (Chip, Màn hình...)
    public class SpecCreateDto
    {
        public string SpecKey { get; set; } = string.Empty;
        public string SpecValue { get; set; } = string.Empty;
    }

    // DTO chính để Gom tất cả lại khi Tạo Sản phẩm
    public class ProductCreateDto
    {
        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        [MaxLength(200, ErrorMessage = "Tên quá dài")]
        public string Name { get; set; } = string.Empty;
        
        public int CategoryId { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Giá tiền không được âm")]
        public decimal BasePrice { get; set; }
        public string? Description { get; set; }

        // Danh sách biến thể và thông số đi kèm
        public List<VariantCreateDto> Variants { get; set; } = new List<VariantCreateDto>();
        public List<SpecCreateDto> Specifications { get; set; } = new List<SpecCreateDto>();
    }
}