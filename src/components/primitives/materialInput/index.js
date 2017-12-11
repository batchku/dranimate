import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class MaterialInput extends Component {
  constructor(props) {
    super(props);
  }

  onChange = event => this.props.onChange(event.target.value);

  render() {
    return (
      <div className={ `${styles.container} ${this.props.className}` }>
        <input
          type={ this.props.type || 'text' }
          onChange={ this.onChange }
          className={styles.materialInput}
          required
        />
        <span className={styles.highlight}></span>
        <span className={styles.bar}></span>
        <label className={styles.label}>
          { this.props.label }
        </label>
      </div>
    );
  }
}

MaterialInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default MaterialInput;
