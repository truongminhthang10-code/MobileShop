using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public int UserId { get; set; }

        [Required, MaxLength(1000)] // Giới hạn bình luận tối đa 1000 ký tự
        public string Content { get; set; } = string.Empty;

        public int Rating { get; set; } // Điểm đánh giá

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}