// Database utilities with performance and security issues

const mysql = require('mysql2');

class DatabaseUtils {
    constructor() {
        // Issue: Hardcoded database credentials
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'admin123',
            database: 'myapp'
        });
    }

    // Issue: SQL injection vulnerability
    async getUserById(userId) {
        const query = `SELECT * FROM users WHERE id = ${userId}`;
        return new Promise((resolve, reject) => {
            this.connection.query(query, (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    // Issue: No connection pooling (performance)
    async getAllUsers() {
        // Issue: No pagination for large datasets
        const query = 'SELECT * FROM users';

        return new Promise((resolve, reject) => {
            this.connection.query(query, (error, results) => {
                if (error) {
                    // Issue: Exposing database errors to client
                    reject(error);
                }
                resolve(results);
            });
        });
    }

    // Issue: Inefficient batch operations
    async insertMultipleUsers(users) {
        const results = [];

        // Issue: N+1 query problem
        for (let user of users) {
            const query = `INSERT INTO users (name, email) VALUES ('${user.name}', '${user.email}')`;

            try {
                const result = await new Promise((resolve, reject) => {
                    this.connection.query(query, (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    });
                });
                results.push(result);
            } catch (error) {
                // Issue: Partial failure handling
                console.error('Failed to insert user:', error);
            }
        }

        return results;
    }

    // Issue: No transaction management
    async transferUserData(fromUserId, toUserId) {
        // Issue: Race condition potential
        const fromUser = await this.getUserById(fromUserId);
        const toUser = await this.getUserById(toUserId);

        if (!fromUser || !toUser) {
            throw new Error('User not found');
        }

        // Issue: No atomic operations
        await this.updateUserBalance(fromUserId, 0);
        await this.updateUserBalance(toUserId, fromUser.balance + toUser.balance);

        return true;
    }

    // Issue: Missing input validation
    async updateUserBalance(userId, newBalance) {
        const query = `UPDATE users SET balance = ${newBalance} WHERE id = ${userId}`;

        return new Promise((resolve, reject) => {
            this.connection.query(query, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
    // Issue: No error handling
    // Issue: No connection cleanup
    // Missing proper connection closing methods
}

module.exports = DatabaseUtils;