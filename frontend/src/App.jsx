import { useEffect, useState } from 'react';
import WeatherCard from './components/WeatherCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const API_502_MESSAGE = 'API indisponivel no momento trazendo um 502';

const languages = {
  pt: 'Português',
  en: 'English',
};

const copy = {
  pt: {
    liveData: 'Dados ao vivo',
    eyebrow: 'Previsao do tempo',
    title: 'Clima premium no seu bolso.',
    formLabel: 'Consulta personalizada',
    formTitle: 'Escolha quando e onde deseja consultar',
    formBadge: 'Atualizado ao vivo',
    city: 'Cidade',
    cityPlaceholder: 'Digite pelo menos 2 caracteres para buscar',
    locating: 'Localizando...',
    useLocation: 'Usar minha localizacao',
    selectedLocation: 'Local selecionado:',
    searchingCities: 'Buscando cidades na API...',
    suggestedCities: 'Cidades sugeridas',
    date: 'Data',
    time: 'Hora',
    selectHour: '-- Selecione uma hora --',
    helper: 'Escolha uma cidade na lista ou use sua localizacao. Se nenhuma hora for selecionada, a consulta sera feita para 12:00.',
    loadingButton: 'Consultando...',
    submit: 'Consultar',
    loadingTitle: 'Buscando dados atualizados',
    loadingText: 'Estamos consultando a previsao em tempo real para voce.',
    errorTitle: 'Nao foi possivel concluir a consulta',
    geolocationUnsupported: 'Geolocalizacao nao suportada neste dispositivo.',
    currentLocationName: 'Sua localizacao',
    currentLocationDisplay: 'Sua localizacao atual',
    reverseGeocodeError: 'Erro ao buscar o nome da cidade:',
    allowLocation: 'Permita o acesso a localizacao para usar esta opcao.',
    currentLocationError: 'Nao foi possivel obter sua localizacao atual.',
    loadCitiesError: 'Nao foi possivel carregar as cidades.',
    searchCitiesError: 'Erro ao buscar cidades.',
    queryError: 'Nao foi possivel concluir a consulta.',
    unexpectedError: 'Erro inesperado.',
  },
  en: {
    liveData: 'Live data',
    eyebrow: 'Weather forecast',
    title: 'Premium weather in your pocket.',
    formLabel: 'Custom forecast',
    formTitle: 'Choose when and where to check',
    formBadge: 'Updated live',
    city: 'City',
    cityPlaceholder: 'Type at least 2 characters to search',
    locating: 'Locating...',
    useLocation: 'Use my location',
    selectedLocation: 'Selected location:',
    searchingCities: 'Searching cities in the API...',
    suggestedCities: 'Suggested cities',
    date: 'Date',
    time: 'Time',
    selectHour: '-- Select an hour --',
    helper: 'Choose a city from the list or use your location. If no hour is selected, the forecast will be checked for 12:00.',
    loadingButton: 'Checking...',
    submit: 'Check forecast',
    loadingTitle: 'Fetching updated data',
    loadingText: 'We are checking the real-time forecast for you.',
    errorTitle: 'Could not complete the request',
    geolocationUnsupported: 'Geolocation is not supported on this device.',
    currentLocationName: 'Your location',
    currentLocationDisplay: 'Your current location',
    reverseGeocodeError: 'Error while looking up the city name:',
    allowLocation: 'Please allow location access to use this option.',
    currentLocationError: 'Could not get your current location.',
    loadCitiesError: 'Could not load cities.',
    searchCitiesError: 'Error while searching cities.',
    queryError: 'Could not complete the request.',
    unexpectedError: 'Unexpected error.',
  },
};

