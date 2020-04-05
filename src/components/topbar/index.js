import React, { Component } from 'react';
import './styles.scss';

class TopBar extends Component {
  onInfoClick = () => console.log('onInfoClick');

  render() {
    return (
      <div className={this.props.className}>
        <div className='topbar'>
          <div className='topbarItem aboutContainer'>
            <p className='aboutLabel'>Dranimate</p>
            <p className='aboutInfo'>About</p>
          </div>
        </div>
      </div>  
    );
  }
}

export default TopBar;
