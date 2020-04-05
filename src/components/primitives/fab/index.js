import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

class Fab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.className}>
        <button onClick={this.props.onClick} className='fab'>
          <span className='fabBar'></span>
          <span className='fabBar'></span>
        </button>
      </div>
    );
  }
}

Fab.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired
};

export default Fab;
