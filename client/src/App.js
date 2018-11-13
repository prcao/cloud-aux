import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Index from './Index/Index'
import Room from './Room/Room';

class App extends Component {

  render() {
    return (
      <Switch>
        <Route path='/' exact component={Index} />
        <Route path='/room/:room' exact component={Room} />
      </Switch>
    );
  }
}

export default App;
