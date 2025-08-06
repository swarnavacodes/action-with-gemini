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

// File upload endpoint with security issues
app.post('/upload', (req, res) => {
    const { filename, content } = req.body;
    
    // Issue: No file type validation
    // Issue: Path traversal vulnerability
    const filePath = `./uploads/${filename}`;
    
    // Issue: No file size limits
    fs.writeFileSync(filePath, content);
    
    res.json({ message: 'File uploaded', path: filePath });
});

// Admin endpoint with authorization bypass
app.get('/admin/users', (req, res) => {
    // Issue: No authentication check
    // Issue: Exposing sensitive user data
    const users = database.getAllUsers();
    res.json(users);
});

// Hardcoded port and no environment configuration
app.listen(3000, () => {
    console.log('Server running on port 3000');
});