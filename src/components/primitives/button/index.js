import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class Button extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
      	className={ `${styles.button} ${this.props.className}` }
      	onClick={ this.props.onClick }>
        { this.props.children }
      </button>
    );
  }
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default Button;
