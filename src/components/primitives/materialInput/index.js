import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

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

  onChange = event => {
    event.preventDefault();
    event.stopPropagation();
    const value = event.target.value;
    this.setState({ value })
    this.props.onChange(value);
  };

  render() {
    return (
      <div className={ `${styles.container} ${this.props.className}` }>
        <input
          type={ this.props.type || 'text' }
          onChange={ this.onChange }
          value={ this.state.value }
          className={ styles.materialInput }
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
