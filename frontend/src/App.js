import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  // Estados para manejar los datos y la interacción del usuario
  const [dataPoints, setDataPoints] = useState([]);             // Datos de temperatura
  const [paused, setPaused] = useState(false);                  // Controla si la actualización está pausada
  const [lastTemp, setLastTemp] = useState(null);               // Última temperatura registrada
  const [selectedDevice, setSelectedDevice] = useState('');     // Sensor seleccionado por el usuario
  const [deviceList, setDeviceList] = useState([]);             // Lista de sensores disponibles

  // Cargar la lista de sensores al iniciar la app
  useEffect(() => {
    fetch('http://localhost:3001/api/devices')
      .then(res => res.json())
      .then(data => setDeviceList(data))
      .catch(err => console.error('❌ Error al obtener sensores:', err));
  }, []);

  // Función para obtener datos de temperatura desde el backend
  const fetchData = () => {
    if (paused) return; // Si está pausado, no hace nada

    let url = 'http://localhost:3001/api/temperature';
    if (selectedDevice) {
      url += `?device_id=${selectedDevice}`; // Filtra por sensor si hay uno seleccionado
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Ordena los datos por fecha
        const sortedData = data.sort((a, b) => new Date(a.time) - new Date(b.time));
        setDataPoints(sortedData);

        // Guarda la última temperatura para alertas
        const last = sortedData[sortedData.length - 1];
        if (last) {
          setLastTemp(last.value);
        }
      })
      .catch(err => console.error('❌ Error al obtener temperatura:', err));
  };

  // Ejecuta `fetchData` cada 5 segundos, mientras no esté pausado
  useEffect(() => {
    fetchData(); // Llamado inicial
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, [paused, selectedDevice]); // Se reinicia si cambia el estado `paused` o el sensor seleccionado

  // Colores para cada sensor en el gráfico
  const colors = ['blue', 'red', 'green', 'orange', 'purple', 'teal', 'brown'];

  // Configura los datos para el gráfico de líneas
  let chartData;

  if (selectedDevice) {
    // Si se selecciona un sensor, se muestra solo su información
    const recentPoints = dataPoints.slice(-10); // Últimos 10 registros
    chartData = {
      labels: recentPoints.map(p => new Date(p.time).toLocaleTimeString()),
      datasets: [
        {
          label: `Sensor ${selectedDevice}`,
          data: recentPoints.map(p => p.value),
          borderColor: 'blue',
          tension: 0.1,
          fill: false,
        }
      ]
    };
  } else {
    // Si no hay sensor seleccionado, agrupa datos por sensor
    const groupedData = {};
    dataPoints.forEach(point => {
      const device = point.device_id || 'desconocido';
      if (!groupedData[device]) groupedData[device] = [];
      groupedData[device].push(point);
    });

    // Genera etiquetas comunes de tiempo para todos los sensores
    const allPoints = Object.values(groupedData).flat();
    const sortedAllPoints = allPoints.sort((a, b) => new Date(a.time) - new Date(b.time));
    const recentTimestamps = sortedAllPoints.slice(-10).map(p => new Date(p.time).toLocaleTimeString());

    // Configura un dataset por cada sensor
    chartData = {
      labels: recentTimestamps,
      datasets: Object.entries(groupedData).map(([device, points], index) => {
        const sortedPoints = points.sort((a, b) => new Date(a.time) - new Date(b.time));
        const recentValues = sortedPoints.slice(-10).map(p => p.value);
        return {
          label: `Sensor ${device}`,
          data: recentValues,
          borderColor: colors[index % colors.length],
          tension: 0.1,
          fill: false,
        };
      })
    };
  }

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '50px' }}>
      <h2>Temperatura - Últimos 30 minutos</h2>

      {/* Selector para elegir un sensor */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filtrar por sensor:</label>{' '}
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">Todos</option>
          {deviceList.map((device) => (
            <option key={device} value={device}>
              {device}
            </option>
          ))}
        </select>
      </div>

      {/* Botón para pausar/reanudar actualización */}
      <button
        onClick={() => setPaused(!paused)}
        style={{ marginBottom: '20px' }}
      >
        {paused ? 'Reanudar' : 'Pausar'}
      </button>

      {/* Alerta visual si la temperatura es muy alta */}
      {lastTemp !== null && lastTemp > 30 && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          ⚠️ ¡Temperatura alta detectada! ({lastTemp.toFixed(1)} °C)
        </p>
      )}

      {/* Renderiza el gráfico de líneas */}
      <Line data={chartData} />
    </div>
  );
}

export default App;
