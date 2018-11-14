var express = require('express');
var path = require('path');
var http = require('http');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var app = express();
var server = require('http').Server(app);
var apiRouter = require('./routes/api');
var ytInfo = require('youtube-info');

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

            socket.on('index/createRoom', room => {

                console.log('User created ' + room);

                //check existence of room name
                db.listCollections({ name: room }).toArray()
                    .then(names => {
                        
                        if(names.length == 0) {
                            db.createCollection(room)
                                .then(r => {
                                    db.collection(room).insertMany([
                                        {
                                            name: 'songQueue',
                                            songQueue: []
                                        },
                                        {
                                            name: 'info'
                                        }
                                    ]);
                                });
                        }
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

                            db.collection(room).findOne({ name: 'songQueue' })
                                .then(songQueue => {
                                    socket.emit('room/syncSongs', songQueue.songQueue);
                                });
                        }
                    });
            });

            socket.on('room/addSong', url => {
                
                //this room doesnt exist
                if(!socket.room) return;

                //check if supplied url is valid
                let urlObject;

                try { urlObject = new URL(url) }
                catch(_) { 
                    socket.emit('room/addSongResponse', {
                        text: 'Enter a valid youtube URL',
                        color: 'danger'
                    });

                    return;
                }

                const ytShort = 'youtu.be/';
                let vidID;
                let index = url.indexOf(ytShort);

                //youtu.be/vidID
                if(index !== -1) {
                    vidID = url.substring(index + ytShort.length);
                }

                //youtube.com//watch?v=vidID
                else {
                    vidID = urlObject.searchParams.get('v'); 
                }

                if(vidID === null) {
                    socket.emit('room/addSongResponse', {
                        text: 'Enter a valid youtube URL',
                        color: 'danger'
                    });

                    return;
                }

                ytInfo(vidID)
                    .then(info => {
                        return db.collection(socket.room).updateOne(
                            { name: 'songQueue' },
                            { $push: 
                                {
                                    songQueue : {
                                        imgSrc: info.thumbnailUrl,
                                        title: info.title,
                                        artist: info.owner,
                                        url: info.url,
                                        vidId: info.videoId,
                                        upvotes: 0,
                                        downvotes: 0
                                    } 
                                }
                            }
                        );
                    })
                    .then(res => {
                        
                        socket.emit('room/addSongResponse', {
                            text: 'Video successfully added',
                            color: 'success'
                        });

                        db.collection(socket.room).findOne({ name: 'songQueue' })
                            .then((songQueue) => {

                                console.log('!!!');
                                console.log(songQueue);
                                
                                socket.emit('room/syncSongs', songQueue.songQueue);

                            });

                    })
                    .catch(err => {
                        
                        socket.emit('room/addSongResponse', {
                            text: err.msg,
                            color: 'danger'
                        });
                    });

            });

            socket.on('room/nextSong', () => {

                console.log("Next song requested");

                db.collection(socket.room).updateOne(
                    { name: 'songQueue' },
                    { $pop: { songQueue: -1 }}
                ).then(() => {
                    return db.collection(socket.room).findOne({ name: 'songQueue' });
                }).then((songQueue) => {
                    socket.emit('room/syncSongs', songQueue.songQueue);
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
