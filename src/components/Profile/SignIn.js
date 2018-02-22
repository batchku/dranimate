import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import userService from 'services/api/userService';
import styles from './styles.scss';

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignInWithEmail: false,
      email: '',
      password: '',
      errorMessage: false
    };
  }

  setSignInWithEmail(isSignInWithEmail) {
    this.setState({ isSignInWithEmail });
  }

  setErrorMessage(errorMessage) {
    this.props.closeLoader();
    this.setState({ errorMessage });
  }

  resetState = () => this.setState({
    isSignInWithEmail: false,
    email: '',
    password: '',
    errorMessage: false
  });

  onSignIn = () => {
    this.props.openLoader();
    userService.signIn(this.state.email, this.state.password)
      .then(() => this.props.closeLoader())
      .catch((error) => this.setErrorMessage(error.message));
  };

  onCreateAccount = () => {
    this.props.openLoader();
    userService.createAccount(this.state.email, this.state.password)
      .then(() => this.props.closeLoader())
      .catch((error) => this.setErrorMessage(error.message));
  };

  onGoogleSignIn = () => userService.signInWithGoogle();

  onEmailChange = email => this.setState({ email });

  onPasswordChange = password => this.setState({ password });

  onKeyPress = event => {
    if (event.key !== 'Enter') { return; }
    this.onSignIn();
  };

  renderSignInWithEmail() {
    return (
      <div
        className={ styles.profileContents }
        onKeyPress={ this.onKeyPress }>
        <div className={`${styles.row} ${styles.headerRow}`}>
          <h3 className={ styles.headerLabel }>Sign In</h3>
        </div>
        <MaterialInput
          type='text'
          label='Email'
          onChange={ this.onEmailChange }
          className={ styles.inputField }
        />
        <MaterialInput
          type='password'
          label='Password'
          onChange={ this.onPasswordChange }
          className={ styles.inputField }
        />
        <Button
          className={ styles.profileButton }
          onClick={ this.onSignIn }
          className={ styles.formButton }
        >
          Sign In With Email
        </Button>
        <Button
          className={ styles.profileButton }
          onClick={ this.onCreateAccount }
          className={ styles.formButton }
        >
          Create Account
        </Button>
        <Button
          className={ styles.profileButton }
          onClick={ this.setSignInWithEmail.bind(this, false) }
          className={ styles.formButton }
        >
          Cancel
        </Button>
      </div>
    );
  };

  renderSignIn() {
    return(
      <div
        className={ styles.profileContents }
        onKeyPress={ this.onKeyPress }>
        <Button
          onClick={ this.setSignInWithEmail.bind(this, true) }
          className={ styles.formButton }
        >
          Sign In With Email
        </Button>
        <Button
          onClick={ this.onGoogleSignIn }
          className={ styles.formButton }
        >
          Sign In With Google
        </Button>
        <Button
          onClick={ this.props.onClose }
          className={ styles.formButton }
        >
          Cancel
        </Button>
      </div>
    );
  }

  renderErrorState() {
    return (
      <div className={ styles.profileContents }>
        <p>{ this.state.errorMessage }</p>
        <Button
          onClick={ this.resetState }
          className={ styles.formButton }
        >
          Close
        </Button>
      </div>
    );
  }


  renderAuthForms() {
    return(
      <div className={styles.blankContainer}>
        {
          this.state.isSignInWithEmail ?
            this.renderSignInWithEmail() :
            this.renderSignIn()
        }
      </div>
    );
  }

  render() {
    return (
      <div className={styles.blankContainer}>
        {
          this.state.errorMessage ?
            this.renderErrorState() :
            this.renderAuthForms()
        }
      </div>
    );
  }
}

SignIn.propTypes = {
  onClose: PropTypes.func.isRequired,
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default SignIn;
