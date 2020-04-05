import React, { Component } from 'react';
import PropTypes from 'prop-types';
import generateUniqueId from 'services/util/uuid';
import './styles.scss';

class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uniqueId: generateUniqueId()
    };
  }

  onChange = event => this.props.onChange(event.target.checked);

  render() {
    return (
      <div>
        <input
        	className='checkboxInput checkboxInputHidden'
        	type="checkbox"
          defaultChecked={ this.props.defaultChecked }
          id={ this.state.uniqueId }
          onChange={ this.onChange }
        />
        <label
          htmlFor={ this.state.uniqueId }
          className='checkboxLabel'
        />
      </div>
    );
  }
}

Checkbox.propTypes = {
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default Checkbox;