const errorTranslations = {
  'Nao ha previsao disponivel para a data e hora informadas.': {
    pt: 'Nao ha previsao disponivel para a data e hora informadas.',
    en: 'No forecast is available for the selected date and time.',
  },
  'Digite pelo menos 2 caracteres para buscar cidades.': {
    pt: 'Digite pelo menos 2 caracteres para buscar cidades.',
    en: 'Type at least 2 characters to search for cities.',
  },
  'Selecione uma cidade na lista ou use a localizacao atual.': {
    pt: 'Selecione uma cidade na lista ou use a localizacao atual.',
    en: 'Select a city from the list or use your current location.',
  },
  'Latitude e longitude precisam ser informadas juntas.': {
    pt: 'Latitude e longitude precisam ser informadas juntas.',
    en: 'Latitude and longitude must be provided together.',
  },
  'Latitude invalida.': { pt: 'Latitude invalida.', en: 'Invalid latitude.' },
  'Longitude invalida.': { pt: 'Longitude invalida.', en: 'Invalid longitude.' },
  'A data precisa ser hoje ou futura.': {
    pt: 'A data precisa ser hoje ou futura.',
    en: 'The date must be today or in the future.',
  },
  'A API utilizada permite consultar ate 16 dias a partir de hoje.': {
    pt: 'A API utilizada permite consultar ate 16 dias a partir de hoje.',
    en: 'The API allows forecasts up to 16 days from today.',
  },
  'Cidade nao encontrada.': { pt: 'Cidade nao encontrada.', en: 'City not found.' },
  [API_502_MESSAGE]: {
    pt: 'API indisponivel no momento retornando 502.',
    en: 'The API is currently unavailable and returned 502.',
  },
  'Erro interno ao processar a solicitacao.': {
    pt: 'Erro interno ao processar a solicitacao.',
    en: 'Internal error while processing the request.',
  },
  'Requisicao invalida.': { pt: 'Requisicao invalida.', en: 'Invalid request.' },
  'Formato de requisicao invalido.': {
    pt: 'Formato de requisicao invalido.',
    en: 'Invalid request format.',
  },
  'A data e obrigatoria.': { pt: 'A data e obrigatoria.', en: 'Date is required.' },
  'A data é obrigatória.': { pt: 'A data e obrigatoria.', en: 'Date is required.' },
};

function translateError(message, language) {
  if (!message) return '';
  return errorTranslations[message]?.[language] || message;
}

const initialForm = {
  cityQuery: '',
  date: '',
  time: '',
};

