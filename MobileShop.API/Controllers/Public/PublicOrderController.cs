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

            decimal totalAmount = request.OrderItems.Sum(i => i.UnitPrice * i.Quantity);

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
                    TotalAmount = totalAmount,
                    Status = 0, 
                    CreatedAt = DateTime.UtcNow,
                    UserId = currentUser?.Id 
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync(); // Vẫn lưu để lấy ID, nhưng DB sẽ "giữ chỗ" chờ lệnh Commit

                // 2. Lưu từng món hàng và Trừ kho (Đã tích hợp đoạn code vá lỗi thông minh)
                foreach (var item in request.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                    if (variant == null)
                    {
                        variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.ProductId == item.VariantId);
                    }

                    if (variant == null) 
                    {
                        throw new Exception($"Không tìm thấy cấu hình hợp lệ cho mã sản phẩm: {item.VariantId}");
                    }

                    var orderItem = new OrderItem
                    {
                        OrderId = newOrder.Id,
                        VariantId = variant.Id,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    };
                    _context.OrderItems.Add(orderItem);

                    if (variant.StockQuantity >= item.Quantity)
                        variant.StockQuantity -= item.Quantity;
                    else
                        variant.StockQuantity = 0; 
                }

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