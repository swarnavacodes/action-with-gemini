// Authentication service with security vulnerabilities for testing

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthService {
    constructor() {
        // Issue: Hardcoded secret key (security vulnerability)
        this.jwtSecret = 'my-super-secret-key-123';
        this.users = [];
    }

    // Issue: Weak password validation
    validatePassword(password) {
        return password.length > 3; // Too weak!
    }

    // Issue: Plain text password storage
    async registerUser(username, password, email) {
        // Issue: No input sanitization
        const user = {
            id: this.users.length + 1,
            username: username,
            password: password, // Storing plain text!
            email: email,
            role: 'user'
        };

        // Issue: No duplicate checking
        this.users.push(user);
        
        return user;
    }

    // Issue: Timing attack vulnerability
    async loginUser(username, password) {
        // Issue: Linear search instead of hash lookup
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].username === username) {
                // Issue: Plain text comparison
                if (this.users[i].password === password) {
                    // Issue: Weak JWT payload
                    const token = jwt.sign(
                        { userId: this.users[i].id, role: this.users[i].role },
                        this.jwtSecret,
                        { expiresIn: '30d' } // Too long expiration
                    );
                    return { success: true, token };
                }
            }
        }
        
        // Issue: Information disclosure
        return { success: false, error: 'Invalid username or password' };
    }

    // Issue: No rate limiting or brute force protection
    async resetPassword(email, newPassword) {
        // Issue: No email verification
        const user = this.users.find(u => u.email === email);
        
        if (user) {
            // Issue: No password validation on reset
            user.password = newPassword;
            return { success: true };
        }
        
        return { success: false };
    }

    // Issue: Insecure token verification
    verifyToken(token) {
        try {
            // Issue: No token blacklisting
            const decoded = jwt.verify(token, this.jwtSecret);
            return decoded;
        } catch (error) {
            // Issue: Exposing internal error details
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
}

module.exports = AuthService;