import React, { Component } from 'react';
import Button from 'components/primitives/button';
import Fab from 'components/primitives/fab';
import Loader from 'components/loader';
import GifPreview from 'components/GifPreview';
import TopBar from 'components/topbar';
import ParamControl from 'components/paramControl';
import Recorder from 'components/recorder';
import ZoomPanner from 'components/zoomPanner';
import PuppetEditor from 'components/puppetEditor';
import Profile from 'components/Profile';
import { loadDranimateFile } from 'services/util/file';
import puppetEditorStateService from 'services/imageToMesh/PuppetEditorStateService';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class Stage extends Component {

  constructor() {
    super();
    this.state = {
      editorIsOpen: false,
      profileIsOpen: false,
      controllerIsOpen: false,
      selectedPuppet: null,
      loaderIsVisible: false,
      gifPreviewBlob: null,
    };
  }

  componentDidMount = () => {
    // passive touch event listeners seem to be needed, which react does not support
    this.dranimateStageContainer.addEventListener(
      'touchmove',
      event => dranimate.onTouchMove(event),
      { passive: false }
    );

    dranimate.setup(this.dranimateStageContainer);
  };

  // componentDidUpdate = (prevProps, prevState) => {
  //   console.log('this.state', this.state);
  // }

  onMouseDown = event => {
    dranimate.onMouseDown(event);
    const selectedPuppet = dranimate.getSelectedPuppet();
    this.setState({ selectedPuppet });
  };

  closeEditor = () => this.setState({ editorIsOpen: false });

  closeProfile = () => this.setState({ profileIsOpen: false });

  openController = controllerIsOpen => this.setState({ controllerIsOpen });

  onFabClick = () => this.filePicker.click();

  onZoomSelect = isZoomIn => isZoomIn ? dranimate.zoomIn() : dranimate.zoomOut();

  onPanSelect = isPanSelected => dranimate.setPanEnabled(isPanSelected);

  onDeleteSelectedPuppet = () => dranimate.deleteSelectedPuppet();

  onEditSelectedPuppet = () => {
    console.log('setItem?', dranimate.getSelectedPuppet())
    puppetEditorStateService.setItem(dranimate.getSelectedPuppet());
    this.setState({ editorIsOpen: true });
  };

  openLoader = () => this.setState({ loaderIsVisible: true });

  closeLoader = () => this.setState({ loaderIsVisible: false });

  gifPreviewAvailable = gifPreviewBlob => this.setState({ gifPreviewBlob });

  closeGifPreview = () => this.setState({ gifPreviewBlob: null });

  onFileChange = event => {
    loadDranimateFile(this.filePicker)
      .then((result) => {
        const isPuppet = !!result.id;
        if (isPuppet) {
          dranimate.addPuppet(result);
        }
        else {
          puppetEditorStateService.setItem(result);
          this.setState({ editorIsOpen: true });
        }
      })
      .catch(error => console.log('error', error));
  }

  onProfileClick = () => this.setState({ profileIsOpen: true });

  render() {
    return (
      <div className={styles.stage}>
        <div
          className={styles.dranimateCanvas}
          onMouseDown={this.onMouseDown}
          onMouseMove={dranimate.onMouseMove}
          onMouseUp={dranimate.onMouseUp}
          onTouchStart={dranimate.onTouchStart}
          onTouchEnd={dranimate.onTouchEnd}
          ref={input => this.dranimateStageContainer = input}
        />
        <TopBar className={styles.topBar}/>
        <Button
          className={styles.profileButton}
          onClick={this.onProfileClick}
        >
          Profile
        </Button>
        {
          this.state.selectedPuppet ?
          <ParamControl
            className={styles.paramControl}
            selectedPuppet={this.state.selectedPuppet}
            onEditSelectedPuppet={this.onEditSelectedPuppet}
            onDeleteSelectedPuppet={this.onDeleteSelectedPuppet}
            openLoader={this.openLoader}
            closeLoader={this.closeLoader}
          /> : null
        }
        <div className={styles.lowerLeft}>
          <ZoomPanner
            onPanSelect={this.onPanSelect}
            onZoomSelect={this.onZoomSelect}
          />
          <Recorder
            openLoader={this.openLoader}
            closeLoader={this.closeLoader}
            gifPreviewAvailable={this.gifPreviewAvailable}
          />
          {
            /* <Button onClick={dranimate.onRenderToggle}>
              Render toggle
            </Button> */
           }
        </div>
        <Fab
          className={styles.fab}
          onClick={this.onFabClick}
        />
        <input
          type='file'
          ref={input => this.filePicker = input}
          value=''
          onChange={this.onFileChange}
          className={styles.hiddenFilePicker}
        />
        {
          this.state.editorIsOpen ?
            <PuppetEditor
              onClose={this.closeEditor}
            /> :
            null
        }
        { this.state.profileIsOpen ? <Profile onClose={this.closeProfile}/> : null }
        { this.state.gifPreviewBlob ?
          <GifPreview
            gifBlob={this.state.gifPreviewBlob}
            closeGifPreview={this.closeGifPreview}
            openLoader={this.openLoader}
            closeLoader={this.closeLoader}
          /> : null
        }
        <Loader isVisible={this.state.loaderIsVisible} />
      </div>
    );
  }
}

export default Stage;
