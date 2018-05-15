import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import ControlPointService from 'services/imageToMesh/ControlPointService';
import styles from './styles.scss';
import Iconback from '../../../resources/static/imgs/icon_back.svg';
import Iconcancel from '../../../resources/static/imgs/icon_cancel.svg';
import Imglefthand from '../../../resources/static/imgs/img_lefthand.svg';
import Imgrighthand from '../../../resources/static/imgs/img_righthand.svg';
import Icontutorialclose from '../../../resources/static/imgs/icon_tutorialclose.svg';

class ControlPointEditor extends Component {
  componentWillMount() {
    this.controlPointService = new ControlPointService();
  }

    constructor(props) {
      super(props);
      this.state = {
        lefthandIsSelected: false,
        righthandIsSelected: false,
        LTdotIsSelected: false,
        LIdotIsSelected: false,
        LMdotIsSelected: false,
        LRdotIsSelected: false,
        LPdotIsSelected: false,
        RTdotIsSelected: false,
        RIdotIsSelected: false,
        RMdotIsSelected: false,
        RRdotIsSelected: false,
        RPdotIsSelected: false,
        tutorialIsOpen: false
      };
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

  onleftHandClick = () => {
    const lefthandIsSelected = !this.state.lefthandIsSelected;
    this.setState({ lefthandIsSelected });
  }

  onrightHandClick = () => {
    const righthandIsSelected = !this.state.righthandIsSelected;
    this.setState({ righthandIsSelected });
  }

  onLTdotClick = (e) => {
    const LTdotIsSelected = !this.state.LTdotIsSelected;
    this.setState({ LTdotIsSelected });
    this.setState ({ lefthandIsSelected: true });
e.stopPropagation();
  }

  onLIdotClick = (e) => {
    const LIdotIsSelected = !this.state.LIdotIsSelected;
    this.setState({ LIdotIsSelected });
    this.setState ({ lefthandIsSelected: true });
e.stopPropagation();
  }

  onLMdotClick = (e) => {
    const LMdotIsSelected = !this.state.LMdotIsSelected;
    this.setState({ LMdotIsSelected });
    this.setState ({ lefthandIsSelected: true });
e.stopPropagation();
  }

  onLRdotClick = (e) => {
    const LRdotIsSelected = !this.state.LRdotIsSelected;
    this.setState({ LRdotIsSelected });
    this.setState ({ lefthandIsSelected: true });
e.stopPropagation();
  }

  onLPdotClick = (e) => {
    const LPdotIsSelected = !this.state.LPdotIsSelected;
    this.setState({ LPdotIsSelected });
    this.setState ({ lefthandIsSelected: true });
e.stopPropagation();
  }

  onRTdotClick = (e) => {
    const RTdotIsSelected = !this.state.RTdotIsSelected;
    this.setState({ RTdotIsSelected });
    this.setState ({ righthandIsSelected: true });
e.stopPropagation();
  }

  onRIdotClick = (e) => {
    const RIdotIsSelected = !this.state.RIdotIsSelected;
    this.setState({ RIdotIsSelected });
    this.setState ({ righthandIsSelected: true });
e.stopPropagation();
  }

  onRMdotClick = (e) => {
    const RMdotIsSelected = !this.state.RMdotIsSelected;
    this.setState({ RMdotIsSelected });
    this.setState ({ righthandIsSelected: true });
e.stopPropagation();
  }

  onRRdotClick = (e) => {
    const RRdotIsSelected = !this.state.RRdotIsSelected;
    this.setState({ RRdotIsSelected });
    this.setState ({ righthandIsSelected: true });
e.stopPropagation();
  }

  onRPdotClick = (e) => {
    const RPdotIsSelected = !this.state.RPdotIsSelected;
    this.setState({ RPdotIsSelected });
    this.setState ({ righthandIsSelected: true });
e.stopPropagation();
  }

  onCloseTutorial = () => {
    this.setState({ tutorialIsOpen: true });
  }



  render() {
    return (
    <div>
      <div>
      <div className={styles.stepsControl}>
          <Button
            onClick={this.props.onClose}
            className={styles.backButton}
          >
          <Iconback/>
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
            <h2 className={styles.floatingtitleB}>
            Control Points
            </h2>
            <div className={styles.editorNavRight}>
                <Button
                  onClick={this.onSave}
                  className={styles.navButton}
                >
                  Done
                </Button>
            </div>
        </div>

        <div>
          <div className={styles.tutorialbg}>
              <div className={this.state.tutorialIsOpen ? styles.tutorialchoosehandClosed : styles.tutorialchoosehand}>
                  <div className={styles.tutorialchoosehandcontent}>
                      <p>Choose a hand you want to control the puppet with.</p>
                  </div>
                  <Button
                  onClick={this.onCloseTutorial}
                  className={styles.tcloseButton}
                >
                <Icontutorialclose/>
               </Button>
              </div>
           </div>
          <canvas
            className={styles.editorCanvas}
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
          <div className={styles.editorControlRowHands}>

              <div className={this.state.lefthandIsSelected ? styles.ECLeftHandActive : styles.ECLeftHand}
              onClick={this.onleftHandClick} >
                  <div className={styles.dots}>
                      <img className={ `${styles.dotLeftThumb} ${this.state.LTdotIsSelected? styles.LTdotActive : styles.LTdotDefault}`}
                      onClick={this.onLTdotClick} onMouseDown={e => e.stopPropagation()} />

                      <img className={ `${styles.dotLeftIndexfinger} ${this.state.LIdotIsSelected? styles.LIdotActive : styles.LIdotDefault}`}
                      onClick={this.onLIdotClick} onMouseDown={e => e.stopPropagation()} />


                      <img className={ `${styles.dotLeftMiddlefinger} ${this.state.LMdotIsSelected? styles.LMdotActive : styles.LMdotDefault}`}
                      onClick={this.onLMdotClick} onMouseDown={e => e.stopPropagation()}  />

                      <img className={ `${styles.dotLeftRingfinger} ${this.state.LRdotIsSelected? styles.LRdotActive : styles.LRdotDefault}`}
                      onClick={this.onLRdotClick} onMouseDown={e => e.stopPropagation()}  />

                      <img className={ `${styles.dotLeftPinky} ${this.state.LPdotIsSelected? styles.LPdotActive : styles.LPdotDefault}`}
                      onClick={this.onLPdotClick} onMouseDown={e => e.stopPropagation()}  />

                  </div>
                  <Imglefthand/>
              </div>


              <div className={this.state.righthandIsSelected ? styles.ECRightHandActive : styles.ECRightHand}
              onClick={this.onrightHandClick} >
                  <div className={styles.dots}>
                      <img className={ `${styles.dotRightThumb} ${this.state.RTdotIsSelected? styles.RTdotActive : styles.RTdotDefault}`}
                      onClick={this.onRTdotClick} onMouseDown={e => e.stopPropagation()} />

                      <img className={ `${styles.dotRightIndexfinger} ${this.state.RIdotIsSelected? styles.RIdotActive : styles.RIdotDefault}`}
                      onClick={this.onRIdotClick} onMouseDown={e => e.stopPropagation()} />


                      <img className={ `${styles.dotRightMiddlefinger} ${this.state.RMdotIsSelected? styles.RMdotActive : styles.RMdotDefault}`}
                      onClick={this.onRMdotClick} onMouseDown={e => e.stopPropagation()}  />

                      <img className={ `${styles.dotRightRingfinger} ${this.state.RRdotIsSelected? styles.RRdotActive : styles.RRdotDefault}`}
                      onClick={this.onRRdotClick} onMouseDown={e => e.stopPropagation()}  />

                      <img className={ `${styles.dotRightPinky} ${this.state.RPdotIsSelected? styles.RPdotActive : styles.RPdotDefault}`}
                      onClick={this.onRPdotClick} onMouseDown={e => e.stopPropagation()}  />

                  </div>
                  <Imgrighthand/>
              </div>

          </div>
        </div>

      </div>
      </div>
    </div>
    );
  }
}

ControlPointEditor.propTypes = {
  onHandSelect: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  imageSrc: PropTypes.string.isRequired,
  backgroundRemovalData: PropTypes.object.isRequired,
  controlPointPositions: PropTypes.array
};

export default ControlPointEditor;
