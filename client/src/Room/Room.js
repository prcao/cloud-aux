import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import openSocket from 'socket.io-client';
import Header from '../Header';
import AdminDashboard from './AdminDashboard';
import { Container, Input, InputGroup, InputGroupAddon, Button  } from 'reactstrap';

class Room extends Component {

    constructor(props) {
        super(props);

        let room = this.props.match.params.room;

        this.state = {
            room: room,
            loading: true,
            exists: false,
            songQueue: []
        };

        this.socket = openSocket();
    }

    componentDidMount() {
        //check if this room exists
        this.socket.emit('room/connection', this.state.room);

        this.socket.on('index/roomExists', (exists) => {
            this.setState({ exists: exists, loading: false });
        });

        this.socket.on('room/syncSongs', (songQueue) => {
            this.setState({ songQueue: songQueue });
        });
    }

    //request next song from db
    onYoutubeEnd = (e) => {
        console.log("NEXT!");
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
            
            if(this.state.songQueue[0]) {
                vidId = this.state.songQueue[0].vidId;
            }

            body = 
            (
                <div>
                    <Container className='my-5'>
                        <AddSong
                            socket={this.socket}
                        />

                        <AdminDashboard
                            vidId={vidId}
                            onYoutubeEnd={this.onYoutubeEnd}
                        />
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

export default Room;