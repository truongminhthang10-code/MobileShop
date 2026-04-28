using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;
using MobileShop.Infrastructure.Data;

namespace MobileShop.API.Controllers.Public
{
    [ApiController]
    [Route("api/public/orders")]
    [Authorize] // Bắt buộc phải có token đăng nhập mới được gọi API này
    public class PublicOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Tạo 2 class nội bộ (DTO) để map chính xác với cục JSON mà React gửi lên
        public class CreateOrderDto
        {
            public string CustomerName { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string PaymentMethod { get; set; } = "COD";
            public List<OrderItemDto> OrderItems { get; set; } = new();
        }

        public class OrderItemDto
        {
            public int VariantId { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto request)
        {
            // 1. Đọc Token xem ông nào đang mua hàng
            var username = User.Identity?.Name;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest("Giỏ hàng trống!");
            }

            // 2. Tính tổng tiền
            decimal totalAmount = request.OrderItems.Sum(i => i.UnitPrice * i.Quantity);

            // 3. Tạo Đơn hàng mới lưu vào bảng Orders
            var newOrder = new Order
            {
                CustomerName = request.CustomerName,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                PaymentMethod = request.PaymentMethod,
                ShippingMethod = "Delivery",
                TotalAmount = totalAmount,
                Status = 0, // Mặc định: Chờ xác nhận
                CreatedAt = DateTime.UtcNow,
                UserId = currentUser?.Id // Lưu vết UserID để sau này khách xem lại "Lịch sử mua hàng"
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync(); // Lưu để sinh ra OrderId tự động

            // 4. Lưu từng món hàng vào bảng OrderItems và Trừ Tồn Kho
            foreach (var item in request.OrderItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = newOrder.Id,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                };
                _context.OrderItems.Add(orderItem);

                // TRỪ TỒN KHO 
                var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                if (variant != null)
                {
                    // Tránh trường hợp kho bị âm (thực tế nên kiểm tra trước khi tạo đơn)
                    if (variant.StockQuantity >= item.Quantity)
                        variant.StockQuantity -= item.Quantity;
                    else
                        variant.StockQuantity = 0; 
                }
            }

            // 5. Lưu toàn bộ chi tiết và cập nhật kho vào DB
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đặt hàng thành công!", orderId = newOrder.Id });
        }
    }
}