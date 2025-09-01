const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database/users.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure table exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    createdAt TEXT,
    loggedIn BOOLEAN
)`);

class UserAuth {
    signup(username, email, password) {
        return new Promise((resolve) => {
            const createdAt = new Date().toISOString();
            db.run(
                `INSERT INTO users (username, password, email, createdAt, loggedIn) VALUES (?, ?, ?, ?, ?)`,
                [username, password, email, createdAt, false],
                function(err) {
                    if(err) {
                        console.log("❌ Signup failed:", err.message);
                        return resolve({ success: false, message: 'Username or email already exists' });
                    }
                    console.log(`✅ New user created: ${username}`);
                    resolve({ success: true, message: 'User created successfully' });
                }
            );
        });
    }

    login(username, password) {
        return new Promise((resolve) => {
            db.get(`SELECT * FROM users WHERE username=? AND password=?`, [username, password], (err, row) => {
                if(err || !row) {
                    console.log(`❌ Login failed for: ${username}`);
                    return resolve({ success: false, message: 'Invalid credentials' });
                }
                db.run(`UPDATE users SET loggedIn = ? WHERE id = ?`, [true, row.id]);
                console.log(`✅ Login successful for: ${username}`);
                resolve({ success: true, message: 'Login successful' });
            });
        });
    }

    logout() {
        return new Promise((resolve) => {
            db.run(`UPDATE users SET loggedIn = ? WHERE loggedIn = ?`, [false, true], (err) => {
                if(err) {
                    console.log("❌ Logout failed:", err.message);
                    return resolve({ success: false, message: 'Logout failed' });
                }
                console.log("✅ User logged out");
                resolve({ success: true, message: 'Logged out' });
            });
        });
    }

    getProfile() {
        return new Promise((resolve) => {
            db.get(`SELECT * FROM users WHERE loggedIn = ?`, [true], (err, row) => {
                if(err || !row) {
                    console.log("⚠️ Profile requested but no user is logged in");
                    return resolve({ loggedIn: false });
                }
                console.log(`👤 Profile fetched for: ${row.username}`);
                resolve({ 
                    username: row.username, 
                    email: row.email, 
                    createdAt: row.createdAt, 
                    loggedIn: row.loggedIn 
                });
            });
        });
    }
}

const auth = new UserAuth();

// Routes
app.post('/signup', async (req, res) => {
    console.log("📩 /signup request:", req.body);
    res.json(await auth.signup(req.body.username, req.body.email, req.body.password));
});

app.post('/login', async (req, res) => {
    console.log("📩 /login request:", req.body);
    res.json(await auth.login(req.body.username, req.body.password));
});

app.post('/logout', async (req, res) => {
    console.log("📩 /logout request");
    res.json(await auth.logout());
});

app.get('/profile', async (req, res) => {
    console.log("📩 /profile request");
    res.json(await auth.getProfile());
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
