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

const copy = {
  pt: {
    result: 'Resultado',
    at: 'as',
    temperature: 'Temperatura',
    condition: 'Condicao',
    rainProbability: 'Probabilidade de chuva',
    summary: 'Resumo',
    summaryText: 'Condicoes previstas para a cidade consultada no horario selecionado.',
  },
  en: {
    result: 'Result',
    at: 'at',
    temperature: 'Temperature',
    condition: 'Condition',
    rainProbability: 'Rain probability',
    summary: 'Summary',
    summaryText: 'Forecast conditions for the selected city at the chosen time.',
  },
};

const conditionTranslations = {
  'Ceu limpo': { pt: 'Ceu limpo', en: 'Clear sky' },
  'Céu limpo': { pt: 'Ceu limpo', en: 'Clear sky' },
  'Parcialmente nublado': { pt: 'Parcialmente nublado', en: 'Partly cloudy' },
  Nublado: { pt: 'Nublado', en: 'Cloudy' },
  Nevoeiro: { pt: 'Nevoeiro', en: 'Fog' },
  Garoa: { pt: 'Garoa', en: 'Drizzle' },
  Chuva: { pt: 'Chuva', en: 'Rain' },
  Neve: { pt: 'Neve', en: 'Snow' },
  Tempestade: { pt: 'Tempestade', en: 'Thunderstorm' },
  'Condicao variavel': { pt: 'Condicao variavel', en: 'Variable conditions' },
  'Condição variável': { pt: 'Condicao variavel', en: 'Variable conditions' },
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    dateStyle: 'full',
  }).format(new Date(`${date}T12:00:00`));
}

function WeatherCard({ weather, language = 'pt' }) {
  const t = copy[language];
  const icon = weatherIcons[weather.iconCode] ?? weatherIcons.VARIABLE;
  const rainProgressStyle = {
    width: `${Math.min(Math.max(weather.rainProbability, 0), 100)}%`,
  };

  const translatedCondition = conditionTranslations[weather.condition]?.[language] || weather.condition;

  return (
    <article className="weather-card">
      <div className="weather-card__backdrop" />

      <div className="weather-card__header">
        <div className="weather-card__location">
          <p className="card-label">{t.result}</p>
          <h2>{weather.city}</h2>
          <p className="card-meta">
            {formatDate(weather.date, language)} {t.at} {weather.time}
          </p>
        </div>

        <div className="weather-icon" aria-hidden="true">
          <span>{icon}</span>
        </div>
      </div>

      <div className="weather-card__hero">
        <div className="temperature-block">
          <p className="card-label">{t.temperature}</p>
          <p className="temperature">{Math.round(weather.temperature)}°C</p>
        </div>

        <div className="condition-badge">
          <p className="card-label">{t.condition}</p>
          <strong>{translatedCondition}</strong>
        </div>
      </div>

      <div className="weather-metrics">
        <div className="metric-card">
          <p className="card-label">{t.rainProbability}</p>
          <div className="rain-stat">
            <strong>{weather.rainProbability}%</strong>
            <div className="rain-track" aria-hidden="true">
              <div className="rain-fill" style={rainProgressStyle} />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <p className="card-label">{t.summary}</p>
          <p className="metric-copy">{t.summaryText}</p>
        </div>
      </div>
    </article>
  );
}

export default WeatherCard;
