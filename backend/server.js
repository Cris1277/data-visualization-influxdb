require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Variables de entorno para conexión con InfluxDB
const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

// 🔌 Crear cliente y APIs de escritura y consulta
const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);
const queryApi = client.getQueryApi(org);

// 📥 Ruta para insertar datos simulados desde mockSensor.js
app.post('/api/insert', (req, res) => {
  const {
    temperature,
    device_id,
    client_id,
    sensor_type,
    timestamp
  } = req.body;

  // ✅ Validación básica
  if (!temperature || !device_id) {
    return res.status(400).send('Faltan datos: temperature o device_id');
  }

  // 📌 Crear punto de datos con múltiples tags (sensor_type como measurement)
  const point = new Point(sensor_type || 'temperature')
    .tag('device_id', device_id)
    .tag('client_id', client_id || 'unknown')
    .floatField('value', temperature)
    .timestamp(timestamp ? new Date(timestamp) : new Date());

  // 📝 Escribir en InfluxDB
  writeApi.writePoint(point);

  // 💾 Confirmar la escritura
  writeApi.flush()
    .then(() => res.json({ success: true }))
    .catch(err => {
      console.error('Error al escribir en InfluxDB', err);
      res.status(500).send('Error al insertar');
    });
});

// 📊 Ruta para consultar datos de los últimos 30 minutos
app.get('/api/temperature', async (req, res) => {
  const device = req.query.device_id || ''; // permite filtrar por sensor específico

  // 🧠 Consulta Flux para obtener datos de la medida `temperature`
  let fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30m)
      |> filter(fn: (r) => r._field == "value")
  `;

  // 🔍 Si se especifica un sensor, filtrar por su device_id
  if (device) {
    fluxQuery += `
      |> filter(fn: (r) => r.device_id == "${device}")
    `;
  }

  const results = [];

  // 🚀 Ejecutar la consulta y recolectar resultados
  queryApi.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      results.push({
        time: o._time,
        value: o._value,
        device_id: o.device_id
      });
    },
    error(error) {
      console.error('Error en consulta Flux', error);
      res.status(500).send('Error al consultar');
    },
    complete() {
      res.json(results);
    }
  });
});

// 📄 Ruta para devolver la lista de sensores únicos (device_id)
app.get('/api/devices', async (req, res) => {
  const fluxQuery = `
    import "influxdata/influxdb/schema"
    schema.tagValues(
      bucket: "${bucket}",
      tag: "device_id"
    )
  `;

  const devices = [];

  queryApi.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      devices.push(o._value);
    },
    error(err) {
      console.error('Error al obtener lista de sensores', err);
      res.status(500).send('Error al obtener sensores');
    },
    complete() {
      res.json(devices);
    }
  });
});

// 🚀 Levantar el servidor
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});
