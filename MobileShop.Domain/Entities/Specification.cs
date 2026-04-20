using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class Specification
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

        [Required, MaxLength(100)]
        public string SpecKey { get; set; } = string.Empty; // Ví dụ: "Chipset", "Pin", "Màn hình"

        [Required, MaxLength(255)]
        public string SpecValue { get; set; } = string.Empty; // Ví dụ: "Snapdragon 8 Gen 2", "5000 mAh"

        // Navigation Property
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}