const express = require('express');
const apiRouter = require('./api');
const authRouter = require('./auth');
const updateRouter = require('./update');
const dashboardRouter = require('./dashboard');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api', dashboardRouter);
app.use('/api', updateRouter);

const dataFilePath = path.join(__dirname, 'data.txt');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/data', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.txt'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading app.txt');
        }
        res.send(`<pre>${data}</pre>`);
    });
});



app.get('/dashboard2', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '2.html'));
});


// Serve the dashboard layout for all dashboard routes
app.get('/dashboard11*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '2.html')); // Always serve dashboard.html
});

app.get('/dashboard12/*', (req, res) => {
    const page = req.params[0]; // Get the page name from the URL
    if (page === 'service.html') {
        res.sendFile(path.join(__dirname, 'views', 'service.html'));
    } else if (page === 'another-page') {
        res.sendFile(path.join(__dirname, 'views', 'another-page.html'));
    } else {
        res.sendFile(path.join(__dirname, 'views', '2.html')); // Default fallback
    }
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'booking.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
