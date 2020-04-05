import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

class Loader extends Component {
  constructor(props) {
    super(props);
  }

  showLoader() {
    return (
      <div className='scrim'>
        <div className='loaderContainer'>
          {
            this.props.message ?
              <p className='loaderText'>
                {this.props.message}
              </p> : null
          }
          <div className='loaderDots' />
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
