using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class ProductVariant
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(50)]
        public string? Storage { get; set; } // Ví dụ: 128GB, 256GB

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá riêng cho biến thể này (có thể đắt hơn bản base)

        public int StockQuantity { get; set; } // Số lượng tồn kho

        [MaxLength(255)]
        public string? ImageUrl { get; set; }

        // Navigation Property
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}