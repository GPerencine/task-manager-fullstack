FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia e restaura dependências primeiro (otimização de cache do Docker)
COPY ["TaskManagerAPI.csproj", "./"]
RUN dotnet restore

# Copia o restante do código-fonte e publica
COPY . .
RUN dotnet publish "TaskManagerAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway injeta a variável PORT — o ASP.NET Core lê ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

# Executa o contêiner com privilégios reduzidos utilizando o usuário 'app' nativo do .NET 8
USER app
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]