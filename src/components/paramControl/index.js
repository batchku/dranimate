import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Slider from 'components/primitives/slider';
import MaterialInput from 'components/primitives/materialInput';
import { savePuppetToFile } from 'services/storage/serializer';
import userService from 'services/api/userService';
import apiService from 'services/api/apiService';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class ParamControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultScale: 100,
      defaultRotation: 0,
    };
  }

  componentWillMount() {
    const defaultScale = Math.round(this.props.selectedPuppet.getScale() * 100);
    const defaultRotation = Math.round(this.props.selectedPuppet.getRotation() * 100);
    this.setState({ defaultScale, defaultRotation });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.selectedPuppet) { return; }
    if (nextProps.selectedPuppet.getId() === this.props.selectedPuppet.getId()) { return; }
    const defaultScale = Math.round(nextProps.selectedPuppet.getScale() * 100);
    const defaultRotation = Math.round(nextProps.selectedPuppet.getRotation() * 100);
    this.setState({ defaultScale, defaultRotation });
  }

  onDownload = () => savePuppetToFile(this.props.selectedPuppet);

  onSaveToServer = () => {
    if (!this.props.selectedPuppet) { return; }
    this.props.openLoader('Saving Puppet');
    apiService.savePuppet(this.props.selectedPuppet)
      .then(() => {
        this.props.closeLoader();
      })
      .catch(error => {
        console.log('error', error);
        this.props.closeLoader();
      });
  };

  onNameChange = name => this.props.selectedPuppet.setName(name);

  onScaleChange = eventValue => {
    const value = parseInt(eventValue) / 100;
    this.props.selectedPuppet.setScale(value);
  };

  onRotateChange = eventValue => {
    const value = parseFloat(eventValue) / 100;
    this.props.selectedPuppet.setRotation(value);
  };

  onMoveUp = () => dranimate.movePuppet(this.props.selectedPuppet, 1);

  onMoveBack = () => dranimate.movePuppet(this.props.selectedPuppet, -1);

  render() {
    return (
      <div className={this.props.className}>
        <div className={styles.paramRow}>
          <span>Scale</span>
          <Slider
            min={ 1 }
            max={ 300 }
            defaultValue={ this.state.defaultScale }
            onChange={ this.onScaleChange }
            className={ styles.paramSlider }
          />
        </div>
        <div className={styles.paramRow}>
          <span>Rotate</span>
          <Slider
            min={ -628 }
            max={ 628 }
            defaultValue={ this.state.defaultRotation }
            onChange={ this.onRotateChange }
            className={ styles.paramSlider }
          />
        </div>
        <MaterialInput
          type='text'
          label='Puppet Name'
          onChange={ this.onNameChange }
          initialValue={ this.props.selectedPuppet.getName() }
          className={ styles.puppetName }
        />
        <Button
          className={ styles.actionButton }
          onClick={this.props.onEditSelectedPuppet}
        >
          Edit Puppet
        </Button>
        <Button
          className={ styles.actionButton }
          onClick={this.onDownload}
        >
          Download Puppet
        </Button>
        {
          userService.isAuthenticated() ?
          <Button
            className={ styles.actionButton }
            onClick={this.onSaveToServer}
          >
            Save Puppet to Server
          </Button> : null
        }
        <Button
          className={ styles.actionButton }
          onClick={this.props.onDeleteSelectedPuppet}
        >
          Remove Puppet
        </Button>
        <div className={ styles.buttonRow }>
          <Button
            className={ styles.actionButton }
            onClick={ this.onMoveUp }
          >
            Move Up
          </Button>
          <Button
            className={ styles.actionButton }
            onClick={ this.onMoveBack }
          >
            Move Back
          </Button>
        </div>
      </div>
    );
  }
}

ParamControl.propTypes = {
  selectedPuppet: PropTypes.object.isRequired,
  onDeleteSelectedPuppet: PropTypes.func.isRequired,
  onEditSelectedPuppet: PropTypes.func.isRequired,
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired,
};

export default ParamControl;
