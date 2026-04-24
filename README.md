# SimpleWeather

Aplicacao full-stack de previsao do tempo com frontend em React e backend em Spring Boot, usando dados reais da Open-Meteo.

## Estrutura

- `src/main/java`: backend Spring Boot organizado em MVC (`controller`, `service`, `client`)
- `frontend`: frontend React com Vite

## Como executar

### Backend

1. No diretorio raiz do projeto, execute:

```bash
./mvnw spring-boot:run
```

No Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

O backend sobe em `http://localhost:8080`.

### Frontend

1. Entre na pasta `frontend`
2. Instale as dependencias
3. Rode o servidor de desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

No Windows PowerShell, se a politica de execucao bloquear `npm`, use:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

## Requisicao esperada pelo backend

`POST /weather`

```json
{
  "city": "Sao Paulo",
  "date": "2026-04-24",
  "time": "14:00"
}
```

O campo `time` e opcional. Se ele nao for informado, o backend consulta `12:00`.

## API externa real

Esta aplicacao usa:

- geocodificacao: `https://geocoding-api.open-meteo.com/v1/search`
- previsao horaria: `https://api.open-meteo.com/v1/forecast`

Nenhum dado mockado e retornado. Se a API externa falhar, o backend responde com `502 Bad Gateway` e o frontend mostra:

`API indisponível no momento trazendo um 502`

## Observacoes

- A Open-Meteo disponibiliza previsao para ate 16 dias a partir da data atual.
- O input de hora trabalha com intervalos de 1 hora para combinar com a previsao horaria da API.
