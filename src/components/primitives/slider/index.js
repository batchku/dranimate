import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class Slider extends Component {
  constructor(props) {
    super(props);
  }

  onChange = event => this.props.onChange(event.target.value);

  onChangeEnd = event => {
    if (!this.props.onChangeEnd) { return; }
    this.props.onChangeEnd(event.target.value);
  };

  render() {
    return (
      <div className={this.props.className}>
        <input
          type='range'
          min={ this.props.min }
          max={ this.props.max }
          defaultValue={ this.props.defaultValue }
          onChange={ this.onChange }
          onMouseUp={ this.onChangeEnd }
          onTouchEnd={ this.onChangeEnd }
        />
      </div>
    );
  }
}

Slider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onChangeEnd: PropTypes.func
};

export default Slider;
