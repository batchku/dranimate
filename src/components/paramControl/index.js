import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Slider from 'components/primitives/slider';
import savePuppetToFile from 'services/storage/serializer';
import styles from './styles.scss';

class ParamControl extends Component {
  constructor(props) {
    super(props);
  }

  onSaveClick = () => savePuppetToFile(this.props.selectedPuppet);

  onScaleChange = eventValue => {
    const value = parseInt(eventValue) / 100;
    this.props.selectedPuppet.setScale(value);
  };

  onRotateChange = eventValue => {
    const value = parseFloat(eventValue) / 100;
    this.props.selectedPuppet.setRotation(value);
  };

  renderPanel() {
    return (
      <div className={this.props.className}>
        <p>Params:</p>
        <p>Scale</p>
        <Slider
          min={ 1 }
          max={ 300 }
          defaultValue={ 100 }
          onChange={ this.onScaleChange }
        />
        <p>Rotate</p>
        <Slider
          min={ -628 }
          max={ 628 }
          defaultValue={ this.props.selectedPuppet.getRotation() }
          onChange={ this.onRotateChange }
        />

        <p className={styles.actionLabel}>Actions:</p>
        <Button
          className={ styles.actionButton }
          onClick={this.props.onEditSelectedPuppet}
        >
          Edit puppet
        </Button>
        <Button
          className={ styles.actionButton }
          onClick={this.onSaveClick}
        >
          Save puppet
        </Button>
        <Button
          className={ styles.actionButton }
          onClick={this.props.onDeleteSelectedPuppet}
        >
          Delete puppet
        </Button>
      </div>
    );
  }

  render() {
    return this.props.selectedPuppet ? this.renderPanel() : null;
  }
}

ParamControl.propTypes = {
  selectedPuppet: PropTypes.object,
  onDeleteSelectedPuppet: PropTypes.func.isRequired,
  onEditSelectedPuppet: PropTypes.func.isRequired
};

export default ParamControl;
