// Express serveri seadistus
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

// MySQL ühenduse loomine
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Kasutaja registreerimise API
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Kasutaja loomisel tekkis viga.' });
        }
        res.status(201).json({ message: 'Kasutaja loodud!' });
    });
});

// Sisselogimise API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Vale kasutajanimi või parool.' });
        }
        res.json(results[0]); // Tagastame sisselogitud kasutaja andmed
    });
});

// Serveri kuulamine
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
