import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Checkbox from 'components/primitives/checkbox';
import Loader from 'components/loader';
import Slider from 'components/primitives/slider';
import ZoomPanner from 'components/zoomPanner';
import dranimate from 'services/dranimate/dranimate';
import ImageEditorService from 'services/imageToMesh/imageEditorService';
import generateUniqueId from 'services/util/uuid';
import styles from './styles.scss';


class ImageEditor extends Component {
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
    this.imageEditorService = new ImageEditorService();
  }

  componentDidMount() {
    this.canvasElement.width = 400;
    this.canvasElement.height = 300;
    // this.imageEditorService.setup(this.canvasElement);

    // console.log('this.props.imgSrc', this.props.imageSrc);
    // console.log('this.props.backgroundRemovalData', this.props.backgroundRemovalData);

    // this.imageEditorService.editImage(this.props.imageSrc, this.props.backgroundRemovalData)
    //   .then(() => this.runSlic())
    //   .catch(error => console.log('error', error));

    this.imageEditorService.init(this.canvasElement, this.props.imageSrc, this.props.backgroundRemovalData)
      .then(() => this.runSlic())
      .catch(error => console.log('error', error));

    // passive touch event listeners seem to be needed, which react does not support
    this.canvasElement.addEventListener(
      'touchmove',
      event => this.imageEditorService.onTouchMove(event),
      { passive: false }
    );
  }

  runSlic = () => {
    console.log('.......runslic')
    this.setState({ loaderIsVisible: true });
    setTimeout(() => {
      this.imageEditorService.doSlic(this.state.threshold);
      this.setState({ loaderIsVisible: false });
    });
  };

  updateThresholdUi = threshold => this.setState({ threshold });

  onZoomSelect = isZoomIn => isZoomIn ?
    this.imageEditorService.zoomIn() : this.imageEditorService.zoomOut();

  onCanvasSelectType = event => {
    const selector = event.target.checked ? 'SELECT' : 'DESELECT';
    this.imageEditorService.setSelectState(selector);
    this.setState({ selector });
  }

  onEraseDrawChange = eraseDraw => {
    const selector = eraseDraw ? 'SELECT' : 'DESELECT';
    this.setState({ eraseDraw });
    this.imageEditorService.setSelectState(selector);
  };

  onNext = () => {
    console.log('TODO: ship out data');
    const imageForegroundSelection = this.imageEditorService.getImageForegroundSelection();
    this.props.onNext(imageForegroundSelection);
  };

  render() {
    return (
      <div>

        <div className={styles.editorNav}>
          <Button
            onClick={this.props.onCancel}
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

        <div>
          <canvas
            className={styles.editorCanvas}
            ref={input => this.canvasElement = input}
            onMouseMove={this.imageEditorService.onMouseMove}
            onMouseDown={this.imageEditorService.onMouseDown}
            onContextMenu={this.imageEditorService.onContextMenu}
            onMouseUp={this.imageEditorService.onMouseUp}
            onMouseOut={this.imageEditorService.onMouseOut}
            onMouseOver={this.imageEditorService.onMouseOver}
            onTouchStart={this.imageEditorService.onTouchStart}
            onTouchEnd={this.imageEditorService.onTouchEnd}
            onDoubleClick={this.imageEditorService.onDoubleClick}
          />
          <ZoomPanner
            onZoomSelect={this.onZoomSelect}
            />
        </div>

        <div className={styles.editorControlParam}>
          <div className={styles.editorControlRow}>

            <div className={styles.editorControlLabel}>
              <p>2</p>
            </div>
            <p>Select Image</p>

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

      </div>
    );
  }
}

ImageEditor.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  imageSrc: PropTypes.string.isRequired,
  backgroundRemovalData: PropTypes.object
};

export default ImageEditor;
