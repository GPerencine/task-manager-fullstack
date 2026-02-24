FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo de projeto de dentro da pasta
COPY TaskManagerAPI/TaskManagerAPI.csproj ./
RUN dotnet restore

# Copia tudo e publica
COPY TaskManagerAPI/ .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Garanta que o nome da DLL seja exatamente TaskManagerAPI.dll
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]