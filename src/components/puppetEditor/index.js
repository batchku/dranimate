import React, { Component } from 'react';
import { withRouter } from 'react-router'
import ImageToMesh from 'services/imageToMesh/imageToMesh'
import editorHelper from 'services/imageToMesh/EditorHelper';
import styles from './styles.scss';

const SELECTION_TYPE = {
  CONTROL_POINTS: 'CONTROL_POINTS',
  CROP: 'CROP'
};

const SELECTOR = {
  SELECT: 'SELECT',
  REMOVE: 'REMOVE'
};

class PuppetEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectionType: SELECTION_TYPE.CROP,
      selector: SELECTOR.SELECT,
      threshold: 30
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
      .then(() => this.imageToMesh.doSlic($ctrl.threshold));
    }
    else if (puppetImageSrc) {
      this.imageToMesh.editImage(editorHelper.getItem())
        .then(() => this.imageToMesh.doSlic(this.state.threshold));
    }
    else {
      console.log('wut?');
      this.props.history.replace('/');
    }
  }

  onCancel = () => {
    // TODO: destroy imageToMesh
    this.props.history.push('/');
  };

  onSave = () => {
    // TODO: save puppet
    this.props.history.push('/');
  }

  updateThresholdUi = event => this.setState({ threshold: event.target.value });

  changeThreshold = () => this.imageToMesh.doSlic(this.state.threshold);

  render() {
    return (
      <div className={styles.puppetEditor}>
        <div>
          <canvas ref={input => this.canvasElement = input}></canvas>
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
            />
            <label htmlFor="controlPoints">Control Points</label>
            <input
              type="radio"
              name="selectionType"
              id="crop"
              value="crop"
              defaultChecked="checked"
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
              defaultChecked="checked"
            />
            <label htmlFor="select">Select</label>
            <input
              type="radio"
              name="selector"
              id="remove"
              value="remove"
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
            onMouseUp={this.changeThreshold}
          />
          <p>{this.state.threshold}</p>
          <br />
          <button onClick={this.onCancel}>Cancel</button>
          <button onClick={this.onSave}>Save</button>
        </div>
      </div>
    );
  }
}

export default withRouter(PuppetEditor);
