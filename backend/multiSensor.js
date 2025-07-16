// Importa Axios para hacer solicitudes HTTP
const axios = require('axios');

// 🔧 Lista de sensores simulados con valores iniciales
const sensors = [
  { device_id: 'sensorA', client_id: 'client1', sensor_type: 'temperature', temperature: 22 },
  { device_id: 'sensorB', client_id: 'client1', sensor_type: 'temperature', temperature: 25 },
  { device_id: 'sensorC', client_id: 'client2', sensor_type: 'temperature', temperature: 28 }
];

// 🔁 Función que genera una nueva temperatura basada en la anterior
// La temperatura varía aleatoriamente dentro de un rango pequeño
function generateRandomTemp(base) {
  const diff = Math.random() * 0.5; // Variación máxima de ±0.5 °C
  return Math.random() > 0.5
    ? Math.min(base + diff, 35)     // No supera los 35 °C
    : Math.max(base - diff, 10);    // No baja de 10 °C
}

// 📡 Cada 5 segundos, cada sensor genera y envía un nuevo valor
setInterval(() => {
  sensors.forEach(sensor => {
    // Actualiza la temperatura del sensor simulando una lectura real
    sensor.temperature = generateRandomTemp(sensor.temperature);

    // Envía los datos al backend vía POST
    axios.post('http://localhost:3001/api/insert', {
      temperature: sensor.temperature,
      device_id: sensor.device_id,
      client_id: sensor.client_id,
      sensor_type: sensor.sensor_type,
      timestamp: Date.now() // Marca temporal del momento actual
    })
      .then(() => {
        // ✅ Muestra en consola que el envío fue exitoso
        console.log(`✔ ${sensor.device_id}: ${sensor.temperature.toFixed(2)} °C`);
      })
      .catch(err => {
        // ❌ Muestra errores si la solicitud falla
        console.error(`❌ ${sensor.device_id}:`, err.message);
      });
  });
}, 5000); // ⏱ Intervalo de 5 segundos
