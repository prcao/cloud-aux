import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import openSocket from 'socket.io-client';
import Header from '../Header';
import AdminDashboard from './AdminDashboard';
import { Container, Input, InputGroup, InputGroupAddon, Button  } from 'reactstrap';
import SongCard from './SongCard';

class Room extends Component {

    constructor(props) {
        super(props);

        let room = this.props.match.params.room;

        this.state = {
            room: room,
            loading: true,
            exists: false,
            isAdmin: false,
            songQueue: []
        };

        this.socket = openSocket();
    }

    componentDidMount() {

        let key = '';
        if(localStorage.keys && JSON.parse(localStorage.keys)[this.state.room]) {
            key = JSON.parse(localStorage.keys)[this.state.room];
        }

        //check if this room exists
        this.socket.emit('room/connection', this.state.room, key, isAdmin => {
            this.setState({ isAdmin: isAdmin });
        });

        this.socket.on('index/roomExists', (exists) => {
            this.setState({ exists: exists, loading: false });
        });

        this.socket.on('room/syncSongs', (songQueue) => {
            this.setState({ songQueue: songQueue });
        });
    }

    //request next song from db
    onYoutubeEnd = (e) => {
        if(this.state.songQueue.length) {
            this.socket.emit('room/nextSong');
        }
    }

    render() {

        if(this.state.loading) {
            return <div>Loading...</div>;
        }

        let body;

        if(!this.state.exists) {
            body = <div>{this.state.room} does not exist</div>;
        } else {

            let vidId = '';
            let songCardList = (
                <p className="text-muted">There are no songs in the queue. Why not request one?</p>
            );
            
            if(this.state.songQueue.length > 0) {
                vidId = this.state.songQueue[0].vidId;
                songCardList = (
                    <SongCardList
                        room={this.state.room}
                        songs={this.state.songQueue}
                        socket={this.socket}
                    />
                );
            }

            body = 
            (
                <div>
                    <Container className='my-5'>
                        <AddSong
                            socket={this.socket}
                        />

                        {this.state.isAdmin &&

                            <AdminDashboard
                                vidId={vidId}
                                onYoutubeEnd={this.onYoutubeEnd}
                            />
                        }

                        <div className="my-3">
                            <h2>Next up</h2>
                            {songCardList}
                        </div>
                    </Container>

                </div>
            )
        }

        return (
            <div>
                <Header/>
                {body}
            </div>
        );
    }
}

class AddSong extends Component {

    constructor(props) {
        super(props);

        this.state = {
            text: '',
            isWaiting: false
        }
    }

    componentDidMount() {
        this.props.socket.on('room/addSongResponse', res => {
            this.setState({
                help: res,
                isWaiting: false
            });
        });
    }

    onChange = e => {
        this.setState({
            text: e.target.value
        });
    }

    onClick = () => {

        let text = this.state.text;

        this.setState({
            isWaiting: true,
            help: null,
            text: ''
        });

        this.props.socket.emit('room/addSong', text);
    }

    render() {
        return (
            <div className='mb-5'>
                <InputGroup>

                    <Input onChange={this.onChange} value={this.state.searchText} />
                    <InputGroupAddon addonType='append'>
                        <Button onClick={this.onClick} disabled={this.state.isWaiting}>Add song</Button>
                    </InputGroupAddon>
                </InputGroup>

                {this.state.help &&
                    <p className={'text-' + this.state.help.color}> {this.state.help.text}</p>
                }
            </div>
        );
    }
}

function SongCardList(props) {
    let list = props.songs.map(song => 
        <SongCard
            key={song.url}
            room={props.room}
            socket={props.socket}
            imgSrc={song.imgSrc}
            title={song.title}
            artist={song.artist}
            url={song.url}
            numUpvotes={song.numUpvotes}
            numDownvotes={song.numDownvotes} />
    );

    return list;
}

export default Room;