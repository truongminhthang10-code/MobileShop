using Microsoft.EntityFrameworkCore;
using MobileShop.Domain.Entities;

namespace MobileShop.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}
            public DbSet<Category> Categories { get; set; }
            public DbSet<Product> Products { get; set; }
            public DbSet<ProductVariant> ProductVariants { get; set; }
            public DbSet<ProductImage> ProductImages { get; set; }
            public DbSet<Specification> Specifications { get; set; }
            public DbSet<Order> Orders { get; set; }
            public DbSet<OrderItem> OrderItems { get; set; }
            public DbSet<User> Users { get; set; }
            public DbSet<Cart> Carts { get; set; }
            public DbSet<Review> Reviews { get; set; }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                // Đánh Index cho cột Status (Để lọc trạng thái nhanh hơn)
                modelBuilder.Entity<Order>()
                    .HasIndex(o => o.Status);

                // Đánh Index cho cột CreatedAt (Để sắp xếp ngày tháng nhanh hơn)
                modelBuilder.Entity<Order>()
                    .HasIndex(o => o.CreatedAt);
                // THÊM: Ngăn chặn một User tạo ra nhiều Cart với cùng một Variant
                modelBuilder.Entity<Cart>()
                    .HasIndex(c => new { c.UserId, c.VariantId })
                    .IsUnique();

                // THÊM: Ngăn chặn tạo User trùng tên đăng nhập
                modelBuilder.Entity<User>()
                    .HasIndex(u => u.Username)
                    .IsUnique();
                    
                // THÊM: Index cho các trường thường xuyên tìm kiếm
                modelBuilder.Entity<Product>().HasIndex(p => p.Name);
                modelBuilder.Entity<User>().HasIndex(u => u.Email);

                // QUAN TRỌNG: Ngăn chặn xóa Variant (cấu hình) nếu nó đã từng nằm trong một Đơn Hàng (Bảo vệ dữ liệu kế toán)
                // modelBuilder.Entity<OrderItem>()
                //     .HasOne(oi => oi.Variant)
                //     .WithMany(v => v.OrderItems)
                //     .HasForeignKey(oi => oi.VariantId)
                //     .OnDelete(DeleteBehavior.Restrict); // Đổi từ Cascade thành Restrict
            }
        
    }
}