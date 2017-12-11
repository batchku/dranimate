import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class Fab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.className}>
        <button onClick={this.props.onClick} className={styles.fab}>
          <span className={styles.fabBar}></span>
          <span className={styles.fabBar}></span>
        </button>
      </div>
    );
  }
}

Fab.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired
};

export default Fab;
