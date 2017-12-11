import React, { Component } from 'react';
import PropTypes from 'prop-types';
import generateUniqueId from 'services/util/uuid';
import styles from './styles.scss';

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
        	className={ `${styles.checkboxInput} ${styles.checkboxInputHidden}` }
        	type="checkbox"
          defaultChecked={ this.props.defaultChecked }
          id={ this.state.uniqueId }
          onChange={ this.onChange }
        />
        <label
          htmlFor={ this.state.uniqueId }
          className={ styles.checkboxLabel }
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
