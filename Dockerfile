# Multi-stage build for .NET 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

# Copy solution and project files first to leverage Docker layer caching
COPY PatillaDash.slnx ./
COPY src/Backend/PatillaDash.Domain/*.csproj ./src/Backend/PatillaDash.Domain/
COPY src/Backend/PatillaDash.Application/*.csproj ./src/Backend/PatillaDash.Application/
COPY src/Backend/PatillaDash.Infrastructure/*.csproj ./src/Backend/PatillaDash.Infrastructure/
COPY src/Backend/PatillaDash.Api/*.csproj ./src/Backend/PatillaDash.Api/
COPY tests/Backend/PatillaDash.Tests/*.csproj ./tests/Backend/PatillaDash.Tests/

# Restore dependencies
RUN dotnet restore src/Backend/PatillaDash.Api/PatillaDash.Api.csproj

# Copy the rest of the source code
COPY src/Backend/ ./src/Backend/

# Build and publish release output
WORKDIR /app/src/Backend/PatillaDash.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Environment configuration
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "PatillaDash.Api.dll"]
