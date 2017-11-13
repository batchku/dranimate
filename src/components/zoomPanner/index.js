import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class ZoomPanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panIsSelected: false,
    };
  }

  onPanClick = () => {
    const panIsSelected = !this.state.panIsSelected;
    this.props.onPanSelect(panIsSelected);
    this.setState({ panIsSelected });
  }

  render() {
    return (
      <div>
        <button
          className={this.state.panIsSelected ? styles.panActive : styles.pan}
          onClick={this.onPanClick}
        >
          Pan
        </button>
        <button
          onClick={() => this.props.onZoomSelect(true)}
        >
          Zoom In
        </button>
        <button
          onClick={() => this.props.onZoomSelect(false)}
        >
          Zoom In
        </button>
      </div>
    );
  }
}

ZoomPanner.propTypes = {
  onPanSelect: PropTypes.func.isRequired,
  onZoomSelect: PropTypes.func.isRequired,
};

export default ZoomPanner;
