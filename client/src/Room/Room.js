import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import openSocket from 'socket.io-client';

class Room extends Component {

    constructor(props) {
        super(props);

        let room = this.props.match.params.room;

        this.state = {
            room: room,
            exists: false
        };

        this.socket = openSocket();
    }

    componentDidMount() {
        //check if this room exists
        this.socket.emit('room/connection', this.state.room);
        this.socket.on('index/roomExists', (exists) => {
            this.setState({ exists: exists });
        });
    }

    render() {
        if(!this.state.exists) {
            return <div>{this.state.room} does not exist</div>;
        }

        return <div>exists</div>;
    }
}

export default Room;