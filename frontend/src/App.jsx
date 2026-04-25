import { useEffect, useState } from 'react';
import WeatherCard from './components/WeatherCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const API_502_MESSAGE = 'API indisponivel no momento trazendo um 502';

const initialForm = {
  cityQuery: '',
  date: '',
  time: '',
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [weather, setWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isSubmitDisabled = !selectedLocation || !form.date || loading || detectingLocation;

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
          throw new Error(payload.message || 'Nao foi possivel carregar as cidades.');
        }

        setLocationOptions(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationOptions([]);
          setLocationsError(error.message || 'Erro ao buscar cidades.');
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
  }, [form.cityQuery, selectedLocation]);

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

        throw new Error(payload.message || 'Nao foi possivel concluir a consulta.');
      }

      setWeather(payload);
    } catch (error) {
      setErrorMessage(error.message === API_502_MESSAGE ? API_502_MESSAGE : error.message || 'Erro inesperado.');
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
      setErrorMessage('Geolocalizacao nao suportada neste dispositivo.');
      return;
    }

    setDetectingLocation(true);
    setErrorMessage('');
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let locationName = 'Sua localizacao';
        let locationDisplayName = 'Sua localizacao atual';

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=pt`
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
          console.error('Erro ao buscar nome da cidade:', error);
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
        const message = error.code === 1
          ? 'Permita o acesso a localizacao para usar essa opcao.'
          : 'Nao foi possivel obter sua localizacao atual.';

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
            <span className="topbar__status">Dados ao vivo</span>
          </div>

          <div className="hero-copy reveal reveal-delay-1">
            <span className="eyebrow">Previsao do tempo</span>
            <h1>Um clima premium no seu bolso.</h1>
          </div>

          <form className="weather-form reveal reveal-delay-3" onSubmit={handleSubmit}>
            <div className="form-header">
              <div>
                <p className="form-label">Consulta personalizada</p>
                <h2>Escolha quando e onde deseja consultar</h2>
              </div>
              <span className="form-badge">Atualizado ao vivo</span>
            </div>

            <div className="field field--city">
              <span>Cidade</span>
              <div className="city-picker">
                <input
                  type="text"
                  name="cityQuery"
                  placeholder="Digite ao menos 2 letras para buscar"
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
                  {detectingLocation ? 'Localizando...' : 'Usar minha localizacao'}
                </button>
              </div>

              {selectedLocation && (
                <p className="helper-text helper-text--success">
                  Local selecionado: {selectedLocation.displayName}
                </p>
              )}

              {!selectedLocation && locationsLoading && (
                <p className="helper-text">Buscando cidades na API...</p>
              )}

              {!selectedLocation && locationsError && (
                <p className="helper-text helper-text--error">{locationsError}</p>
              )}

              {!selectedLocation && !locationsLoading && locationOptions.length > 0 && (
                <div className="city-options" role="listbox" aria-label="Cidades sugeridas">
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
                <span>Data</span>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </label>

               <label className="field">
                 <span>Hora</span>
                 <select
                   name="time"
                   value={form.time}
                   onChange={handleChange}
                 >
                   <option value="">-- Selecione uma hora --</option>
                   {Array.from({ length: 24 }, (_, i) =>
                     String(i).padStart(2, '0')
                   ).map((hour) => (
                     <option key={hour} value={hour}>
                       {hour}:00
                     </option>
                   ))}
                 </select>
               </label>
            </div>

            <div className="form-footer">
              <p className="helper-text">
                Escolha uma cidade da lista ou use sua localizacao. Se nenhuma hora for selecionada,
                a consulta sera feita para 12:00.
              </p>
              <button className="submit-button" type="submit" disabled={isSubmitDisabled}>
                <span>{loading ? 'Consultando...' : 'Consultar'}</span>
              </button>
            </div>
          </form>

          {loading && (
            <div className="status-box reveal" aria-live="polite">
              <span className="spinner" />
              <div>
                <strong>Buscando dados atualizados</strong>
                <p>Estamos consultando a previsao em tempo real para voce.</p>
              </div>
            </div>
          )}

          {errorMessage && !loading && (
            <div className="status-box error-box reveal" aria-live="polite">
              <div>
                <strong>Nao foi possivel concluir a consulta</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {weather && !loading && (
            <div className="reveal reveal-delay-4">
              <WeatherCard weather={weather} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
