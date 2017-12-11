import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import styles from './styles.scss';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  onSignIn = () => {
    console.log(`TODO: sign in with ${this.state.username} / ${this.state.password}`);
  };

  onUsernameChange = username => this.setState({ username });

  onPasswordChange = password => this.setState({ password });

  render() {
    return (
      <div className={styles.profileScrim}>
        <div className={styles.profileContents}>
          <MaterialInput
            type='text'
            label='Username'
            onChange={this.onUsernameChange}
            className={ styles.inputField }
          />
          <MaterialInput
            type='password'
            label='Password'
            onChange={this.onPasswordChange}
            className={ styles.inputField }
          />
          <Button
            onClick={ this.onSignIn }
            className={ styles.formButton }
          >
            Sign In
          </Button>
          <Button
            onClick={ this.props.onClose }
            className={ styles.formButton }
          >
            Close
          </Button>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default Profile;
