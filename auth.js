const express = require('express');
const router = express.Router();
const fs = require('fs'); // Use synchronous methods
const path = require('path');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY || '12345'; // Use environment variable for secret key

const filePath = path.join(__dirname, 'data.txt');

// Define a route for login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.trim().split('\n');

        for (const line of lines) {
            const [id, name, pass] = line.split(' ');
            if (name === username && pass === password) {
                const token = jwt.sign({ userId: id }, secretKey, { expiresIn: '1h' });
                return res.json({ message: 'Login successful', token });
            }
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Define a route for signup
router.post('/signup', (req, res) => {
    const { firstName, lastName, password, email, ip } = req.body;

    // Validate input
    if (!firstName || !lastName || !password || !email || !ip) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Read existing user data
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.trim().split('\n');

        // Check if the email already exists
        for (const line of lines) {
            const userFields = line.split(' ');
            const userEmail = userFields[5]; // Email is at index 5
            if (userEmail === email) {
                return res.status(409).json({ message: 'Email already registered' });
            }
        }

        // Generate a username from the first name
        const username = firstName.toLowerCase(); // Ensure username is consistent

        // Create new user data
        const newUser = `${lines.length + 1} ${username} ${password} ${firstName} ${lastName} ${email} ${ip}\n`;

        // Append new user data to the file
        fs.appendFileSync(filePath, newUser);

        return res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
