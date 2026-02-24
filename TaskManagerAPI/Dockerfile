FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo para o container
COPY . .

# Restaura as dependências (ele já provou que funciona assim)
RUN dotnet restore

# AJUSTE AQUI: Removido o prefixo da pasta, pois o arquivo está na raiz
RUN dotnet publish "TaskManagerAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]