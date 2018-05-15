import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import Checkbox from 'components/primitives/checkbox';
import Loader from 'components/loader';
import Slider from 'components/primitives/slider';
import ZoomPanner from 'components/zoomPanner';
import ImageEditorService from 'services/imageToMesh/imageEditorService';
import styles from './styles.scss';
import Iconcancel from '../../../resources/static/imgs/icon_cancel.svg';
import IconPan from '../../../resources/static/imgs/icon_pan.svg';
import IconZoomin from '../../../resources/static/imgs/icon_zoomin.svg';
import IconZoomout from '../../../resources/static/imgs/icon_zoomout.svg';
import IconPen from '../../../resources/static/imgs/icon_pen.svg';
import IconEraser from '../../../resources/static/imgs/icon_eraser.svg';
import IconUndo from '../../../resources/static/imgs/icon_undo.svg';
import IconRedo from '../../../resources/static/imgs/icon_redo.svg';
import Iconnext from '../../../resources/static/imgs/icon_next.svg';



class ImageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eraseDraw: true,
      selector: 'SELECT',
      threshold: 20,
      loaderIsVisible: false,
      step: 0
    };
  }

  componentWillMount() {
    this.imageEditorService = new ImageEditorService();
  }

  componentDidMount() {
    this.canvasElement.width = 400;
    this.canvasElement.height = 400;

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

  onEraseDrawChange = eraseDraw => {
    const selector = eraseDraw ? 'SELECT' : 'DESELECT';
    this.setState({ eraseDraw });
    this.imageEditorService.setSelectState(selector);
  };

  setEraseMode = () => {
    this.setState({eraseDraw:false});
    this.imageEditorService.setSelectState('DESELECT');
  }

  setDrawMode = () => {
    this.setState({eraseDraw:true});
    this.imageEditorService.setSelectState('SELECT');
  }

  onNext = () => {
    const imageForegroundSelection = this.imageEditorService.getImageForegroundSelection();
    this.props.onNext(imageForegroundSelection);
  };


  render() {
    return (
      <div>
        <div className={styles.stepsControl}>
            <Button
              onClick={this.onNext}
              className={ styles.nextButton}>
              <Iconnext/>
            </Button>
        </div>

        <div className={styles.editorWindow}>

          <div className={styles.editorNav}>
              <div className={styles.editorNavLeft}>
                  <Button
                    onClick={this.props.onCancel}
                    className={ styles.cancelButton}>
                  <Iconcancel/>
                  </Button>
              </div>
              <h2 className={styles.floatingtitleA}>
              Select Figure
              </h2>
              <div className={styles.editorNavRight}>
              </div>
            {/* <Button
          onClick={this.onNext}
              className={ styles.navButton }
           >
              Next
           </Button> */}
          </div>
            <div className={styles.imageEditorZoomPanner}>
              <ZoomPanner onZoomSelect={this.onZoomSelect}/>
            </div>
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
            <div className={styles.editorControlbar}>
            <div className={`${styles.editorControlRow} ${styles.rowSpaceAround}`}>

              <div className={styles.editorControlLIcons}>
                  <Button className={styles.undoButton}
                    onClick={this.setDrawMode}
                  ><IconUndo/></Button>


                  <Button className={styles.redoButton}
                    onClick={this.setEraseMode}
                  ><IconRedo/></Button>

              </div>

                <div className={styles.editorControlthreshlod}>
                  <Slider
                    min={ 20 }
                    max={ 75 }
                    defaultValue={ this.state.threshold }
                    onChange={ this.updateThresholdUi }
                    onChangeEnd={ this.runSlic }
                  />
                  <div className={styles.editorControlthreshlodNumb}>
                    <span>{this.state.threshold}</span>
                  </div>
                </div>

                <div className={styles.editorControlRIcons}>
                    <Button className={this.state.eraseDraw ? styles.drawButtonSelected : styles.drawButton}
                      onClick={this.setDrawMode}
                    ><IconPen/></Button>


                    <Button className={this.state.eraseDraw ? styles.eraserButton : styles.eraserButtonSelected}
                      onClick={this.setEraseMode}
                    ><IconEraser/></Button>
                </div>

                <div className={styles.editorControlParam}>

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
