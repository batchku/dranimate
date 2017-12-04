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

  renderPanButton() {
    return (
      <button
        className={this.state.panIsSelected ? styles.panActive : styles.pan}
        onClick={this.onPanClick}
      >
        Pan
      </button>
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        { this.props.onPanSelect ? this.renderPanButton() : null }
        <button
          onClick={() => this.props.onZoomSelect(true)}
        >
          Zoom In
        </button>
        <button
          onClick={() => this.props.onZoomSelect(false)}
        >
          Zoom Out
        </button>
      </div>
    );
  }
}

ZoomPanner.propTypes = {
  onPanSelect: PropTypes.func,
  onZoomSelect: PropTypes.func.isRequired,
};

export default ZoomPanner;
