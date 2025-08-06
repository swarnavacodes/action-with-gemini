// Utility functions with various code quality issues

// Function without proper error handling
function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    return total;
}

// Inefficient algorithm - O(n²) when O(n) is possible
function findDuplicates(arr) {
    const duplicates = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
                duplicates.push(arr[i]);
            }
        }
    }
    return duplicates;
}

// Missing input validation
function formatEmail(email) {
    return email.toLowerCase().trim();
}

// Memory leak potential - not cleaning up listeners
function setupEventListener() {
    const button = document.getElementById('submit');
    button.addEventListener('click', function() {
        console.log('Button clicked');
    });
}

// Inconsistent naming and no JSDoc
const user_data = {
    firstName: 'John',
    last_name: 'Doe'
};

module.exports = {
    calculateTotal,
    findDuplicates,
    formatEmail,
    setupEventListener,
    user_data
};