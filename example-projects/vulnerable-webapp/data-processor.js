// Data processing utilities with various code quality issues

// Issue: Missing JSDoc documentation
function processUserData(userData) {
    // Issue: No input validation
    let result = {};
    
    // Issue: Using var instead of const/let
    var processedUsers = [];
    
    // Issue: Inefficient nested loops
    for (let i = 0; i < userData.length; i++) {
        for (let j = 0; j < userData[i].permissions.length; j++) {
            if (userData[i].permissions[j] === 'admin') {
                processedUsers.push(userData[i]);
                break;
            }
        }
    }
    
    return processedUsers;
}

// Issue: Function doing too many things (violates SRP)
function validateAndSaveUser(user) {
    // Validation logic
    if (!user.email || !user.name) {
        throw new Error('Missing required fields');
    }
    
    // Email format validation (poor regex)
    if (!user.email.includes('@')) {
        throw new Error('Invalid email');
    }
    
    // Database save logic
    const query = `INSERT INTO users VALUES ('${user.name}', '${user.email}')`;
    database.execute(query);
    
    // Email sending logic
    emailService.send(user.email, 'Welcome!');
    
    // Logging logic
    console.log(`User ${user.name} created`);
    
    return true;
}

// Issue: Callback hell and no error handling
function fetchUserProfile(userId, callback) {
    database.getUser(userId, (err, user) => {
        if (user) {
            database.getPermissions(user.id, (err, permissions) => {
                if (permissions) {
                    database.getPreferences(user.id, (err, preferences) => {
                        callback({
                            user: user,
                            permissions: permissions,
                            preferences: preferences
                        });
                    });
                }
            });
        }
    });
}

// Issue: Magic numbers and hardcoded values
function calculateUserScore(user) {
    let score = 0;
    
    if (user.loginCount > 100) score += 50;
    if (user.postsCount > 25) score += 30;
    if (user.friendsCount > 500) score += 20;
    
    return score;
}

module.exports = {
    processUserData,
    validateAndSaveUser,
    fetchUserProfile,
    calculateUserScore
};