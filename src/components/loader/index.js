import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class Loader extends Component {
  constructor(props) {
    super(props);
  }

  showLoader() {
    return (
      <div className={styles.scrim}>
        <div className={styles.test}>
          <div>
            <div className={styles.loaderDots} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.isVisible) {
      return this.showLoader();
    }
    return (<div />);
  }
}

Loader.propTypes = {
  isVisible: PropTypes.bool.isRequired
};

export default Loader;
