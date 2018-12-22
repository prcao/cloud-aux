import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import Header from '../Header';
import AdminDashboard from './AdminDashboard';
import { Container, Input, InputGroup, InputGroupAddon, Button, Row, Col } from 'reactstrap';
import SongCard from './SongCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress, faExpand } from '@fortawesome/free-solid-svg-icons'
import Switch from 'react-switch';
import CompactSongCard from './CompactSongCard';

class Room extends Component {

    constructor(props) {
        super(props);

        let room = this.props.match.params.room;

        this.state = {
            room: room,
            loading: true,
            exists: false,
            isAdmin: false,
            compactLayout: false,
            songQueue: []
        };

        this.socket = openSocket();
    }

    componentDidMount() {

        let key = '';
        if (localStorage.keys && JSON.parse(localStorage.keys)[this.state.room]) {
            key = JSON.parse(localStorage.keys)[this.state.room];
        }

        //setup room vote cache
        if(!localStorage.rooms) {
            localStorage.rooms = '{}';
        }
        let rooms = JSON.parse(localStorage.rooms);
        rooms[this.state.room] = {};
        localStorage.rooms = JSON.stringify(rooms);

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
        if (this.state.songQueue.length) {
            this.socket.emit('room/nextSong');
        }
    }

    handleSwitchChange = (checked) => {
        this.setState({
            compactLayout: checked
        });
    }

    render() {

        if (this.state.loading) {
            return <div>Loading...</div>;
        }

        let body;

        if (!this.state.exists) {
            body = <div>{this.state.room} does not exist</div>;
        } else {

            let vidId = '';
            let currentSongCard;
            let songCardList = (
                <p className="text-muted">There are no songs in the queue. Why not request one?</p>
            );

            if (this.state.songQueue.length > 0) {
                vidId = this.state.songQueue[0].vidId;

                let song = this.state.songQueue[0];

                if(this.state.compactLayout) {
                    currentSongCard = (
                        <CompactSongCard
                            key={song.url}
                            room={this.state.room}
                            socket={this.socket}
                            imgSrc={song.imgSrc}
                            title={song.title}
                            artist={song.artist}
                            url={song.url}
                            upvotes={song.upvotes}
                            downvotes={song.downvotes} />
                    );
                } else {
                    currentSongCard = (
                        <SongCard
                            key={song.url}
                            room={this.state.room}
                            socket={this.socket}
                            imgSrc={song.imgSrc}
                            title={song.title}
                            artist={song.artist}
                            url={song.url}
                            upvotes={song.upvotes}
                            downvotes={song.downvotes} />
                    );
                }
                
                if(this.state.songQueue.length > 1) {
                    songCardList = (
                        <SongCardList
                            room={this.state.room}
                            songs={this.state.songQueue.slice(1)}
                            socket={this.socket}
                            isCompact={this.state.compactLayout}
                        />
                    );
                }
            }

            

            body =
                (
                    <div>
                        <Container className='my-5'>

                            <Row className="mt-5">
                                <Col xs="8">
                                    <h4 className="vcentered">Room name: {this.state.room}</h4>
                                </Col>

                                <Col>
                                    <div className="float-right">

                                        <FontAwesomeIcon
                                            className="vcentered"
                                            icon={faExpand}
                                        />

                                        <Switch
                                            className="vcentered px-1"
                                            onChange={this.handleSwitchChange}
                                            checked={this.state.compactLayout}
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            height={20}
                                            width={40}
                                        />

                                        <FontAwesomeIcon
                                            className="vcentered"
                                            icon={faCompress}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <AddSong
                                socket={this.socket}
                            />

                            {this.state.isAdmin &&

                                <AdminDashboard
                                    vidId={vidId}
                                    onYoutubeEnd={this.onYoutubeEnd}
                                />
                            }

                            {currentSongCard && 
                                <div className="my-3">
                                    <h2>Current Song</h2>
                                    {currentSongCard}
                                </div>
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
                <Header />
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

        this.props.socket.emit('room/addSong', text, (text, color) => {
            this.setState({
                help: { text: text, color: color },
                isWaiting: false
            });
        });
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
    let list;
    
    if(props.isCompact) {
        list = props.songs.map(song =>
            <CompactSongCard
                key={song.url}
                room={props.room}
                socket={props.socket}
                imgSrc={song.imgSrc}
                title={song.title}
                artist={song.artist}
                url={song.url}
                upvotes={song.upvotes}
                downvotes={song.downvotes} />
        );
    }

    else {
        list = props.songs.map(song =>
            <SongCard
                key={song.url}
                room={props.room}
                socket={props.socket}
                imgSrc={song.imgSrc}
                title={song.title}
                artist={song.artist}
                url={song.url}
                upvotes={song.upvotes}
                downvotes={song.downvotes} />
        );
    }

    return list;
}

export default Room;