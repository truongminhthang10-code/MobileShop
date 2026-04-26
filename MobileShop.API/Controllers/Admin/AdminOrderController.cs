using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileShop.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using MobileShop.API.DTOs;
namespace MobileShop.API.Controllers.Admin
{

    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "Admin,Staff")]
    public class AdminOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Lấy toàn bộ danh sách đơn hàng (Sắp xếp đơn mới nhất lên đầu)
       // 1. Lấy toàn bộ danh sách đơn hàng (Có hỗ trợ Lọc và Tìm kiếm)
        [HttpGet]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] int pageNumber = 1, // Mặc định trang 1
            [FromQuery] int pageSize = 10,  // Mặc định 10 đơn mỗi trang
            [FromQuery] int? status = null, 
            [FromQuery] string? phone = null)
        {
            // 1. Tối ưu hiệu suất bằng AsNoTracking vì đây là lệnh chỉ đọc (Read-only)
            var query = _context.Orders.AsNoTracking().AsQueryable();

            // 2. Áp dụng các bộ lọc (Filters)
            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (!string.IsNullOrEmpty(phone))
            {
                query = query.Where(o => o.PhoneNumber.Contains(phone));
            }

            // 3. Giới hạn pageSize để tránh trường hợp bị yêu cầu quá nhiều dữ liệu cùng lúc
            if (pageSize > 100) pageSize = 100;

            // 4. Tính tổng số lượng bản ghi thỏa mãn điều kiện lọc (trước khi phân trang)
            var totalCount = await query.CountAsync();

            // 5. Thực hiện phân trang với Skip và Take
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize) // Bỏ qua các bản ghi của các trang trước
                .Take(pageSize)                   // Lấy đúng số lượng của trang hiện tại
                .Select(o => new {
                    o.Id,
                    o.CustomerName,
                    o.PhoneNumber,
                    o.TotalAmount,
                    o.Status,
                    o.CreatedAt,
                    o.PaymentMethod
                })
                .ToListAsync();

            // 6. Trả về đối tượng PagedResult đã tạo trước đó
            var result = new PagedResult<object>
            {
                Items = orders.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return Ok(result);
        }

        // 2. Cập nhật trạng thái đơn hàng (Ví dụ: Từ Chờ xác nhận sang Đã xác nhận)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] int newStatus)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound("Không tìm thấy đơn hàng.");

            // Cập nhật trạng thái
            order.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công!" });
        }

        // 3. Lấy chi tiết một đơn hàng theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Variant) // Nối vào bảng Biến thể để lấy Màu, Giá
                        .ThenInclude(v => v.Product) // Nối tiếp vào bảng Sản phẩm để lấy Tên
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Không tìm thấy đơn hàng.");

            // Format lại dữ liệu trả về cho đẹp và dễ đọc ở Frontend
            var result = new 
            {
                order.Id,
                order.CustomerName,
                order.PhoneNumber,
                order.Address,
                order.PaymentMethod,
                order.ShippingMethod,
                order.Status,
                order.TotalAmount,
                order.CreatedAt,
                
                // Danh sách các món hàng trong đơn này
                Items = order.OrderItems.Select(i => new 
                {
                    i.Id,
                    ProductName = i.Variant?.Product?.Name ?? "Sản phẩm không còn tồn tại",
                    Color = i.Variant?.Color,
                    Storage = i.Variant?.Storage,
                    i.Quantity,
                    i.UnitPrice, // Giá lúc khách mua
                    SubTotal = i.Quantity * i.UnitPrice, // Thành tiền của món này
                    ImageUrl = i.Variant?.ImageUrl
                })
            };

            return Ok(result);
        }

        // 4. Hủy đơn hàng và tự động hoàn lại Tồn kho
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            // Tìm đơn hàng, bắt buộc Include OrderItems để lấy số lượng cần hoàn
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Không tìm thấy đơn hàng.");

            // Kiểm tra logic nghiệp vụ
            if (order.Status == 4) return BadRequest("Đơn hàng này đã bị hủy từ trước.");
            if (order.Status == 3) return BadRequest("Đơn hàng đã giao hoàn thành, không thể hủy.");

            // Bắt đầu vòng lặp: Hoàn lại số lượng tồn kho cho từng món hàng
            foreach (var item in order.OrderItems)
            {
                var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                if (variant != null)
                {
                    variant.StockQuantity += item.Quantity; // Cộng số lượng khách đã đặt về lại kho
                }
            }

            // Cập nhật trạng thái thành 4 (Đã hủy)
            order.Status = 4;
            
            // Lưu một lần duy nhất cho toàn bộ thay đổi (Status + Kho)
            await _context.SaveChangesAsync(); 

            return Ok(new { message = "Hủy đơn hàng và hoàn kho thành công!" });
        }
    }
}