using System.ComponentModel.DataAnnotations;

namespace MobileShop.Domain.Entities
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? LogoUrl { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Quan hệ 1-N: 1 Danh mục có nhiều Sản phẩm
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}