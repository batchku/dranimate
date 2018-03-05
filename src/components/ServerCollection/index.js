import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import RemoteGifPreview from 'components/GifPreview/RemoteGifPreview';
import apiService from 'services/api/apiService';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class ServerCollection extends Component {

  constructor() {
    super();
    this.state = {
      puppets: [],
      gifs: [],
      selectedGif: null,
    };
  }

  componentWillMount() {
    this.getAllPuppets();
    this.getAllGifs();
  }

  getAllPuppets() {
    apiService.getAllPuppetsForUser()
      .then(puppets => this.setState({ puppets }));
  }

  getAllGifs() {
    apiService.getAllGifsForUser()
      .then(gifs => this.setState({ gifs }));
  }

  // onSaveCurrentPuppet = () => {
  //   const selectedPuppet = dranimate.getSelectedPuppet();
  //   if (!selectedPuppet) { return; }
  //   this.props.openLoader();
  //   apiService.savePuppet(selectedPuppet)
  //     .then(() => {
  //       this.props.closeLoader();
  //       this.getAllPuppets();
  //     })
  //     .catch(error => {
  //       console.log('error', error);
  //       this.props.closeLoader();
  //     });
  // };

  onOpenPuppet = (puppetModel) => {
    this.props.openLoader('Opening Puppet');
    apiService.openPuppet(puppetModel)
      .then(puppet => {
        dranimate.addPuppet(puppet);
        this.props.closeLoader();
      })
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  };

  onDeletePuppet = (puppetModel) => {
    this.props.openLoader('Deleting Puppet');
    apiService.deletePuppet(puppetModel)
      .then(() => {
        this.props.closeLoader();
        this.getAllPuppets();
      })
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  };

  onDeleteGif = (gifModel) => {
    this.props.openLoader('Deleting GIF');
    apiService.deleteGif(gifModel)
      .then(() => {
        this.props.closeLoader();
        this.getAllGifs();
      })
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  };

  onOpenGif = (gifModel) => {
    this.setState({
      selectedGif: {
        src: gifModel.url,
        name: gifModel.name
      }
    });
  };

  onCloseGif = () => {
    this.setState({ selectedGif: null });
  };

  render() {
    return (
      <div className={ this.props.className }>
        <h3 className={styles.serverCollectionLabel}>
          Puppet Collection
        </h3>
        <div className={styles.serverCollectionContainer}>
          {
            this.state.puppets.map((puppetModel) =>
              <div key={puppetModel.getDatabaseId()} className={styles.puppetContainer}>
                <br />
                <p>Name {puppetModel.getName()}</p>
                <img
                  className={styles.puppetThumbnail}
                  src={puppetModel.thumbnailUrl} />
                <br />
                <Button onClick={this.onOpenPuppet.bind(this, puppetModel)}>
                  Add to scene
                </Button>
                <Button onClick={this.onDeletePuppet.bind(this, puppetModel)}>
                  Delete
                </Button>
              </div>
            )
          }
        </div>

        <h3 className={styles.serverCollectionLabel}>
          GIF Collection
        </h3>
        <div className={styles.serverCollectionContainer}>
          {
            this.state.gifs.map((gifModel) =>
              <div key={gifModel.getDatabaseId()} className={styles.puppetContainer}>
                <br />
                <p>Name {gifModel.getName()}</p>
                <img
                  className={styles.puppetThumbnail}
                  src={gifModel.url} />
                <br />
                <Button onClick={() => this.onOpenGif(gifModel)}>
                  Open
                </Button>
                <Button onClick={() => this.onDeleteGif(gifModel)}>
                  Delete
                </Button>
              </div>
            )
          }
        </div>
        {
          this.state.selectedGif ?
            <RemoteGifPreview
              src={ this.state.selectedGif.src }
              gifName={ this.state.selectedGif.name }
              closeGifPreview={ this.onCloseGif }
            >
            </RemoteGifPreview> : null
        }
      </div>
    );
  }
}

ServerCollection.propTypes = {
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default ServerCollection;
