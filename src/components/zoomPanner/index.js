import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import styles from './styles.scss';
import Icon from 'components/Icon/Icon.jsx';
import {
  ICONS
} from '../../../constants.js';

class ZoomPanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panIsSelected: false,
    };
  }

  onPanClick = () => {
    const panIsSelected = !this.state.panIsSelected;
    this.props.onPanSelect(panIsSelected);
    this.setState({ panIsSelected });
  }

  renderPanButton() {
    return (
<div className={styles.iconRightBar}>
      <span className={this.state.panIsSelected ? styles.logoFacebookSelected : styles.logoFacebook}
      onClick={this.onPanClick}>
      	  <a ></a>
      </span>
</div>
    );
  }



  render() {
    return (
      <div className={styles.zoomPanner}>
        { this.props.onPanSelect ? this.renderPanButton() : null }
        <Button
          className={ styles.zoomButton }
          onClick={() => this.props.onZoomSelect(true)}
        >
          Zoom In
        </Button>
        <Button
          className={ styles.zoomButton }
          onClick={() => this.props.onZoomSelect(false)}
        >
          Zoom Out
        </Button>
        <Icon icon="icon_pan" />
      </div>
    );
  }
}

ZoomPanner.propTypes = {
  onPanSelect: PropTypes.func,
  onZoomSelect: PropTypes.func.isRequired,
};

export default ZoomPanner;
