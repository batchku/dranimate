import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageEditor from 'components/puppetEditor/ImageEditor';
import ControlPointEditor from 'components/puppetEditor/ControlPointEditor';
import Slider from 'components/primitives/slider';
import dranimate from 'services/dranimate/dranimate';
import puppetEditorStateService from './../../services/imagetomesh/PuppetEditorStateService';
import generateUniqueId from 'services/util/uuid';
import { generateMesh } from 'services/imagetomesh/generateMesh';
import { getImageDataFromImage } from 'services/imagetomesh/ImageUtil';
import loadImage from 'services/util/imageLoader';
import './styles.scss';

import eventManager from '../../services/eventManager/event-manager';

const STEPS = {
  IMAGE: 'IMAGE',
  CONTROL_POINT: 'CONTROL_POINT'
};

class PuppetEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: STEPS.IMAGE,
      imageSrc: null,
      backgroundRemovalData: null,
      controlPointPositions: null,
      zoom: 1,
    };
  }

  componentWillUnmount() {
    eventManager.emit('puppet-editor-closed');
  }

  componentWillMount() {
    eventManager.emit('puppet-editor-opened');

    if (puppetEditorStateService.isPuppet) {
      const puppet = puppetEditorStateService.getItem();
      this.setState({
        imageSrc: puppet.image.src,
        backgroundRemovalData: puppet.backgroundRemovalData || null,
        controlPointPositions: puppet.controlPointPositions
      });
    }
    else {
      this.setState({
        imageSrc: puppetEditorStateService.getItem()
      });
    }
  }

  onClose = () => this.props.onClose();

  onImageEditorNext = (backgroundRemovalData, zoom) => {
    this.setState({
      step: STEPS.CONTROL_POINT,
      backgroundRemovalData,
      zoom: zoom
    });
  }

  onControlPointEditorBack = () => {
    this.setState({
      step: STEPS.IMAGE
    });
  }

  onSave = (controlPointPositions) => {
    if (controlPointPositions.length < 2) {
      alert('Puppet must have at least two control points');
      return;
    }
    const puppetId = puppetEditorStateService.isPuppet ?
      puppetEditorStateService.getItem().id : generateUniqueId();
    const puppetName = puppetEditorStateService.isPuppet ?
      puppetEditorStateService.getItem().getName() : '';

    loadImage(this.state.imageSrc)
      .then((imageElement) => {
        const { width, height } = this.state.backgroundRemovalData;
        const originalImageData = getImageDataFromImage(imageElement, width, height);
        return generateMesh(puppetId, puppetName, imageElement, this.state.backgroundRemovalData, originalImageData, controlPointPositions);
      })
      .then((puppet) => {
        if (puppet) {
          dranimate.addPuppet(puppet);
        }
        this.onClose();
      });
  }

  render() {
    return (
      <div className='scrim'>
        <div className='puppetEditor'>
          {
            this.state.step === STEPS.IMAGE ?
              <ImageEditor
                imageSrc={this.state.imageSrc}
                backgroundRemovalData={this.state.backgroundRemovalData}
                onCancel={this.onClose}
                onNext={this.onImageEditorNext}
              /> :
              <ControlPointEditor
                imageSrc={this.state.imageSrc}
                backgroundRemovalData={this.state.backgroundRemovalData}
                controlPointPositions={this.state.controlPointPositions}
                onClose={this.onControlPointEditorBack}
                onSave={this.onSave}
                zoom={this.state.zoom}
              />
          }
        </div>
      </div>
    );
  }
}

PuppetEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  puppet: PropTypes.object,
  imageSrc: PropTypes.string
};

export default PuppetEditor;
