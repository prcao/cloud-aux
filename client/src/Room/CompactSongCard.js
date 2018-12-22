import React, { Component } from 'react';
import '../App.css'
import SongCard from './SongCard';
import { ListGroup, ListGroupItem, Container, Media, Row, Col, Card } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'

class CompactSongCard extends SongCard {

    render() {
        return (
            <div className="compact-card">
                <Row>
                    <Col xs="8">
                        <a target="_blank" href={this.props.url}>
                            {this.props.title}
                        </a>
                    </Col>

                    <Col xs="2">
                        <VoteIcon icon={faThumbsUp} onClick={this.onUpvote} numVotes={this.props.upvotes} isClicked={this.state.upvoted} color="#00ff00" />
                    </Col>

                    <Col xs="2">
                        <VoteIcon icon={faThumbsDown} onClick={this.onDownvote} numVotes={this.props.downvotes} isClicked={this.state.downvoted} color="#ff0000" />
                    </Col>
                </Row>
            </div>
        );
    }
}

function VoteIcon(props) {

    let icon = <FontAwesomeIcon icon={props.icon} size="lg" />

    if (props.isClicked)
        icon = <FontAwesomeIcon icon={props.icon} color={props.color} size="lg" />

    return (
        <div>
            <a onClick={props.onClick} className="mr-1">
                {icon}
            </a>
            {props.numVotes}
        </div>
    );
}

export default CompactSongCard;