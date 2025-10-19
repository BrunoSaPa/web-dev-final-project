const express = require('express');
const https = require('https');
const app = express();
const port = 3005;


app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { weather: null, error: null });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});