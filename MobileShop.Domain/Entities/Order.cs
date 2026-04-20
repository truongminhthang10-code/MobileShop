using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MobileShop.Domain.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? Address { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash"; // Cash, MoMo, ZaloPay...

        [MaxLength(50)]
        public string ShippingMethod { get; set; } = "Delivery"; // Delivery (Giao tận nơi), AtStore (Nhận tại cửa hàng)

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // Trạng thái: 0 = Chờ xác nhận, 1 = Đã xác nhận, 2 = Đang giao, 3 = Hoàn thành, 4 = Đã hủy
        public int Status { get; set; } = 0; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ 1-N: 1 Đơn hàng có nhiều Chi tiết đơn hàng
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}