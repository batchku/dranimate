import React, { Component } from 'react';
import styles from './styles.scss';

class TopBar extends Component {
  onInfoClick = () => console.log('onInfoClick');

  render() {
    return (
      <div className={styles.topbar}>
        <div className={`${styles.topbarItem} ${styles.aboutContainer}`}>
          <p className={styles.aboutLabel}>Dranimate</p>
          <p className={styles.aboutInfo}>About</p>
        </div>
      </div>
    );
  }
}

export default TopBar;
