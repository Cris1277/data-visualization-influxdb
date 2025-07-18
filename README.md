# 🌡️ Scientific Data Visualization Demo

This is a full-stack demo project that simulates a real-time data monitoring system using **Node.js**, **InfluxDB**, and **React**. It was built as a learning project to demonstrate skills in backend development, time-series data processing, and frontend data visualization — especially for scientific and sensor-based applications.

> 🔗 **Live Demo**: [https://stirring-licorice-c513d5.netlify.app/](https://stirring-licorice-c513d5.netlify.app/)

## 🔧 Technologies Used

- **Backend**: Node.js, Express, InfluxDB Client, dotenv
- **Database**: InfluxDB OSS 2.x (time-series database)
- **Frontend**: React.js, Chart.js via react-chartjs-2
- **Other**: CORS, RESTful API, simulated data injection

## ⚙️ Features

- Insert temperature data with timestamps into InfluxDB
- Retrieve and visualize the last 30 minutes of data
- Full REST API between backend and frontend
- Dynamic chart rendering with auto-scaling time axis
- Simulates real-time data from **multiple sensors** using `multiSensor.js`
- Filter by specific sensor or view all sensors at once
- Each sensor is displayed in a **distinct color** on the chart
- **Pause / Resume** button to control live updates
- Displays a warning alert if temperature exceeds 30 °C

## 📁 Project Structure

```
influx-demo/
├── backend/
│   ├── server.js         # Express API with InfluxDB integration
│   ├── multiSensor.js    # Simulates temperature data from multiple devices
│   └── .env              # InfluxDB connection credentials
├── frontend/
│   ├── src/App.js        # React app with dynamic sensor chart
│   └── public/index.html
```

## 🚀 Getting Started

### 1. Start InfluxDB locally

Download and run InfluxDB OSS 2.7 from:  
https://dl.influxdata.com/influxdb/releases/influxdb2-2.7.12-windows.zip

Run:
```bash
cd InfluxDB
./influxd
```

Visit http://localhost:8086 and complete the setup wizard.  
Create:
- Org: `my-org`
- Bucket: `demo_temp`
- Save your generated **token**

### 2. Run the backend

```bash
cd backend
npm install
```

Create a `.env` file with:

```env
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your_token_here
INFLUX_ORG=my-org
INFLUX_BUCKET=demo_temp
PORT=3001
```

Start the server:

```bash
node server.js
```

Optionally, start the sensor simulator:

```bash
node multiSensor.js
```

### 3. Run the frontend

```bash
cd ../frontend
npm install
npm start
```

Then open your browser at:  
[http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

- `POST /api/insert`  
  Insert a temperature value:
  ```json
  { "temperature": 25.5, "device_id": "sensorA" }
  ```

- `GET /api/temperature`  
  Returns the last 30 minutes of temperature data  
  Supports optional filtering by `device_id`:
  ```
  /api/temperature?device_id=sensorA
  ```

- `GET /api/devices`  
  Returns a list of all unique `device_id` values from recent data

## 🎯 Motivation

This project was created as part of a technical preparation for a junior-level role in scientific computing and real-time data visualization. It reflects my ability to learn fast, build working systems, and apply backend/frontend knowledge to real-world scenarios.

## 📈 Future Improvements

- Add support for other sensor types
- Live updating charts (improved refresh rates)
- UI input to insert data directly
- Time range selection (1h, 6h, 24h)
- Docker + docker-compose setup
- Sensor status indicators (online/offline)
- Historical data export to CSV or JSON

## ⚠️ Known Limitation & Explanation

When visualizing **all sensors at once**, some timestamps on the X-axis may appear **duplicated or misaligned**. This happens because each sensor generates data independently, and multiple readings may share the exact same timestamp (e.g., `2:51:00` from several sensors). Chart.js renders those repeated timestamps as-is, which may lead to overlapping or jagged visuals.

**Why it was left this way:**  
To keep the code simple and easy to explain during interviews, I chose not to normalize timestamps or fill missing values with nulls across all datasets. Instead, users can filter by a single sensor to view a clean, aligned chart.

**How it could be improved:**  
In a more advanced version, I could normalize the X-axis to a common time base (e.g., 1-point every 5 seconds), and align all sensors to it. That would involve filling gaps with `null` values to keep each dataset aligned, producing a cleaner and more accurate multi-line chart.

This trade-off was intentional, balancing clarity with functionality for a demo project.

## 👨‍💻 Author

**Cristian [cris1277]**   
🔗 [GitHub](https://github.com/cris1277)  

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
