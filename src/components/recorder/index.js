import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      puppetIsRecording: false,
      gifIsRecording: false,
    };
    this.keyListener = window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener(this.keyListener);
  }

  onGifRecordToggle = () => {
    const gifIsRecording = !this.state.gifIsRecording;
    this.setState({ gifIsRecording });
    dranimate.setGifIsRecording(gifIsRecording);
  };

  onPuppetRecordToggle = (event) => {
    console.log('on puppet record toggle click')
    const puppetIsRecording = !this.state.puppetIsRecording;
    this.setState({ puppetIsRecording });
    dranimate.setRecording(puppetIsRecording);
  };

  handleKeyPress = event => {
    if (event.keyCode !== 32) { return; }
    this.onPuppetRecordToggle();
  };

  render() {
    return (
      <div className={this.props.className}>
        <Button
          className={ this.state.puppetIsRecording ? styles.recorder : styles.recorderActive }
          onClick={this.onPuppetRecordToggle}
        >
          { this.state.isRecording ? 'Puppet Stop' : 'Puppet Start' }
        </Button>
      <Button
        className={ this.state.gifIsRecording ? styles.recorder : styles.recorderActive }
        onClick={this.onGifRecordToggle}
      >
        { this.state.isRecording ? 'GIF Stop' : 'GIF Start' }
      </Button>
      </div>
    );
  }
}

Recorder.propTypes = {};

export default Recorder;
