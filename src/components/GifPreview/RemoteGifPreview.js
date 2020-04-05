import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import apiService from 'services/api/apiService';
import './styles.scss';

class RemoteGifPreview extends Component {
  constructor(props) {
    super(props);
  }

  onDownload = () => {
    const gifName = this.props.gifName || 'dranimate';
    apiService.getGifBlob(this.props.src)
      .then(gifBlob => FileSaver.saveAs(gifBlob, `${gifName}.gif`))
      .catch(error => console.log('error', error));
  };

  onNameChange = gifName => {
    console.log('TODO: update gif name')
  };

  render() {
    return (
      <div className='gifPreviewScrim'>
        <div className='gifPreviewContents'>
          <MaterialInput
            type='text'
            label='GIF Name'
            onChange={this.onNameChange}
          />
          <img
            src={this.props.src}
            className='gif'
          />
          <div className='gifPreviewOptions'>
            <Button onClick={this.onDownload}>
              Download
            </Button>
            <Button onClick={this.props.closeGifPreview}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

RemoteGifPreview.propTypes = {
  src: PropTypes.string.isRequired,
  gifName: PropTypes.string.isRequired,
  closeGifPreview: PropTypes.func.isRequired,
  // openLoader: PropTypes.func.isRequired,
  // closeLoader: PropTypes.func.isRequired
};

export default RemoteGifPreview;
