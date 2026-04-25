using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

       [MaxLength(255)]
       public string ImageUrl { get; set; }
        // Navigation Property
        [ForeignKey("ProductId")]
       public virtual Product? Product { get; set; }
    }
}