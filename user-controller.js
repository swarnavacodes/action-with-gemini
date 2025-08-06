// User management controller with various vulnerabilities

const express = require('express');
const bcrypt = require('bcrypt');

class UserController {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    // Issue: No rate limiting on registration
    async register(req, res) {
        const { username, password, email } = req.body;
        
        // Issue: No input sanitization
        // Issue: No email validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        
        // Issue: Weak password requirements
        if (password.length < 4) {
            return res.status(400).json({ error: 'Password too short' });
        }
        
        // Issue: Username enumeration vulnerability
        if (this.users.has(username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Issue: Inconsistent hashing (sometimes plain text)
        let hashedPassword;
        if (password.includes('admin')) {
            hashedPassword = password; // Plain text for admin users!
        } else {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        
        const user = {
            id: this.users.size + 1,
            username,
            password: hashedPassword,
            email,
            role: username === 'admin' ? 'admin' : 'user',
            createdAt: new Date()
        };
        
        this.users.set(username, user);
        
        // Issue: Returning sensitive data
        res.status(201).json({
            message: 'User created',
            user: user // Includes password hash!
        });
    }

    // Issue: Timing attack vulnerability
    async login(req, res) {
        const { username, password } = req.body;
        
        // Issue: No brute force protection
        const user = this.users.get(username);
        
        if (!user) {
            // Issue: Different response time for non-existent users
            await new Promise(resolve => setTimeout(resolve, 100));
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Issue: Inconsistent password checking
        let isValid;
        if (user.password.includes('admin')) {
            isValid = user.password === password; // Plain text comparison
        } else {
            isValid = await bcrypt.compare(password, user.password);
        }
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Issue: Weak session management
        const sessionId = Math.random().toString(36);
        this.sessions.set(sessionId, {
            userId: user.id,
            username: user.username,
            role: user.role,
            createdAt: new Date()
        });
        
        // Issue: No secure cookie settings
        res.cookie('sessionId', sessionId);
        
        res.json({
            message: 'Login successful',
            sessionId: sessionId, // Exposing session ID
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }

    // Issue: No authorization middleware
    async deleteUser(req, res) {
        const { userId } = req.params;
        const sessionId = req.cookies.sessionId;
        
        // Issue: No session validation
        const session = this.sessions.get(sessionId);
        
        // Issue: Privilege escalation possible
        if (!session) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Issue: No ownership check (any user can delete any user)
        const userToDelete = Array.from(this.users.values()).find(u => u.id == userId);
        
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        this.users.delete(userToDelete.username);
        
        res.json({ message: 'User deleted successfully' });
    }

    // Issue: Information disclosure
    async getAllUsers(req, res) {
        // Issue: No authentication check
        // Issue: Exposing sensitive user data
        const allUsers = Array.from(this.users.values());
        
        res.json({
            users: allUsers, // Includes password hashes!
            total: allUsers.length
        });
    }
}

module.exports = UserController;