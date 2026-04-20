using System;
using System.Collections.Generic;

namespace MobileShop.API.DTOs // Đảm bảo namespace này khớp với thư mục của bạn
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new(); // Cần dùng System.Collections.Generic
        public int TotalCount { get; set; }        
        public int PageNumber { get; set; }        
        public int PageSize { get; set; }          
        
        // Cần dùng System cho hàm Math.Ceiling
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize); 
    }
}