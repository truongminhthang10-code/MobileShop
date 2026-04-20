using System.Net;
using System.Text.Json;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try { await _next(context); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Một lỗi không mong muốn đã xảy ra.");
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new {
                StatusCode = context.Response.StatusCode,
                Message = "Hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau!"
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}