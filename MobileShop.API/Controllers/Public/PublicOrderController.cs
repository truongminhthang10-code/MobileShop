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
            var username = User.Identity?.Name;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest("Giỏ hàng trống!");
            }

            

            // BẮT ĐẦU TRANSACTION TẠI ĐÂY
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // 1. Tạo vỏ đơn hàng
                var newOrder = new Order
                {
                    CustomerName = request.CustomerName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    PaymentMethod = request.PaymentMethod,
                    ShippingMethod = "Delivery",
                    TotalAmount = 0,
                    Status = 0, 
                    CreatedAt = DateTime.UtcNow,
                    UserId = currentUser?.Id 
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync(); // Giữ lại để lấy OrderId

                decimal totalAmount = 0;

                // 2. Lưu từng món hàng và Trừ kho (Đã tích hợp đoạn code vá lỗi thông minh)
                foreach (var item in request.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                    if (variant == null)
                    {
                       throw new Exception($"Không tìm thấy cấu hình hợp lệ cho mã sản phẩm: {item.VariantId}");
                    }

                    // KIỂM TRA TỒN KHO TRƯỚC (Phát hiện lỗi Race Condition cơ bản)
                    if (variant.StockQuantity < item.Quantity)
                    {
                        throw new Exception($"Cấu hình {variant.Color} {variant.Storage} đã hết hàng hoặc không đủ số lượng!");
                    }

                    var orderItem = new OrderItem
                    {
                        OrderId = newOrder.Id,
                        VariantId = variant.Id,
                        Quantity = item.Quantity,
                        UnitPrice = variant.Price       //lỗi logic ở đây, ko check với database, có thể bị khách ảo giá (0 đ) qua f12, nên siết lại bằng cách kiểm tra với giá gốc trong database, sử dụng variant.Price
                    };
                    _context.OrderItems.Add(orderItem);

                    // Cập nhật tồn kho (đã đảm bảo đủ số lượng ở bước check phía trên)
                    variant.StockQuantity -= item.Quantity;
                    // Tính lũy kế tổng tiền của đơn hàng
                    totalAmount += (variant.Price * item.Quantity);
                }
                // Cập nhật lại tổng tiền (TotalAmount) đúng thực tế
                newOrder.TotalAmount = totalAmount;
                await _context.SaveChangesAsync();

                // NẾU MỌI THỨ SUÔN SẺ TỚI TẬN ĐÂY -> CHỐT SỔ XUỐNG DATABASE!
                await transaction.CommitAsync();

                return Ok(new { message = "Đặt hàng thành công!", orderId = newOrder.Id });
            }
            catch (Exception ex)
            {
                // NẾU CÓ LỖI XẢY RA Ở BẤT CỨ ĐÂU -> QUAY XE! (Hủy bỏ toàn bộ, không lưu vỏ đơn rác)
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi khi tạo đơn hàng: " + ex.Message });
            }
        }
    }
}