using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace GcDesignStudy.Api.Services;

/// <summary>DEV/TEST ONLY. Surfaces the X-User-Id header as a field in Swagger UI, next to DevHeaderAuthenticationHandler.</summary>
public class UserIdHeaderOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        operation.Parameters ??= new List<OpenApiParameter>();
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = DevHeaderAuthenticationHandler.UserIdHeader,
            In = ParameterLocation.Header,
            Required = false,
            Schema = new OpenApiSchema { Type = "string", Default = new Microsoft.OpenApi.Any.OpenApiString(DevHeaderAuthenticationHandler.DefaultTestUserId) },
            Description = "DEV ONLY: acts as this user. Defaults to a fixed test user if omitted.",
        });
    }
}
