import React, { Component } from 'react';
import PropTypes from 'prop-types';
import savePuppetToFile from 'services/storage/serializer';
import styles from './styles.scss';

class ParamControl extends Component {
  constructor(props) {
    super(props);
  }

  onSaveClick = () => savePuppetToFile(this.props.selectedPuppet);

  onScaleChange = event => {
    const value = parseInt(event.target.value) / 100;
    this.props.selectedPuppet.scale(value);
  };

  onRotateChange = event => {
    const value = parseFloat(event.target.value) / 100;
    this.props.selectedPuppet.rotation(value);
  };

  renderPanel() {
    return (
      <div className={this.props.className}>
        <p>Params:</p>
        <label htmlFor="scaleSlider">Scale</label>
        <input
          type="range"
          id="scaleSlider"
          min="1"
          max="300"
          onChange={this.onScaleChange}
        />
        <label htmlFor="rotateSlider">Rotate</label>
        <input
          type="range"
          id="rotateSlider"
          min="-628"
          max="628"
          onChange={this.onRotateChange}
        />
        <p>Actions:</p>
        <button onClick={this.props.onEditSelectedPuppet}>Edit puppet</button>
        <button onClick={this.onSaveClick}>Save puppet</button>
        <button onClick={this.props.onDeleteSelectedPuppet}>Delete puppet</button>
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
