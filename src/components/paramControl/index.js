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
import IconMoveFront from '../../../resources/static/imgs/icon_movetofront.svg';
import IconMoveBack from '../../../resources/static/imgs/icon_movetoback.svg';
import IconEditPuppet from '../../../resources/static/imgs/icon_editpuppet.svg';
import IconSavePuppet from '../../../resources/static/imgs/icon_save.svg';
import IconDeletePuppet from '../../../resources/static/imgs/icon_delete.svg';
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


        <div className={styles.singleIconTopBar}>
                <IconMoveFront
                className={ styles.icon }
                onClick={ this.onMoveUp }
                />
                  <p>Bring Front</p>
        </div>
        <div className={styles.singleIconTopBar}>
                <IconMoveBack
                className={ styles.icon }
                onClick={ this.onMoveBack }
                />
                  <p>Send Back</p>
        </div>
        <div className={styles.singleIconTopBar}>
                <IconEditPuppet
                className={ styles.icon }
                onClick={this.props.onEditSelectedPuppet}
                />
                  <p>Edit</p>
        </div>

        {/*
          {
          userService.isAuthenticated() ?
          */}
          <div className={styles.singleIconTopBar}>
                  <IconSavePuppet
                  className={ styles.icon }
                  onClick={this.onSaveToServer}
                  />
                    <p>Save</p>
          </div>   {/*: null
        }
*/}
        <div className={styles.singleIconTopBar}>
                <IconDeletePuppet
                className={ styles.icon }
              onClick={this.props.onDeleteSelectedPuppet}
                />
                  <p>Delete</p>
        </div>



  {/*
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


        <Button
          className={ styles.actionButton }
          onClick={this.props.onDeleteSelectedPuppet}
        >
          Remove Puppet
        </Button>

        <div className={ styles.buttonRow }>
          <Button
            className={ styles.actionButton }

          >
            Move Up
          </Button>
          <Button
            className={ styles.actionButton }

          >
            Move Back
          </Button>

        </div>

        <Button
          className={ styles.actionButton }
          onClick={() => this.props.selectedPuppet.clearRecording() }
        >
          Clear Recording
        </Button>

  */}
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
