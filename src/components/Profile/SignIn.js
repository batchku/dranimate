import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import MaterialInput from 'components/primitives/materialInput';
import userService from 'services/api/userService';
import './styles.scss';

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
    this.props.openLoader('Signing In');
    userService.signIn(this.state.email, this.state.password)
      .then(() => this.props.closeLoader())
      .catch((error) => this.setErrorMessage(error.message));
  };

  onCreateAccount = () => {
    this.props.openLoader('Creating Account');
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
        className='profileContents'
        onKeyPress={ this.onKeyPress }>
        <div className='row headerRow'>
          <h3 className='headerLabel'>Sign In</h3>
        </div>
        <MaterialInput
          type='text'
          label='Email'
          onChange={ this.onEmailChange }
          className='inputField'
        />
        <MaterialInput
          type='password'
          label='Password'
          onChange={ this.onPasswordChange }
          className='inputField'
        />
        <Button
          className='profileButton'
          onClick={ this.onSignIn }
          className='formButton'
        >
          Sign In With Email
        </Button>
        <Button
          className='profileButton'
          onClick={ this.onCreateAccount }
          className='formButton'
        >
          Create Account
        </Button>
        <Button
          className='profileButton'
          onClick={ this.setSignInWithEmail.bind(this, false) }
          className='formButton'
        >
          Cancel
        </Button>
      </div>
    );
  };

  renderSignIn() {
    return(
      <div
        className='profileContents'
        onKeyPress={ this.onKeyPress }>
        <Button
          onClick={ this.setSignInWithEmail.bind(this, true) }
          className='formButton'
        >
          Sign In With Email
        </Button>
        <Button
          onClick={ this.onGoogleSignIn }
          className='formButton'
        >
          Sign In With Google
        </Button>
        <Button
          onClick={ this.props.onClose }
          className='formButton'
        >
          Close
        </Button>
      </div>
    );
  }

  renderErrorState() {
    return (
      <div className='profileContents'>
        <p>{ this.state.errorMessage }</p>
        <Button
          onClick={ this.resetState }
          className='formButton'
        >
          Close
        </Button>
      </div>
    );
  }


  renderAuthForms() {
    return(
      <div className='blankContainer'>
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
      <div className='blankContainer'>
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
