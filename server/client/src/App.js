import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <p>OAuth flow</p>
        <a href="/auth/google">Sign in with Google</a> 
      </div>
    );
  }
}

export default App;
