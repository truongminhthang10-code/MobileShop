using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MobileShop.Domain.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }

        
        public string PasswordHash { get; set; } = string.Empty; 
        
        [Required, MaxLength(20)]
        public string Role { get; set; } = "Customer"; // Chỉnh mặc định thành Customer
        [MaxLength(20)]
        public string AuthProvider { get; set; } = "Local";

        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}