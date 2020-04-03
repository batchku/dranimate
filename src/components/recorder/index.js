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
  }

  componentWillUnmount() {
    document.removeEventListener(this.keyListener);
  }

  onGifRecordToggle = () => {
    const gifIsRecording = !this.state.gifIsRecording;
    this.setState({ gifIsRecording });
    const gifBuilder = dranimate.setGifIsRecording(gifIsRecording);

    if (!gifBuilder) { return; }
    this.props.openLoader('Saving GIF');
    gifBuilder.buildGif()
      .then(gifBlob => {
        this.props.closeLoader();
        this.props.gifPreviewAvailable(gifBlob);
      })
      .catch(error => console.log('gif error', error));
  };

  render() {
    return (
      <div className={this.props.className}>
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

Recorder.propTypes = {
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired,
  gifPreviewAvailable: PropTypes.func.isRequired
};

export default Recorder;
