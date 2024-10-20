const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// Welcome message route
router.get('/message', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

// Handle /api/any/:ipAddress
router.get('/any/:ipAddress', (req, res) => {
    const ipAddress = req.params.ipAddress;
    res.json({ ipAddress });
});

// Handle /api
router.get('/', (req, res) => {
    res.json({ message: 'This is the /api endpoint.' });
});

// Handle /api/chat
router.post('/chat', (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: 'Message required' });

    exec(`
        curl -s -X POST https://api.cohere.com/v2/chat \
        -H "Authorization: Bearer NUzj39m93BClXV1CKw9naU1Nw7clnNhrwgAKFEq2" \
        -H "Content-Type: application/json" \
        -d '{"model":"command-r","messages":[{"role":"user","content":"${message}"}]}'
    `, (error, stdout) => {
        if (error) return res.status(500).json({ error: 'Server error' });

        try {
            const apiResponse = JSON.parse(stdout);
            res.json(apiResponse); // Return the full API response
        } catch {
            res.status(500).json({ error: 'Parsing error' });
        }
    });
});

// Export the router
module.exports = router;
