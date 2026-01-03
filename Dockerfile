# Build stage - Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/client
COPY src/wagaya-client/package*.json ./
RUN npm ci
COPY src/wagaya-client/ ./
RUN npm run build

# Build stage - Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS backend-build
WORKDIR /app
COPY src/WagayaDiscord.Server/*.csproj ./
RUN dotnet restore
COPY src/WagayaDiscord.Server/ ./
RUN dotnet publish -c Release -o /out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
COPY --from=backend-build /out ./
COPY --from=frontend-build /app/client/dist ./wwwroot/

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV ASPNETCORE_URLS=http://0.0.0.0:6120
EXPOSE 6120

ENTRYPOINT ["dotnet", "WagayaDiscord.Server.dll"]
