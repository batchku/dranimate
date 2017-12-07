import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false
    };
    this.keyListener = window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener(this.keyListener);
  }

  onRecordToggle = () => {
    const isRecording = !this.state.isRecording;
    this.setState({ isRecording });
    dranimate.setRecording(isRecording);
  };

  handleKeyPress = event => {
    if (!event.code === 'Space') { return; }
    this.onRecordToggle();
  };

  render() {
    return (
      <div className={this.props.className}>
        <button
          className={ this.state.isRecording ? styles.recorder : styles.recorderActive }
          onClick={this.onRecordToggle}
        >
          { this.state.isRecording ? 'Stop' : 'Record' }
        </button>
      </div>
    );
  }
}

Recorder.propTypes = {};

export default Recorder;
