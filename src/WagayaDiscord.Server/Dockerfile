FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./

# Expose ports (5000 for http, 5001 for https)
EXPOSE 5000
EXPOSE 5001

# Run with dotnet watch for hot reload
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5000"]
