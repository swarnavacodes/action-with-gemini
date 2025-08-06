// Test file with intentional issues for Gemini to review

// Security issue: SQL injection vulnerability
function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ${id}`;
    return database.query(query);
}

// Performance issue: inefficient loop
function findUser(users, targetId) {
    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users.length; j++) {
            if (users[i].id === targetId) {
                return users[i];
            }
        }
    }
    return null;
}

// Code quality issues
var userName = "john";  // should use const/let
function processData(data) {
    // Missing error handling
    return data.map(item => item.value * 2);
}

// Missing documentation and validation
function calculatePrice(quantity, price, discount) {
    return quantity * price - discount;
}