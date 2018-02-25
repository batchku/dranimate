import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loader from 'components/loader';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import SignIn from 'components/Profile/SignIn';
import User from 'components/Profile/User';
import userService from 'services/api/userService';
import styles from './styles.scss';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      loaderIsVisible: false,
    };
  }

  componentWillMount() {
    userService.registerAuthChangeCallback(this.onAuthStateChange);
    const isAuthenticated = userService.isAuthenticated();
    this.setState({ isAuthenticated });
  }

  componentWillUnmount() {
    userService.deregisterAuthChangeCallback(this.onAuthStateChange);
  }

  onAuthStateChange = user => {
    const isAuthenticated = userService.isAuthenticated();
    this.setState({ isAuthenticated });
  };

  // TODO: use global loader on stage
  openLoader = () => this.setState({ loaderIsVisible: true });

  closeLoader = () => this.setState({ loaderIsVisible: false });

  render() {
    return (
      <div
        className={ styles.profileScrim }
        onKeyPress={ this.onKeyPress }
        onClick={ this.onScrimClick }
        >
        {
          this.state.isAuthenticated ?
            <User
              onClose={ this.props.onClose }
              openLoader={ this.openLoader }
              closeLoader={ this.closeLoader }
              /> :
            <SignIn
              onClose={ this.props.onClose }
              openLoader={ this.openLoader }
              closeLoader={ this.closeLoader }
            />
        }
        <Loader isVisible={this.state.loaderIsVisible} />
      </div>
    );
  }
}

Profile.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default Profile;
