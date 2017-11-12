import React, { Component } from 'react';
import { withRouter } from 'react-router'
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
  }

  onCancel = () => this.props.history.push('/');

  onSave = () => this.props.history.push('/');

  onThresholdChange = event => this.setState({ threshold: event.target.value });

  render() {
    return (
      <div className={styles.puppetEditor}>
        <div>
          <canvas></canvas>
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
            onChange={this.onThresholdChange}
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
