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
        <div className={styles.loaderContainer}>
          {
            this.props.message ?
              <p className={styles.loaderText}>
                {this.props.message}
              </p> : null
          }
          <div className={styles.loaderDots} />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.isVisible) {
      return this.showLoader();
    }
    return (null);
  }
}

Loader.defaultProps = {
  message: ''
};

Loader.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  message: PropTypes.string
};

export default Loader;
