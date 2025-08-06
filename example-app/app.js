// Simple Express.js API with intentional issues for testing
const express = require('express');
const app = express();

// Missing input validation and error handling
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    
    // Security issue: SQL injection vulnerability
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    
    // Performance issue: synchronous operation
    const fs = require('fs');
    const data = fs.readFileSync('./users.json', 'utf8');
    
    // Logic error: not handling JSON parse errors
    const users = JSON.parse(data);
    
    res.json(users.find(u => u.id == userId));
});

// New endpoint with more issues
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Security: Plain text password comparison
    if (username === 'admin' && password === 'password123') {
        res.json({ token: 'fake-jwt-token', admin: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Missing CORS and security headers
app.post('/users', (req, res) => {
    // Missing body parsing middleware
    const newUser = req.body;
    
    // No validation
    users.push(newUser);
    
    res.status(201).json(newUser);
});

// Hardcoded port and no environment configuration
app.listen(3000, () => {
    console.log('Server running on port 3000');
});