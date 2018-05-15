import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import styles from './styles.scss';
import IconPan from '../../../resources/static/imgs/icon_pan.svg'
import IconZoomIn from '../../../resources/static/imgs/icon_zoomin.svg'
import IconZoomOut from '../../../resources/static/imgs/icon_zoomout.svg'

// import Icon from 'components/Icon/Icon.jsx';
// import {
  // ICONS
// } from '../../../constants.js';

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

  onIconClick = () => {
    const IconIsSelected = !this.state.IconIsSelected;
    this.props.onIconSelect(IconIsSelected);
    this.setState({ IconIsSelected });
  }



  renderPanButton() {
    return (
<div className={styles.iconRightBar}>
      <IconPan className={this.state.panIsSelected ? styles.iconSelected : styles.icon}
      onClick={this.onPanClick}/>
      <p>Pan</p>
</div>
    );
  }



  render() {
    return (
      <div className={styles.zoomPanner}>
        { this.props.onPanSelect ? this.renderPanButton() : null }
<div className={styles.iconRightBar}>
        <IconZoomIn
        className={ styles.icon }
        onClick={() => this.props.onZoomSelect(true)}
        />
          <p>Zoom In</p>
</div>
        <div className={styles.iconRightBar}>
        <IconZoomOut
          className={ styles.icon }
          onClick={() => this.props.onZoomSelect(false)}
        />
          <p>Zoom Out</p>
</div>
      </div>
    );
  }
}

ZoomPanner.propTypes = {
  onPanSelect: PropTypes.func,
  onZoomSelect: PropTypes.func.isRequired,
};

export default ZoomPanner;
