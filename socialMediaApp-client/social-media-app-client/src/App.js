import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

//pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/" Component={home} />
            <Route path="/login" Component={login} />
            <Route path="/signup" Component={signup} />
          </Switch>
        </Router>

      </div>
    )
  }
}

export default App


export default App;
