import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
              openLoader={ this.props.openLoader }
              closeLoader={ this.props.closeLoader }
              /> :
            <SignIn
              onClose={ this.props.onClose }
              openLoader={ this.props.openLoader }
              closeLoader={ this.props.closeLoader }
            />
        }
      </div>
    );
  }
}

Profile.propTypes = {
  onClose: PropTypes.func.isRequired,
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default Profile;
