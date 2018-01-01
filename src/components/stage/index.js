import React, { Component } from 'react';
import Button from 'components/primitives/button';
import Fab from 'components/primitives/fab';
import TopBar from 'components/topbar';
import ParamControl from 'components/paramControl';
import Recorder from 'components/recorder';
import ZoomPanner from 'components/zoomPanner';
import PuppetEditor from 'components/puppetEditor';
import Profile from 'components/profile';
import { loadDranimateFile } from 'services/util/file';
import editorHelper from 'services/imageToMesh/EditorHelper';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class Stage extends Component {

  constructor() {
    super();
    this.state = {
      editorIsOpen: false,
      profileIsOpen: false,
      controllerIsOpen: false,
      selectedPuppet: null
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

  onMouseDown = event => {
    dranimate.onMouseDown(event);
    const selectedPuppet = dranimate.getSelectedPuppet();
    this.setState({ selectedPuppet });
  };

  // openEditor = () => this.setState({ editorIsOpen: true });

  closeEditor = () => this.setState({ editorIsOpen: false });

  closeProfile = () => this.setState({ profileIsOpen: false });

  openController = controllerIsOpen => this.setState({ controllerIsOpen });

  onFabClick = () => this.filePicker.click();

  onZoomSelect = isZoomIn => isZoomIn ? dranimate.zoomIn() : dranimate.zoomOut();

  onPanSelect = isPanSelected => dranimate.setPanEnabled(isPanSelected);

  onDeleteSelectedPuppet = () => dranimate.deleteSelectedPuppet();

  onEditSelectedPuppet = () => {
    editorHelper.setItem(dranimate.getSelectedPuppet());
    this.setState({ editorIsOpen: true });
  };

  onFileChange = event => {
    loadDranimateFile(this.filePicker)
      .then((result) => {
        const isPuppet = !!result.id;
        if (isPuppet) {
          dranimate.addPuppet(result);
        }
        else {
          editorHelper.setItem(result);
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
        <ParamControl
          className={styles.paramControl}
          selectedPuppet={this.state.selectedPuppet}
          onEditSelectedPuppet={this.onEditSelectedPuppet}
          onDeleteSelectedPuppet={this.onDeleteSelectedPuppet}
        />
        <div className={styles.lowerLeft}>
          <ZoomPanner
            onPanSelect={this.onPanSelect}
            onZoomSelect={this.onZoomSelect}
          />
          <Recorder />
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
          onChange={this.onFileChange}
          className={styles.hiddenFilePicker}
        />
        { this.state.editorIsOpen ? <PuppetEditor onClose={this.closeEditor}/> : null }
        { this.state.profileIsOpen ? <Profile onClose={this.closeProfile}/> : null }
      </div>
    );
  }
}

export default Stage;
