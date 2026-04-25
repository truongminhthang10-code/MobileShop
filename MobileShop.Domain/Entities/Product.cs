using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        public int CategoryId { get; set; }

        [Required, MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        public int ViewCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        // Quan hệ 1-N: 1 Sản phẩm có nhiều Biến thể (Màu sắc, Dung lượng)
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

        // Quan hệ 1-N: 1 Sản phẩm có nhiều Thông số kỹ thuật
        public virtual ICollection<Specification> Specifications { get; set; } = new List<Specification>();
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}