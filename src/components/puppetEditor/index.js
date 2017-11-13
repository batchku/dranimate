import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { withRouter } from 'react-router'
import Loader from 'components/loader';
import ZoomPanner from 'components/zoomPanner';
import ImageToMesh from 'services/imageToMesh/imageToMesh'
import editorHelper from 'services/imageToMesh/EditorHelper';
import generateUniqueId from 'services/util/uuid';
import requestPuppetCreation from 'services/puppet/PuppetFactory';
import styles from './styles.scss';

class PuppetEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectionType: 'crop',
      selector: 'select',
      threshold: 30,
      loaderIsVisible: false
    };
    this.imageToMesh = new ImageToMesh();
  }

  componentDidMount() {
    console.log('mounted');
    // const canvasElement = document.getElementById('edit-mesh-canvas');
    const puppetImageSrc = editorHelper.getItem();
    this.imageToMesh.setup(this.canvasElement);
    if (editorHelper.isPuppet) {
      const puppet = editorHelper.getItem();
      this.imageToMesh.editImage(
        puppet.image.src,
        puppet.controlPointPositions,
        puppet.backgroundRemovalData
      )
      .then(() => this.runSlic());
    }
    else if (puppetImageSrc) {
      this.imageToMesh.editImage(editorHelper.getItem())
        .then(() => this.runSlic());
    }
    else {
      this.props.onClose();
    }
  }

  runSlic = () => {
    this.setState({ loaderIsVisible: true });
    setTimeout(() => {
      this.imageToMesh.doSlic(this.state.threshold);
      this.setState({ loaderIsVisible: false });
    });
  }

  onCancel = () => {
    // TODO: destroy imageToMesh
    this.props.onClose();
  };

  onSave = () => {
    this.imageToMesh.generateMesh()
      .then(() => {
        const id = editorHelper.isPuppet ? editorHelper.getItem().id : generateUniqueId();
        const puppetParams = {
          id,
          vertices: this.imageToMesh.getVertices(),
          faces: this.imageToMesh.getTriangles(),
          controlPoints: this.imageToMesh.getControlPointIndices(),
          controlPointPositions: this.imageToMesh.getControlPoints(),
          image: this.imageToMesh.getImage(),
          imageNoBG: this.imageToMesh.getImageNoBackground(),
          backgroundRemovalData: this.imageToMesh.getBackgroundRemovalData()
        };
        const puppet = requestPuppetCreation(puppetParams);
        console.log('success?', puppet);
        // $mdDialog.hide();
        this.props.onClose();
      });
  }

  updateThresholdUi = event => this.setState({ threshold: event.target.value });

  onSelectRemove = event => {
    this.setState({ selector: event.target.value });
    this.imageToMesh.setAddPixels(event.target.value === 'select');
  }

  onControlPointCrop = event => {
    this.setState({ selectionType: event.target.value });
    this.imageToMesh.setAddControlPoints(event.target.value === 'controlPoints');
  }

  onZoomSelect = isZoomIn => isZoomIn ?
    this.imageToMesh.zoomIn() :
    this.imageToMesh.zoomOut();

  onPanSelect = isPanSelected => this.imageToMesh.setPanEnabled(isPanSelected);

  render() {
    return (
      <div className={styles.scrim}>
        <div className={styles.puppetEditor}>
          <div>
            <canvas
              className={styles.editorCanvas}
              ref={input => this.canvasElement = input}
              onMouseMove={this.imageToMesh.onMouseMove}
              onMouseDown={this.imageToMesh.onMouseDown}
              onContextMenu={this.imageToMesh.onContextMenu}
              onMouseUp={this.imageToMesh.onMouseUp}
            />
            <ZoomPanner
              onPanSelect={this.onPanSelect}
              onZoomSelect={this.onZoomSelect}
              />
          </div>
          <div>
            <h1>Edit puppet</h1>
            <p>Selection type:</p>
            <div>
              <input
                type="radio"
                name="selectionType"
                id="controlPoints"
                value="controlPoints"
                onChange={this.onControlPointCrop}
                checked={this.state.selectionType === 'controlPoints'}
              />
              <label htmlFor="controlPoints">Control Points</label>
              <input
                type="radio"
                name="selectionType"
                id="crop"
                value="crop"
                onChange={this.onControlPointCrop}
                checked={this.state.selectionType === 'crop'}
              />
              <label htmlFor="crop">Crop</label>
            </div>
            <p>Selector:</p>
            <div>
              <input
                type="radio"
                name="selector"
                id="select"
                value="select"
                onChange={this.onSelectRemove}
                checked={this.state.selector === 'select'}
              />
              <label htmlFor="select">Select</label>
              <input
                type="radio"
                name="selector"
                id="remove"
                value="remove"
                onChange={this.onSelectRemove}
                checked={this.state.selector === 'remove'}
              />
              <label htmlFor="remove">Remove</label>
            </div>

            <label htmlFor="thresholdSlider">Threshold</label>
            <input
              type="range"
              id="thresholdSlider"
              min="5"
              max="75"
              defaultValue={this.state.threshold}
              onChange={this.updateThresholdUi}
              onMouseUp={this.runSlic}
            />
            <p>{this.state.threshold}</p>
            <br />
            <button onClick={this.onCancel}>Cancel</button>
            <button onClick={this.onSave}>Save</button>
          </div>
          <Loader isVisible={this.state.loaderIsVisible} />
        </div>
      </div>
    );
  }
}

PuppetEditor.PropTypes = {
  onClose: PropTypes.func.isRequired
};

export default PuppetEditor;
