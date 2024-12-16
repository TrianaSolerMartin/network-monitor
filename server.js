require('dotenv').config();
const express = require('express');
const ping = require('ping');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', async (req, res) => {
    try {
        const [hosts] = await pool.execute('SELECT id, hostname FROM hosts');
        
        const results = await Promise.all(hosts.map(async (host) => {
            const pingResult = await ping.promise.probe(host.hostname);
            const status = pingResult.alive ? 'Active' : 'Inactive';
            const statusColor = pingResult.alive ? 'green' : 'red';
            
            await pool.execute(
                'INSERT INTO monitoring_history (host_id, status, response_time) VALUES (?, ?, ?)',
                [host.id, pingResult.alive, pingResult.time]
            );
            
            await pool.execute(
                'UPDATE hosts SET status = ?, response_time = ?, last_checked = CURRENT_TIMESTAMP WHERE id = ?',
                [pingResult.alive, pingResult.time, host.id]
            );

            return {
                host: host.hostname,
                status: status,
                statusColor: statusColor,
                alive: pingResult.alive,
                time: pingResult.time ? `${pingResult.time}ms` : 'N/A',
                lastChecked: new Date().toLocaleString('es-ES'),
                avgResponseTime: pingResult.time ? `${Math.round(pingResult.time)}ms` : 'N/A',
                packetLoss: pingResult.packetLoss ? `${pingResult.packetLoss}%` : '0%'
            };
        }));
        
        res.json(results);
    } catch (error) {
        console.error('Monitoring error:', error);
        res.status(500).json({ error: 'Error monitoring hosts' });
    }
});

app.post('/api/hosts', async (req, res) => {
    try {
        const { host } = req.body;
        
        // Validate input
        if (!host) {
            return res.status(400).json({ error: 'Host is required' });
        }

        // Clean host input
        const cleanHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Validate format
        const urlPattern = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        
        if (!urlPattern.test(cleanHost) && !ipPattern.test(cleanHost)) {
            return res.status(400).json({ error: 'Invalid host format' });
        }

        // Check if host exists
        const [existing] = await pool.execute(
            'SELECT id FROM hosts WHERE hostname = ?',
            [cleanHost]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Host already exists' });
        }

        // Insert new host
        const [result] = await pool.execute(
            'INSERT INTO hosts (hostname) VALUES (?)',
            [cleanHost]
        );

        res.status(201).json({
            message: 'Host added successfully',
            id: result.insertId,
            host: cleanHost
        });

    } catch (error) {
        console.error('Error adding host:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const server = app.listen(port, async () => {
    try {
        await pool.getConnection();
        console.log('Database connected successfully');
        console.log(`Server running on port ${port}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        server.close();
    }
});