const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const secretKey = '12345'; // Replace with your secure secret key

router.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.redirect('/login'); // Redirect to /login on token verification failure
            }// Middleware to authenticate requests

            req.user = decoded;
            next();
        });
    } else {
        res.redirect('/login'); // Redirect to /login if no token is present
    }
});

// Dashboard endpoint
router.get('/u', (req, res) => {
    const { userId } = req.user;

    const filePath = path.join(__dirname, 'data.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const lines = data.split('\n');
        const userFound = lines.find(line => {
            const [id] = line.split(' ');
            return id === userId;
        });

        if (userFound) {
            const [id, username, pass, lname, fname, email, ip] = userFound.split(' ');
            const userDetails = {
                uid: id,
                username: username,
                name: `${fname} ${lname}`,
                email: email,
                ip: ip,
            };
            return res.json(userDetails);
        }

        res.status(404).json({ message: 'User not found' });
    });
});

module.exports = router;
