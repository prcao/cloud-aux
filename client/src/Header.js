import React, { Component } from 'react';
import { Navbar, NavbarBrand, InputGroup, InputGroupAddon, Input, Button, Collapse, Nav, NavLink, NavItem, NavbarToggler } from 'reactstrap';
import { Redirect } from 'react-router-dom';

class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            navbarOpened: false,
            joinPartyText: ''
        };
    }

    toggleNavbar = () => {
        this.setState({
            navbarOpened: !this.state.navbarOpened
        });
    }

    onChange = (e) => {
        this.setState({
            joinPartyText: e.target.value
        });
    }

    onClick = () => {

        this.setState({
            redirect: this.state.joinPartyText
        });
    }

    render() {

        if (this.state.redirect) {
            return <Redirect push to={this.state.redirect} />
        }

        return (
            <Navbar color="dark" light expand="md">

                <NavbarBrand className="text-white">Cloud Aux</NavbarBrand>
                <NavbarToggler onClick={this.toggleNavbar}></NavbarToggler>

                <Collapse isOpen={this.state.navbarOpened} navbar>
                    <Nav className="ml-auto">
                        <NavItem md="12">
                            <NavLink href="/" style={{ color: 'white' }}>Home</NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}

export default Header;