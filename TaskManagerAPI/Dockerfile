FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Busca qualquer arquivo .csproj no repositório e restaura
COPY . .
RUN dotnet restore

# Compila o projeto especificando o caminho do arquivo
RUN dotnet publish "TaskManagerAPI/TaskManagerAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Verifique se o nome da DLL gerada é exatamente este:
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]