var express = require('express');
var path = require('path');
var http = require('http');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var app = express();
var server = require('http').Server(app);
var apiRouter = require('./routes/api');

const port = process.env.PORT || 5000;

var server = http.createServer(app);
server.listen(port);

var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/api', apiRouter);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

//setup mongodb
MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(client => {

        const db = client.db();

        //SOCKETIO API
        io.on('connection', socket => {

            console.log('User connected');

            socket.on('index/roomInputNameChange', room => {


                //check existence of room name
                db.listCollections({ name: room }).toArray()
                    .then(names => {
                        socket.emit('index/roomExists', names.length === 1);
                    });
            });

            socket.on('room/connection', room => {
                console.log('User joined ' + room);

                //check existence of room name
                db.listCollections({ name: room }).toArray()
                    .then(names => {
                        socket.emit('index/roomExists', names.length === 1);

                        if(names.length == 1) {
                            socket.join(room);
                            socket.room = room;
                        }
                    });
            });

            socket.on('room/deleteSong', id => {

            });

            socket.on('room/upvote', id => {

            });

            socket.on('room/unupvote', id => {

            });

            socket.on('room/downvote', id => {

            });

            socket.on('room/undownvote', id => {

            });

            socket.on('room/disconnect', () => {
                console.log('User left ' + socket.room);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            })


        });

    })
    .catch(err => {
        console.log(err);
    });

app.use(cors());

console.log("Server started on port 5000");

module.exports = app;
