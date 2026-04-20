# 📱 MobileShop Project Handover (Backend & Admin)

Hoàn thiện bộ khung Backend và trang Quản trị. Dưới đây là hướng dẫn để bắt đầu làm phần Client.

## 🛠 1. Yêu cầu hệ thống
- **.NET SDK 9.0**: [Tải tại đây](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- **Node.js** (Bản LTS)
- **MySQL/XAMPP/WAMP**

## 🚀 2. Thiết lập môi trường LOCAL
1. **Database**: Mở XAMPP/MySQL, tạo một DB tên là `MobileShopDb`.
2. **Kết nối**: Kiểm tra file `MobileShop.API/appsettings.json`. Nếu MySQL của bạn có mật khẩu, hãy điền vào `Password=...`.
3. **Khởi tạo bảng**: Mở Terminal tại thư mục gốc và chạy:
   ```bash
   dotnet ef database update --project MobileShop.Infrastructure --startup-project MobileShop.API