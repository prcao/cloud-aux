import React, { Component } from 'react';
import '../App.css'
import { Container, Media, Row, Col, Card } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'

/* A single SongCard */
class SongCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            upvoted: false,
            downvoted: false
        };
    }

    onUpvote = () => {
        
        this.setState(function (prevState, props) {
            let toReturn = {
                upvoted: !prevState.upvoted,
            }

            if (prevState.upvoted) {
                this.props.socket.emit('room/unupvote', props.url);
            }

            else {
                this.props.socket.emit('room/upvote', props.url);

                if (prevState.downvoted) {
                    toReturn.downvoted = false;
                    this.props.socket.emit('room/undownvote', props.url);
                }
            }

            return toReturn;
        });
    }

    onDownvote = () => {
        
        this.setState(function (prevState, props) {

            let toReturn = {
                downvoted: !prevState.downvoted,
            }

            if (prevState.downvoted) {
                this.props.socket.emit('room/undownvote', props.url);
            }

            else {
                this.props.socket.emit('room/downvote', props.url);

                if (prevState.upvoted) {
                    toReturn.upvoted = false;
                    this.props.socket.emit('room/unupvote', props.url);
                }
            }

            return toReturn;
        });
    }

    render() {

        return (
            <Card className="my-4">

                <Media className="p-5">
                    <Media left>

                    </Media>

                    <Media body>
                        <Container>

                            <Row>

                                <Col md="3" sm="12">
                                    <SongArt src={this.props.imgSrc} />
                                </Col>

                                <Col md="8" xs="10">

                                    <SongInfo
                                        title={this.props.title}
                                        artist={this.props.artist}
                                        url={this.props.url} />
                                </Col>

                                <Col sm="1" xs="2">

                                    <VoteScore
                                        upvotes={this.props.upvotes}
                                        downvotes={this.props.downvotes}
                                        upvoted={this.state.upvoted}
                                        downvoted={this.state.downvoted}
                                        onUpvote={this.onUpvote}
                                        onDownvote={this.onDownvote} />
                                </Col>

                            </Row>
                        </Container>
                    </Media>

                </Media >
            </Card>

        );
    }
}

function SongArt(props) {
    return (
        <img width="160" src={props.src} alt={props.alt} />
    );
}

function SongInfo(props) {
    return (
        <div>

            <h3 className="long-text">{props.title}</h3>
            <h5 className="long-text text-muted">{props.artist}</h5>
            <a href={props.url} target="_blank">{props.url}</a>
        </div>
    );
}

class VoteScore extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <VoteIcon icon={faThumbsUp} onClick={this.props.onUpvote} numVotes={this.props.upvotes} isClicked={this.props.upvoted} color="#00ff00" />
                <VoteIcon icon={faThumbsDown} onClick={this.props.onDownvote} numVotes={this.props.downvotes} isClicked={this.props.downvoted} color="#ff0000" />
            </div>
        );
    }
}

function VoteIcon(props) {

    let icon = <FontAwesomeIcon icon={props.icon} size="lg" />;

    if (props.isClicked)
        icon = <FontAwesomeIcon icon={props.icon} color={props.color} size="lg" />

    return (
        <p>
            <a onClick={props.onClick} className="mr-1">
                {icon}
            </a>
            {props.numVotes}
        </p>
    );

}

export default SongCard;