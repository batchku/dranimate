import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Fab from 'components/fab';
import TopBar from 'components/topbar';
import styles from './styles.scss';

class Stage extends Component {

  constructor() {
    super();
    this.state = {
      puppets: []
    };
  }

  onFabClick = () => {
    this.setState({
      puppets: this.state.puppets.concat(Math.random())
    });
  }

  renderPuppet(puppet) {
    return (
      <div key={puppet}>
        <Link to="/editor">Puppet {puppet}</Link>
      </div>
    );
  }

  renderPuppets() {
    return (
      <div className={styles.puppetContainer}>
        { this.state.puppets.map(this.renderPuppet) }
      </div>
    );
  }

  render() {
    return (
      <div>
        <TopBar />
        {this.renderPuppets()}
        <Fab
          className={styles.fab}
          onClick={this.onFabClick}
        />
      </div>
    );
  }
}

export default Stage;
