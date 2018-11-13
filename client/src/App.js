import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    console.log("SET");
    this.state = { data: "nope" }
  }

  componentDidMount() {
    fetch('/api')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState(data);
      });
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>

        <h1>
          oops
          { this.state.data }
        </h1>
      </div>
    );
  }
}

export default App;
