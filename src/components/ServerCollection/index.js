import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import apiService from 'services/api/apiService';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class ServerCollection extends Component {

  constructor() {
    super();
    this.state = {
      puppets: [],
      gifs: []
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

  onSaveCurrentPuppet = () => {
    const selectedPuppet = dranimate.getSelectedPuppet();
    if (!selectedPuppet) { return; }
    this.props.openLoader();
    apiService.savePuppet(selectedPuppet)
      .then(() => {
        this.props.closeLoader();
        this.getAllPuppets();
      })
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  };

  onOpenPuppet = (puppetModel) => {
    this.props.openLoader();
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
    this.props.openLoader();
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
    this.props.openLoader();
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

  render() {
    return (
      <div className={ this.props.className }>
        <Button onClick={ this.onSaveCurrentPuppet }>
          Save current puppet
        </Button>

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
                  Open
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
                <Button onClick={() => this.onDeleteGif(gifModel)}>
                  Delete
                </Button>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

ServerCollection.propTypes = {
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default ServerCollection;
