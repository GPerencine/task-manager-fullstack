FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo para dentro do container
COPY . .

# Restaura as dependências focando no arquivo de projeto
RUN dotnet restore "./TaskManagerAPI/TaskManagerAPI.csproj"

# Publica o projeto
RUN dotnet publish "./TaskManagerAPI/TaskManagerAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]