import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router'
import Fab from 'components/fab';
import TopBar from 'components/topbar';
import { loadFile } from 'services/util/file';
import editorHelper from 'services/imageToMesh/EditorHelper';
import styles from './styles.scss';

class Stage extends Component {

  constructor() {
    super();
    this.state = {
      puppets: []
    };
  }

  onFabClick = () => {
    this.filePicker.click();
    // this.setState({
    //   puppets: this.state.puppets.concat(Math.random())
    // });

  }

  onFileChange = event => {
    loadFile(this.filePicker)
      .then((result) => {
        editorHelper.setItem(result);
        this.props.history.push('/editor');
      })
      .catch(error => console.log('error', error));
  }

  renderPuppet(puppet) {
    return (
      <div key={puppet}>
        <Link to="/editor">Puppet {puppet}</Link>
      </div>
    );
  }

  renderPuppets() {
    return (
      <div className={styles.puppetContainer}>
        { this.state.puppets.map(this.renderPuppet) }
      </div>
    );
  }

  render() {
    return (
      <div>
        <TopBar />
        {this.renderPuppets()}
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
      </div>
    );
  }
}

export default withRouter(Stage);
