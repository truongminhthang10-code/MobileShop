using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public int VariantId { get; set; }
        public int Quantity { get; set; }

        // Navigation Properties với ForeignKey rõ ràng
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("VariantId")]
        public virtual ProductVariant? Variant { get; set; }
    }
}