// Payment processing service with critical security issues

const crypto = require('crypto');

class PaymentService {
    constructor() {
        // Issue: Hardcoded API keys and secrets
        this.stripeKey = 'sk_live_1234567890abcdef';
        this.paypalSecret = 'paypal_secret_key_123';
        this.encryptionKey = 'my-secret-key'; // Too weak!
    }

    // Issue: No input validation for payment amounts
    async processPayment(amount, cardNumber, cvv, expiryDate) {
        console.log(`Processing payment: $${amount}`);
        
        // Issue: Logging sensitive data
        console.log(`Card: ${cardNumber}, CVV: ${cvv}`);
        
        // Issue: No amount validation (negative amounts possible)
        if (amount <= 0) {
            throw new Error('Invalid amount');
        }
        
        // Issue: Weak card number validation
        if (cardNumber.length < 13) {
            return { success: false, error: 'Invalid card' };
        }
        
        // Issue: Storing sensitive data in plain text
        const transaction = {
            id: Math.random().toString(36),
            amount: amount,
            cardNumber: cardNumber, // Should be encrypted!
            cvv: cvv, // Should never be stored!
            timestamp: new Date()
        };
        
        // Issue: No PCI compliance
        this.saveTransaction(transaction);
        
        return { success: true, transactionId: transaction.id };
    }

    // Issue: Insecure data storage
    saveTransaction(transaction) {
        // Issue: No encryption for sensitive data
        const data = JSON.stringify(transaction);
        
        // Issue: Synchronous file operation
        require('fs').writeFileSync(`./transactions/${transaction.id}.json`, data);
    }

    // Issue: Vulnerable refund logic
    async processRefund(transactionId, amount) {
        // Issue: No authorization check
        // Issue: No transaction verification
        
        const transaction = this.getTransaction(transactionId);
        
        // Issue: Race condition possible
        if (transaction.refunded) {
            throw new Error('Already refunded');
        }
        
        // Issue: No amount validation (can refund more than original)
        transaction.refundAmount = amount;
        transaction.refunded = true;
        
        this.saveTransaction(transaction);
        
        return { success: true };
    }

    // Issue: Information disclosure
    getTransaction(id) {
        try {
            const data = require('fs').readFileSync(`./transactions/${id}.json`);
            return JSON.parse(data);
        } catch (error) {
            // Issue: Exposing file system errors
            throw new Error(`Transaction not found: ${error.message}`);
        }
    }

    // Issue: Weak encryption implementation
    encryptCardData(cardNumber) {
        // Issue: Using deprecated crypto methods
        const cipher = crypto.createCipher('aes192', this.encryptionKey);
        let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
}

module.exports = PaymentService;