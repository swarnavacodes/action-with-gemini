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

// Missing CORS and security headers
app.post('/users', (req, res) => {
    // Missing body parsing middleware
    const newUser = req.body;
    
    // No validation
    users.push(newUser);
    
    res.status(201).json(newUser);
});

// New endpoint with authentication issues
app.post('/admin/reset-password', (req, res) => {
    const { userId, newPassword } = req.body;
    
    // Issue: No admin verification
    // Issue: Plain text password storage
    database.updatePassword(userId, newPassword);
    
    res.json({ message: 'Password reset successfully' });
});

// Hardcoded port and no environment configuration
app.listen(3000, () => {
    console.log('Server running on port 3000');
});