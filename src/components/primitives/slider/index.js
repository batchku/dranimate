import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Slider extends Component {
  constructor(props) {
    super(props);
    this.inputElement;
    this.state = {
      value: 0
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.defaultValue });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.props.defaultValue) {
      this.setState({ value: nextProps.defaultValue });
    }
  }

  onChange = event => {
    event.preventDefault();
    const value = event.target.value;
    this.props.onChange(event.target.value);
    this.setState({ value });
  };

  onChangeEnd = event => {
    event.preventDefault();
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
          value={ this.state.value }
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
  onChangeEnd: PropTypes.func,
  defaultValue: PropTypes.number
};

export default Slider;
