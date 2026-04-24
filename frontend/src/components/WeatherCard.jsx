const weatherIcons = {
  CLEAR: '☀️',
  PARTLY_CLOUDY: '⛅',
  CLOUDY: '☁️',
  FOG: '🌫️',
  DRIZZLE: '🌦️',
  RAIN: '🌧️',
  SNOW: '❄️',
  THUNDER: '⛈️',
  VARIABLE: '🌤️',
};

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date(`${date}T12:00:00`));
}

function WeatherCard({ weather }) {
  const icon = weatherIcons[weather.iconCode] ?? weatherIcons.VARIABLE;
  const rainProgressStyle = {
    width: `${Math.min(Math.max(weather.rainProbability, 0), 100)}%`,
  };

  return (
    <article className="weather-card">
      <div className="weather-card__backdrop" />

      <div className="weather-card__header">
        <div className="weather-card__location">
          <p className="card-label">Resultado</p>
          <h2>{weather.city}</h2>
          <p className="card-meta">
            {formatDate(weather.date)} às {weather.time}
          </p>
        </div>

        <div className="weather-icon" aria-hidden="true">
          <span>{icon}</span>
        </div>
      </div>

      <div className="weather-card__hero">
        <div className="temperature-block">
          <p className="card-label">Temperatura</p>
          <p className="temperature">{Math.round(weather.temperature)}°C</p>
        </div>

        <div className="condition-badge">
          <p className="card-label">Condição</p>
          <strong>{weather.condition}</strong>
        </div>
      </div>

      <div className="weather-metrics">
        <div className="metric-card">
          <p className="card-label">Probabilidade de chuva</p>
          <div className="rain-stat">
            <strong>{weather.rainProbability}%</strong>
            <div className="rain-track" aria-hidden="true">
              <div className="rain-fill" style={rainProgressStyle} />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <p className="card-label">Resumo</p>
          <p className="metric-copy">
            Condição prevista para a cidade consultada no horário selecionado.
          </p>
        </div>
      </div>
    </article>
  );
}

export default WeatherCard;
