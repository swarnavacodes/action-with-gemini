// API Service with intentional issues for Gemini AI to review

const express = require('express');
const app = express();

// Issue 1: Missing middleware and security headers
app.use(express.json());

// Issue 2: Hardcoded credentials (security vulnerability)
const API_KEY = 'sk-1234567890abcdef';
const DATABASE_URL = 'mongodb://admin:password123@localhost:27017/mydb';

// Issue 3: No input validation or error handling
app.post('/api/users', (req, res) => {
    const { name, email, password } = req.body;
    
    // Issue 4: SQL injection vulnerability
    const query = `INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`;
    
    // Issue 5: Synchronous database operation (performance)
    const result = database.executeSync(query);
    
    res.json({ success: true, userId: result.insertId });
});

// Issue 6: Missing authentication and authorization
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    
    // Issue 7: No validation of user ID
    database.query(`DELETE FROM users WHERE id = ${userId}`);
    
    res.json({ message: 'User deleted' });
});

// Issue 8: Inefficient algorithm - O(n²) complexity
function findDuplicateEmails(users) {
    const duplicates = [];
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            if (users[i].email === users[j].email) {
                duplicates.push(users[i].email);
            }
        }
    }
    return duplicates;
}

// Issue 9: Memory leak - event listeners not cleaned up
function setupWebSocket() {
    const ws = new WebSocket('ws://localhost:8080');
    ws.addEventListener('message', function(event) {
        console.log('Message received:', event.data);
    });
    // Missing cleanup on disconnect
}

// Issue 10: Poor error handling
app.get('/api/users/:id', (req, res) => {
    const user = database.findUser(req.params.id);
    if (!user) {
        res.status(404).json({ error: 'not found' });
        return;
    }
    res.json(user.profile); // Will crash if user is null
});

module.exports = app;