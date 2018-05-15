import React, { Component } from 'react';
import styles from './styles.scss';

class TopBar extends Component {
  onInfoClick = () => console.log('onInfoClick');

  render() {
    return (
      <div className={this.props.className}>

      <div className={styles.logo}>
      <img src={require('../../../resources/static/imgs/logo.png')} width="159.8" height="22.1"/>
      {/* }<p className={styles.aboutInfo}>About</p> */}


      </div>
      </div>
    );
  }
}

export default TopBar;
