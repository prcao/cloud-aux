var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRouter = require('./routes/api');

var app = express();

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api', apiRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});
  
const port = process.env.PORT || 5000;
app.listen(port);

console.log("Server started on port 5000");

module.exports = app;