function App() {
  const [language, setLanguage] = useState('pt');
  const [form, setForm] = useState(initialForm);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [weather, setWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const t = copy[language];
  const isSubmitDisabled = !selectedLocation || !form.date || loading || detectingLocation;

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  }, [language]);

  useEffect(() => {
    const query = form.cityQuery.trim();

    if (selectedLocation && query === selectedLocation.displayName) {
      return undefined;
    }

    if (query.length < 2) {
      setLocationOptions([]);
      setLocationsLoading(false);
      setLocationsError('');
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLocationsLoading(true);
      setLocationsError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/locations?query=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        const payload = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(payload.message || t.loadCitiesError);
        }

        setLocationOptions(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationOptions([]);
          setLocationsError(translateError(error.message, language) || t.searchCitiesError);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLocationsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [form.cityQuery, selectedLocation, language, t.loadCitiesError, t.searchCitiesError]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setWeather(null);

    try {
      const response = await fetch(`${API_BASE_URL}/weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: selectedLocation.name ?? null,
          label: selectedLocation.displayName,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          date: form.date,
          time: form.time ? `${form.time}:00` : null,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 502) {
          throw new Error(API_502_MESSAGE);
        }

        throw new Error(payload.message || t.queryError);
      }

      setWeather(payload);
    } catch (error) {
      setErrorMessage(translateError(error.message || t.unexpectedError, language));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === 'cityQuery') {
      setSelectedLocation(null);
      setWeather(null);
      setErrorMessage('');
      setLocationsError('');
      setForm((currentForm) => ({
        ...currentForm,
        cityQuery: value,
      }));
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSelectLocation(location) {
    setSelectedLocation(location);
    setLocationOptions([]);
    setLocationsError('');
    setForm((currentForm) => ({
      ...currentForm,
      cityQuery: location.displayName,
    }));
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setErrorMessage(t.geolocationUnsupported);
      return;
    }

    setDetectingLocation(true);
    setErrorMessage('');
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let locationName = t.currentLocationName;
        let locationDisplayName = t.currentLocationDisplay;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=${language === 'pt' ? 'pt' : 'en'}`,
          );
          if (response.ok) {
            const data = await response.json();
            const city = data.city || data.locality;
            if (city) {
              locationName = city;
              locationDisplayName = data.principalSubdivision
                ? `${city}, ${data.principalSubdivision}`
                : city;
            }
          }
        } catch (error) {
          console.error(t.reverseGeocodeError, error);
        }

        const deviceLocation = {
          name: locationName,
          displayName: locationDisplayName,
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        };

        setSelectedLocation(deviceLocation);
        setLocationOptions([]);
        setLocationsError('');
        setForm((currentForm) => ({
          ...currentForm,
          cityQuery: deviceLocation.displayName,
        }));
        setDetectingLocation(false);
      },
      (error) => {
        const message = error.code === 1 ? t.allowLocation : t.currentLocationError;

        setErrorMessage(message);
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="ambient ambient--three" />

      <section className="device-frame">
        <div className="device-glow" />

        <div className="hero-panel">
          <div className="topbar">
            <span className="topbar__time">SimpleWeather</span>
            <div className="topbar__actions">
              <span className="topbar__status">{t.liveData}</span>
              <label className="language-switcher">
                <span className="sr-only">{language === 'pt' ? 'Idioma' : 'Language'}</span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                  {Object.entries(languages).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="hero-copy reveal reveal-delay-1">
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
          </div>

          <form className="weather-form reveal reveal-delay-3" onSubmit={handleSubmit}>
            <div className="form-header">
              <div>
                <p className="form-label">{t.formLabel}</p>
                <h2>{t.formTitle}</h2>
              </div>
              <span className="form-badge">{t.formBadge}</span>
            </div>

            <div className="field field--city">
              <span>{t.city}</span>
              <div className="city-picker">
                <input
                  type="text"
                  name="cityQuery"
                  placeholder={t.cityPlaceholder}
                  value={form.cityQuery}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />

                <button
                  className="location-button"
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={detectingLocation || loading}
                >
                  {detectingLocation ? t.locating : t.useLocation}
                </button>
              </div>

              {selectedLocation && (
                <p className="helper-text helper-text--success">
                  {t.selectedLocation} {selectedLocation.displayName}
                </p>
              )}

              {!selectedLocation && locationsLoading && (
                <p className="helper-text">{t.searchingCities}</p>
              )}

              {!selectedLocation && locationsError && (
                <p className="helper-text helper-text--error">{locationsError}</p>
              )}

              {!selectedLocation && !locationsLoading && locationOptions.length > 0 && (
                <div className="city-options" role="listbox" aria-label={t.suggestedCities}>
                  {locationOptions.map((location) => (
                    <button
                      key={`${location.latitude}-${location.longitude}-${location.displayName}`}
                      type="button"
                      className="city-option"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <strong>{location.name}</strong>
                      <span>{location.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="field-row">
              <label className="field">
                <span>{t.date}</span>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </label>

              <label className="field">
                <span>{t.time}</span>
                <select name="time" value={form.time} onChange={handleChange}>
                  <option value="">{t.selectHour}</option>
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:00
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-footer">
              <p className="helper-text">{t.helper}</p>
              <button className="submit-button" type="submit" disabled={isSubmitDisabled}>
                <span>{loading ? t.loadingButton : t.submit}</span>
              </button>
            </div>
          </form>

          {loading && (
            <div className="status-box reveal" aria-live="polite">
              <span className="spinner" />
              <div>
                <strong>{t.loadingTitle}</strong>
                <p>{t.loadingText}</p>
              </div>
            </div>
          )}

          {errorMessage && !loading && (
            <div className="status-box error-box reveal" aria-live="polite">
              <div>
                <strong>{t.errorTitle}</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {weather && !loading && (
            <div className="reveal reveal-delay-4">
              <WeatherCard weather={weather} language={language} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
