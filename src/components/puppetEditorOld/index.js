import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Checkbox from 'components/primitives/checkbox';
import Loader from 'components/loader';
import Slider from 'components/primitives/slider';
import ZoomPanner from 'components/zoomPanner';
import dranimate from 'services/dranimate/dranimate';
import editorHelper from 'services/imageToMesh/EditorHelper';
import ImageToMesh from 'services/imageToMesh/imageToMesh';
import generateUniqueId from 'services/util/uuid';
import styles from './styles.scss';


class PuppetEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eraseDraw: true,
      selector: 'SELECT',
      threshold: 30,
      loaderIsVisible: false,
      step: 0
    };
  }

  componentWillMount() {
    this.imageToMesh = new ImageToMesh();
  }

  componentDidMount() {
    //ali asks: how do we make this width dynamic
    this.canvasElement.width = 400;
    this.canvasElement.height = 300;
    this.imageToMesh.setup(this.canvasElement);
    // TODO: image to puppet needs 2 instantiation methods: 'fromImage' and 'fromPuppet'
    if (editorHelper.isPuppet) {
      const puppet = editorHelper.getItem();
      this.imageToMesh.editImage(
        puppet.image.src,
        puppet.controlPointPositions,
        puppet.backgroundRemovalData
      )
      .then(() => this.runSlic())
      .catch(error => console.log('error', error));
    }
    else if (editorHelper.getItem()) {
      this.imageToMesh.editImage(editorHelper.getItem())
        .then(() => this.runSlic())
        .catch(error => console.log('error', error));
    }
    else {
      this.props.onClose();
    }

    // passive touch event listeners seem to be needed, which react does not support
    this.canvasElement.addEventListener(
      'touchstart',
      event => this.imageToMesh.onTouchStart(event),
      { passive: false }
    );
    // TODO: maybe only touchmove needs to be passive
    this.canvasElement.addEventListener(
      'touchmove',
      event => this.imageToMesh.onTouchMove(event),
      { passive: false }
    );
    this.canvasElement.addEventListener(
      'touchend',
      event => this.imageToMesh.onTouchEnd(event),
      { passive: false }
    );
  }

  runSlic = () => {
    console.log('.......runslic')
    this.setState({ loaderIsVisible: true });
    setTimeout(() => {
      this.imageToMesh.doSlic(this.state.threshold);
      this.setState({ loaderIsVisible: false });
    });
  };

  onCancel = () => {
    this.props.onClose();
  };

  onNext = () => {
    const step = (this.state.step + 1 ) % 2;
    this.onStepChange(step);
  }

  onBack = () => {
    const step = (this.state.step - 1 + 2) % 2;
    this.onStepChange(step);
  }

  onStepChange = (step) => {
    if (step === 0) {
      // set to draw / erase
      const selector = this.state.eraseDraw ? 'SELECT' : 'DESELECT';
      this.imageToMesh.setSelectState(selector);
    }
    else {
      this.imageToMesh.setSelectState('CONTROL_POINT');
    }
    this.setState({ step });
  };

  onSave = () => {
    if (this.imageToMesh.getControlPoints().length < 2) {
      alert('Puppet must have at least two control points');
      return;
    }
    const puppetId = editorHelper.isPuppet ? editorHelper.getItem().id : generateUniqueId();
    this.imageToMesh.generateMesh(puppetId)
      .then((puppet) => {
        if (puppet) {
          dranimate.addPuppet(puppet);
        }
        this.props.onClose();
      });
  }

  updateThresholdUi = threshold => this.setState({ threshold });

  onZoomSelect = isZoomIn => isZoomIn ?
    this.imageToMesh.zoomIn() : this.imageToMesh.zoomOut();

  onCanvasSelectType = event => {
    const selector = event.target.checked ? 'SELECT' : 'DESELECT';
    this.imageToMesh.setSelectState(selector);
    this.setState({ selector });
  }

  onEraseDrawChange = eraseDraw => {
    const selector = eraseDraw ? 'SELECT' : 'DESELECT';
    this.setState({ eraseDraw });
    this.imageToMesh.setSelectState(selector);
  };

  renderStepOneNav() {
    return (
      <div className={styles.editorNav}>
        <Button
          onClick={this.onCancel}
          className={ styles.navButton }
        >
          Cancel
        </Button>
        <Button
          onClick={this.onNext}
          className={ styles.navButton }
        >
          Next
        </Button>
      </div>
    );
  }

  renderStepTwoNav() {
    return (
      <div className={styles.editorNav}>
        <Button
          onClick={this.onBack}
          className={ styles.navButton }
        >
          Back
        </Button>
        <Button
          onClick={this.onSave}
          className={ styles.navButton }
        >
          Done
        </Button>
      </div>
    );
  }

  renderStepOneControls() {
    return (
      <div className={styles.editorControlParam}>
        <div className={styles.editorControlRow}>

          <p className={styles.editorControlLabel}>1</p>

          <div className={`${styles.editorControlRow} ${styles.rowSpaceAround}`}>

            <div>
              <Checkbox
                defaultChecked={ this.state.eraseDraw }
                onChange={ this.onEraseDrawChange }
              />
              <p className={styles.drawEraseLabel}>
                { this.state.eraseDraw ? 'Draw' : 'Erase'}
              </p>
            </div>

            <div>
              <label htmlFor='thresholdSlider'>Selection Threshold</label>
              <Slider
                min={ 20 }
                max={ 75 }
                defaultValue={ this.state.threshold }
                onChange={ this.updateThresholdUi }
                onChangeEnd={ this.runSlic }
              />
              <span>{this.state.threshold}</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  renderStepTwoControls() {
    return (
      <div className={styles.editorControlParam}>
        <div className={styles.editorControlRow}>
          <div className={styles.editorControlLabel}>
            <p>2</p>
          </div>
          <p>Control Points</p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className={styles.scrim}>
        <div className={styles.puppetEditor}>
          {
            this.state.step === 0 ?
              this.renderStepOneNav() :
              this.renderStepTwoNav()
          }

          <div>
            <canvas
              className={styles.editorCanvas}
              ref={input => this.canvasElement = input}
              onMouseMove={this.imageToMesh.onMouseMove}
              onMouseDown={this.imageToMesh.onMouseDown}
              onContextMenu={this.imageToMesh.onContextMenu}
              onMouseUp={this.imageToMesh.onMouseUp}
              onMouseOut={this.imageToMesh.onMouseOut}
              onMouseOver={this.imageToMesh.onMouseOver}
              onDoubleClick={this.imageToMesh.onDoubleClick}
            />
            <ZoomPanner
              onZoomSelect={this.onZoomSelect}
              />
          </div>

          {
            this.state.step === 0 ?
              this.renderStepOneControls() :
              this.renderStepTwoControls()
          }

          <Loader isVisible={this.state.loaderIsVisible} />
        </div>
      </div>
    );
  }
}

PuppetEditor.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default PuppetEditor;
