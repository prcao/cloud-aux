import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import Header from '../Header';
import { Redirect } from 'react-router-dom';
import { Button, Input, Label, FormGroup, Form, Container, InputGroup, InputGroupAddon, Row, Col } from 'reactstrap';

function Index(props) {
    return (
        <div className="App">
            <Header/>
            <RoomMenu/>
        </div>
    );
}

class RoomMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            createPartyName: null,
            joinPartyName: null,
            createPartyHelpText: {
                text: '',
            },
            createButtonDisabled: true,
            joinButtonDisabled: true
        }

        this.socket = openSocket();
    }
    
    componentDidMount() {
        //check if room exists
        this.socket.on('index/roomExists', this.roomExists);
    }

    componentWillUnmount() {
        this.socket.removeListener('index/roomExists', this.roomExists);
        this.socket.disconnect();
    }

    roomExists = (roomExists) => {

        this.setState({ createButtonDisabled: true });

        if(roomExists) {
            this.setState({
                createPartyHelpText: {
                    text: "That room already exists, try another name!",
                    color: "danger"
                }
            });
        } else {
            this.setState({
                createButtonDisabled: false,
                createPartyHelpText: {
                    text: "That name is available!",
                    color: "success"
                }
            });
        }
    }

    //react component functions
    handleCreateChange = (e) => {
        this.socket.emit('index/roomInputNameChange', e.target.value);
        this.setState({
            createPartyName: e.target.value,
            createButtonDisabled: true,
            createPartyHelpText: null
        });
    }

    handleJoinChange = (e) => {
        this.setState({
            joinPartyName: e.target.value,
            joinButtonDisabled: e.target.value === ''
        });
    }

    joinParty = () => {
        this.setState({
            redirectJoin: true
        });
    }

    createParty = () => {
        this.socket.emit('index/createRoom', this.state.createPartyName);
        this.setState({
            redirectCreate: true
        });
    }

    render() {

        if (this.state.redirectCreate) {
            return <Redirect push to={"/room/" + this.state.createPartyName} />
        }

        if (this.state.redirectJoin) {
            return <Redirect push to={"/room/" + this.state.joinPartyName} />
        }

        return (
            <Container className="my-5">
                <RoomInput label="Create Party"
                    buttonDisabled={this.state.createButtonDisabled}
                    onClick={this.createParty}
                    handleChange={this.handleCreateChange}
                    helpText={this.state.createPartyHelpText}
                >
                </RoomInput>
                <RoomInput label="Join Party"
                    onClick={this.joinParty}
                    buttonDisabled={this.state.joinButtonDisabled}
                    handleChange={this.handleJoinChange}
                >
                </RoomInput>
            </Container>
        );
    }
}

// Form for inputting/submitting room
function RoomInput(props) {
    return (
        <div className="my-5">
            <Row>
                <Col xs="2">
                    <Label>
                        <Label>{props.label}</Label>
                    </Label>
                </Col>

                <Col>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">Name</InputGroupAddon>
                        <Input
                            type="text"
                            placeholder="MyPartyName"
                            onChange={props.handleChange} />
                        <InputGroupAddon addonType="append">
                            <Button disabled={props.buttonDisabled} onClick={props.onClick}>Go</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
            </Row>

            <HelpText className="position-absolute" value={props.helpText}></HelpText>
        </div>
    );
}

function HelpText(props) {
    if (props.value) {
        return <p className={"text-" + props.value.color}>{props.value.text}</p>
    }

    return <p className="invisible">&nbsp;</p>
}

export default Index;