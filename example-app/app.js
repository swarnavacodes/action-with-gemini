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

// Search endpoint with injection vulnerability
app.get('/search', (req, res) => {
    const { query, category } = req.query;
    
    // Issue: NoSQL injection vulnerability
    const searchQuery = {
        $where: `this.title.includes('${query}') && this.category === '${category}'`
    };
    
    // Issue: No input validation or sanitization
    database.find(searchQuery, (err, results) => {
        if (err) {
            // Issue: Exposing database errors
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Password reset with security flaws
app.post('/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    
    // Issue: No email verification
    // Issue: No rate limiting
    // Issue: Weak password requirements
    if (newPassword.length < 3) {
        return res.status(400).json({ error: 'Password too short' });
    }
    
    // Issue: Direct password update without verification
    database.updatePassword(email, newPassword);
    
    res.json({ message: 'Password updated successfully' });
});

// Hardcoded port and no environment configuration
app.listen(3000, () => {
    console.log('Server running on port 3000');
});