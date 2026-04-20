namespace MobileShop.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        
        // Tuyệt đối không lưu mật khẩu thật, chỉ lưu chuỗi đã mã hóa
        public string PasswordHash { get; set; } = string.Empty; 
        
        public string Role { get; set; } = "Admin"; // Phân quyền
    }
}