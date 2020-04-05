import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

class MaterialInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.initialValue });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.initialValue !== this.props.initialValue) {
      this.setState({ value: newProps.initialValue });
    }
  }

  onChange = event => {
    event.preventDefault();
    event.stopPropagation();
    const value = event.target.value;
    this.setState({ value })
    this.props.onChange(value);
  };

  render() {
    return (
      <div className={ `container ${this.props.className}` }>
        <input
          type={ this.props.type || 'text' }
          onChange={ this.onChange }
          value={ this.state.value }
          className='materialInput'
          required
        />
        <span className='highlight'></span>
        <span className='bar'></span>
        <label className='label'>
          { this.props.label }
        </label>
      </div>
    );
  }
}

MaterialInput.defaultProps = {
  initialValue: ''
};

MaterialInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  initialValue: PropTypes.string
};

export default MaterialInput;
