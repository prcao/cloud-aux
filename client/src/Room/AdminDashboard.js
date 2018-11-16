import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Container, Alert, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFastForward } from '@fortawesome/free-solid-svg-icons';

const opts = {
    height: '240',
    width: '426',
    playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1
    }
};

class AdminDashboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            alertVisible: true
        }
    }

    onDismiss = () => {
        this.setState({ alertVisible: false });
    }

    render() {

        return (

            <Container className="my-2">

                <Alert color="info" isOpen={this.state.alertVisible} toggle={this.onDismiss}>
                    <h4 className="alert-heading">You are the host of this room!</h4>
                    <p className="mb-0">Audio will play out of this device.</p>
                </Alert>

                <YouTubePlayer
                    vidId={this.props.vidId}
                    onEnd={this.props.onYoutubeEnd}
                />

                <div className="text-center">
                    <Button outline className="my-3" onClick={this.props.onYoutubeEnd}>
                        <FontAwesomeIcon icon={faFastForward} />
                        &nbsp;
                        Skip
                    </Button>
                </div>
            </Container>
        );
    }
}

class YouTubePlayer extends Component {

    render() {

        return <YouTube
            videoId={this.props.vidId}
            opts={opts}
            onEnd={this.props.onEnd}
        />
    }
}
export default AdminDashboard;