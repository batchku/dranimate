import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import PuppetEditor from 'components/puppetEditor';
import Stage from 'components/stage';
import baseStyles from 'styles/baseStyles.scss';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Stage} />
          <Route path="/editor" component={PuppetEditor} />
        </div>
      </Router>
    );
  }
}

export default App;
