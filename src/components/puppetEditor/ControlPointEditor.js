import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Checkbox from 'components/primitives/checkbox';
import Slider from 'components/primitives/slider';
import ZoomPanner from 'components/zoomPanner';
import dranimate from 'services/dranimate/dranimate';
import ControlPointService from 'services/imageToMesh/ControlPointService';
import generateUniqueId from 'services/util/uuid';
import styles from './styles.scss';


class ControlPointEditor extends Component {
  componentWillMount() {
    this.controlPointService = new ControlPointService();
  }

  componentDidMount() {
    this.canvasElement.width = 400;
    this.canvasElement.height = 300;

    this.controlPointService.init(
      this.canvasElement,
      this.props.imageSrc,
      this.props.backgroundRemovalData,
      this.props.controlPointPositions
    );

    // passive touch event listeners seem to be needed, which react does not support
    this.canvasElement.addEventListener(
      'touchmove',
      event => this.controlPointService.onTouchMove(event),
      { passive: false }
    );
  }

  onSave = () => this.props.onSave(this.controlPointService.getControlPoints())

  render() {
    return (
      <div>

        <div className={styles.editorNav}>
          <Button
            onClick={this.props.onClose}
            className={styles.navButton}
          >
            Back
          </Button>
          <Button
            onClick={this.onSave}
            className={styles.navButton}
          >
            Done
          </Button>
        </div>

        <div>
          <canvas
            className={styles.editorCanvasChecker}
            ref={input => this.canvasElement = input}
            onMouseMove={this.controlPointService.onMouseMove}
            onMouseDown={this.controlPointService.onMouseDown}
            onContextMenu={this.controlPointService.onContextMenu}
            onMouseUp={this.controlPointService.onMouseUp}
            onMouseOut={this.controlPointService.onMouseOut}
            onMouseOver={this.controlPointService.onMouseOver}
            onTouchStart={this.controlPointService.onTouchStart}
            onTouchEnd={this.controlPointService.onTouchEnd}
            onDoubleClick={this.controlPointService.onDoubleClick}
          />
        </div>

        <div className={styles.editorControlParam}>
          <div className={styles.editorControlRow}>
            <div className={styles.editorControlLabel}>
              <p>2</p>
            </div>
            <p>Control Points</p>
          </div>
        </div>

      </div>
    );
  }
}

ControlPointEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  imageSrc: PropTypes.string.isRequired,
  backgroundRemovalData: PropTypes.object.isRequired,
  controlPointPositions: PropTypes.array
};

export default ControlPointEditor;
