import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import userService from 'services/api/userService';
import apiService from 'services/api/apiService';
import { loadFile } from 'services/util/file';
import styles from './styles.scss';

class GifPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      base64Gif: '',
      gifName: ''
    };
  }

  componentWillMount() {
    loadFile(this.props.gifBlob)
      .then(base64Gif => this.setState({ base64Gif} ));
  }

  onDownload = () => {
    const gifName = this.state.gifName || 'dranimate';
    FileSaver.saveAs(this.props.gifBlob, `${gifName}.gif`);
  };

  onSaveToServer = () => {
    const gifName = this.state.gifName || 'dranimate';
    this.props.openLoader('Saving GIF');
    apiService.saveGif(this.props.gifBlob, gifName)
      .then(() => this.props.closeLoader())
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  }

  onNameChange = gifName => this.setState({ gifName });

  render() {
    return (
      <div className={styles.gifPreviewScrim}>
        <div className={styles.gifPreviewContents}>
          <MaterialInput
            type='text'
            label='GIF Name'
            onChange={this.onNameChange}
          />
          <img
            src={this.state.base64Gif}
            className={styles.gif}
          />
          <div className={styles.gifPreviewOptions}>
            <Button onClick={this.onDownload}>
              Download
            </Button>
            {
              userService.isAuthenticated() ?
                <Button onClick={this.onSaveToServer}>
                  Save to Server
                </Button> : null
            }
            <Button onClick={this.props.closeGifPreview}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

GifPreview.propTypes = {
  gifBlob: PropTypes.object.isRequired,
  closeGifPreview: PropTypes.func.isRequired,
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default GifPreview;
