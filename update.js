const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = 'mlsn.a1a1dc095b6c029170820f074982ce3093e669e58f794a1db106b7d9139fbd69'; // Your MailerSend API key

// Function to send an email
const sendEmail = async (toEmail, username, password) => {
    const url = 'https://api.mailersend.com/v1/email';

    const emailData = {
        from: {
            email: 'user@trial-o65qngkpr08lwr12.mlsender.net', // Use your company's support email
            name: 'Your vikas Support Team',
        },
        to: [
            {
                email: toEmail,
                name: username,
            },
        ],
        subject: 'Your Password Reset Request',
        text: `Hello ${username},\n\nYour password is: ${password}\n\nIf you did not request this, please ignore this email.`,
        html: `<h1>Password Reset Request</h1>
               <p>Hello ${username},</p>
               <p>Your password is: <strong>${password}</strong></p>
               <p>If you did not request this, please ignore this email.</p>
               <p>Best regards,<br>Your Company Support Team</p>`,
    };

    try {
        await axios.post(url, emailData, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.data : error.message);
    }
};

// Update user details
router.post('/update', (req, res) => {
    const { username, firstName, lastName, email, ip } = req.body;

    const filePath = path.join(__dirname, 'data.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const lines = data.split('\n');
        const userIndex = lines.findIndex(line => line.split(' ')[1] === username);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDetails = lines[userIndex].split(' ');
        const updatedUser = [
            userDetails[0], // ID
            username, // Username
            userDetails[2], // Password (unchanged)
            firstName || userDetails[3],
            lastName || userDetails[4],
            email || userDetails[5],
            ip || userDetails[6]
        ].join(' ') + '\n';

        lines[userIndex] = updatedUser;
        fs.writeFile(filePath, lines.join('\n'), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            return res.json({ message: 'User details updated successfully' });
        });
    });
});

// Send password when requesting /f/username or /f/email
router.get('/f/:identifier', async (req, res) => {
    const identifier = req.params.identifier;

    const filePath = path.join(__dirname, 'data.txt');
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const lines = data.split('\n');
        const userFound = lines.find(line => {
            const [id, username, password, fname, lname, email] = line.split(' ');
            return username === identifier || email === identifier;
        });

        if (userFound) {
            const [id, username, password, fname, lname, email] = userFound.split(' ');
            await sendEmail(email, username, password);
            return res.json({ message: 'Password sent to your email' });
        }

        res.status(404).json({ message: 'User not found' });
    });
});

module.exports = router;
