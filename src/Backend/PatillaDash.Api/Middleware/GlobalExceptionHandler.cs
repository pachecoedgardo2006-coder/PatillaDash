using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace PatillaDash.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Ocurrió una excepción no controlada: {Message}", exception.Message);

        var (statusCode, title) = exception switch
        {
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Operación inválida"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Parámetros inválidos"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "No autorizado"),
            _ => (StatusCodes.Status500InternalServerError, "Error interno del servidor")
        };

        var detail = (statusCode == StatusCodes.Status500InternalServerError && _env.IsProduction())
            ? "Ocurrió un error inesperado al procesar la solicitud. Por favor contacte al soporte o intente más tarde."
            : exception.Message;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
