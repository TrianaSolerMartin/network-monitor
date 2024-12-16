# Network Monitoring System 🌐

Real-time network monitoring dashboard for tracking server and service status.

## Features 🚀

- **Real-time status monitoring**
- **Response time tracking**
- **Interactive filtering system**
- **Auto-refresh functionality**
- **Historical data logging**
- **Visual status indicators**
- **Performance graphs**
- **MySQL data persistence**

## Tech Stack 🛠️

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Libraries**: Chart.js, Node-Ping

## Prerequisites 📋

- **Node.js** (v14+)
- **MySQL** (v8.0+)
- **Modern web browser**

## Quick Start 🏃‍♂️

### 1. Clone & Install
git clone
cd network-monitor
npm install


### 2. Configure Environment
Create a `.env` file with the following variables:

```env
PORT=xxxx
DB_HOST=xxxx
DB_USER=xxxx
DB_PASS=xxxx
DB_NAME=xxxx
```


## Features Overview 📊

### Dashboard

- **Active/Inactive status indicators**
- **Response time visualization**
- **Packet loss monitoring**
- **Historical performance data**
- **Auto-refresh** (30s interval)

### Filtering Options

- **All hosts view**
- **Active hosts filter**
- **Inactive hosts filter**

### Default Monitored Hosts 🔍

- **Google DNS**: `8.8.8.8`
- **Cloudflare**: `1.1.1.1`
- **OpenDNS**: `208.67.222.222`

---

## Development 👨‍💻

### Project Structure

```
network-monitor/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── src/
│   ├── config/
│   ├── routes/
│   └── server.js
├── database/
│   └── init.sql
└── README.md
```
```
