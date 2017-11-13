import React, { Component } from 'react';
import PuppetEditor from 'components/puppetEditor';
import Fab from 'components/fab';
import TopBar from 'components/topbar';
import ZoomPanner from 'components/zoomPanner';
import { loadFile } from 'services/util/file';
import editorHelper from 'services/imageToMesh/EditorHelper';
import dranimate from 'services/dranimate/dranimate';
import styles from './styles.scss';

class Stage extends Component {

  constructor() {
    super();
    this.state = {
      editorIsOpen: false,
      controllerIsOpen: false
    };
  }

  componentDidMount = () => {
    dranimate.setup(this.dranimateStageContainer);
  };

  openEditor = () => this.setState({ editorIsOpen: true });

  closeEditor = () => this.setState({ editorIsOpen: false });

  openController = controllerIsOpen => this.setState({ controllerIsOpen });

  onFabClick = () => this.filePicker.click();

  onZoomSelect = isZoomIn => isZoomIn ? dranimate.zoomIn() : dranimate.zoomOut();

  onPanSelect = isPanSelected => dranimate.setPanEnabled(isPanSelected);

  onFileChange = event => {
    loadFile(this.filePicker)
      .then((result) => {
        editorHelper.setItem(result);
        this.openEditor(true);
      })
      .catch(error => console.log('error', error));
  }

  render() {
    return (
      <div>
        <TopBar />
        <div
          onMouseDown={dranimate.onMouseDown}
          onMouseMove={dranimate.onMouseMove}
          onMouseUp={dranimate.onMouseUp}
          ref={input => this.dranimateStageContainer = input}
        />
        <ZoomPanner
          className={styles.zoomPanner}
          onPanSelect={this.onPanSelect}
          onZoomSelect={this.onZoomSelect}
        />
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
      </div>
    );
  }
}

export default Stage;
