import React from 'react';
import EmailValidator from 'email-validator';
import { v1 as uuid } from 'uuid';

import Typography, { TypographyVariant } from './../typography/typography';
import Spacer from 'components/primitives/spacer/spacer';
import Input from 'components/primitives/input/input';
import Button from 'components/primitives/button-v2/button';

import openSignInDialogEvent from 'services/eventManager/open-sign-in-dialog-event';
import openUserProfileEvent from 'services/eventManager/open-user-profile-event';

import userService from 'services/api/userService';

import './sign-in-dialog.scss';

interface SignInDialogState {
	open: boolean;
	signInWithEmailDialogActive: boolean;
	signUpWithEmailDialogActive: boolean;
	signInWithEmailEnabled: boolean;
	signUpWithEmailEnabled: boolean;
	repeatPasswordError: string;
	loggingIn: boolean;
	signingUp: boolean;
}

class SignInDialog extends React.Component<{}, SignInDialogState> {
	private _email = '';
	private _password = '';
	private _repeatPassword = '';

	private _openEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			open: false,
			signInWithEmailDialogActive: false,
			signUpWithEmailDialogActive: false,
			signInWithEmailEnabled: false,
			signUpWithEmailEnabled: false,
			repeatPasswordError: '',
			loggingIn: false,
			signingUp: false,
		};
	}

	public componentDidMount = (): void => {
		openSignInDialogEvent.subscribe({
			callback: this.onOpen,
			id: this._openEventId,
		});
	}

	public componentWillUnmount = (): void => {
		openSignInDialogEvent.unsubscribe(this._openEventId);
	}

	public render = (): JSX.Element => {
		const signInWithEmail = (
			<div className='sign-in-dialog'>
				<div className='sign-in-dialog-title'>
					<img className='sing-in-back-button' src='./assets/back.svg' onClick={this.onBack}/>
					<div className='sing-in-title-container'>
						<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
							Sign in with email
						</Typography>
					</div>
				</div>
				<div className='sign-in-dialog-body'>
					<Input onChange={this.onEmailChange} placeholder='Enter your email address' label='Email address' type='email' />
					<Spacer size={16} />
					<Input onChange={this.onPasswordChange} placeholder='Enter your password' label='Password' type='password' />
					<Spacer size={28} />
					<Button label={this.state.loggingIn ? 'Loading...' : 'Sign in'} fullWidth={true} disabled={!this.state.signInWithEmailEnabled} onClick={this.onSignInAsync} />
				</div>
			</div>
		);

		const signUpWithEmail = (
			<div className='sign-in-dialog'>
				<div className='sign-in-dialog-title'>
					<img className='sing-in-back-button' src='./assets/back.svg' onClick={this.onBack}/>
					<div className='sing-in-title-container'>
						<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
							Sign up with email
						</Typography>
					</div>
				</div>
				<div className='sign-in-dialog-body'>
					<Input onChange={this.onEmailChange} placeholder='Enter an email address' label='Email address' type='email' />
					<Spacer size={16} />
					<Input onChange={this.onPasswordChange} placeholder='Enter a password' label='Password' type='password' />
					<Spacer size={16} />
					<Input onChange={this.onRepeatPasswordChange} placeholder='Enter the password again' label='Password' type='password' error={this.state.repeatPasswordError} />
					<Spacer size={28} />
					<Button label={this.state.signingUp ? 'Loading...' : 'Sign up'} fullWidth={true} disabled={!this.state.signUpWithEmailEnabled} onClick={this.signUpAsync} />
				</div>
			</div>
		);

		return (
			this.state.open &&
			<div>
				<div className='sign-in-dialog-backdrop' onClick={this.onClose} />
				<div className='sign-in-dialog-container'>
					{this.state.signInWithEmailDialogActive && signInWithEmail}
					{this.state.signUpWithEmailDialogActive && signUpWithEmail}
					{!this.state.signInWithEmailDialogActive && !this.state.signUpWithEmailDialogActive &&
					<div className='sign-in-dialog'>
						<div className='sign-in-dialog-title'>
							<img className='sing-in-close-button' src='./assets/close.svg' onClick={this.onClose}/>
							<div className='sing-in-title-container'>
								<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
									Sign in
								</Typography>
							</div>
						</div>
						<div className='sign-in-dialog-body'>
							<div className='sign-in-google-button' onClick={this.onSignInWithGoogleAsync}>
								<img src='./assets/google-icon.svg' />
								<Spacer size={4} />
								<Typography color='rgba(0, 0, 0, 0.6)' variant={TypographyVariant.HEADING_MEDIUM}>
									{'Continue with Google'}
								</Typography>
							</div>
							<Spacer size={10}/>
							<div className='sign-in-email-button' onClick={this.openSignInWithEmail}>
								<Typography color='#4A73E2' variant={TypographyVariant.HEADING_MEDIUM}>
									{'Sign in with email'}
								</Typography>
							</div>
							<Spacer size={32}/>
							<Typography color='rgba(0, 0, 0, 0.6)' variant={TypographyVariant.TEXT_SMALL}>
								{'Don\'t have an account yet?'}
							</Typography>
							<Spacer size={22}/>
							<div className='sign-in-dialog-sign-up-container' onClick={this.openSignUpWithEmail}>
								<Typography color='#4A73E2' variant={TypographyVariant.HEADING_MEDIUM}>
									{'Sign up'}
								</Typography>
							</div>
						</div>
					</div>}
				</div>
			</div>
		);
	}

	private onSignInWithGoogleAsync = async(): Promise<void> => {
		await userService.signInWithGoogle();
		this.onClose();

		openUserProfileEvent.emit();
	}

	private onClose = (): void => {
		this.setState({
			open: false,
			signInWithEmailDialogActive: false,
			signUpWithEmailDialogActive: false,
			signInWithEmailEnabled: false,
			signUpWithEmailEnabled: false,
			loggingIn: false,
			signingUp: false,
			repeatPasswordError: '',
		});
	}

	private onOpen = (): void => {
		this.setState({
			open: true,
		});
	}

	private validateInputSignIn = (): void => {
		if (this._email && this._password && EmailValidator.validate(this._email)) {
			this.setState({
				signInWithEmailEnabled: true,
			});
		} else {
			this.setState({
				signInWithEmailEnabled: false,
			});
		}
	}

	private validateInputSignUp = (): void => {
		if (this._email && this._password && this._repeatPassword
			&& this._password === this._repeatPassword
			&& EmailValidator.validate(this._email)) {
				this.setState({
					signUpWithEmailEnabled: true,
					repeatPasswordError: '',
				});
		} else if (this._password !== this._repeatPassword) {
			this.setState({
				signUpWithEmailEnabled: false,
				repeatPasswordError: 'Passwords do not match'
			});
		} else {
			this.setState({
				repeatPasswordError: '',
				signUpWithEmailEnabled: false,
			})
		}
	}

	private onEmailChange = (value: string): void => {
		this._email = value;
		this.validateInputSignIn();
		this.validateInputSignUp();
	}

	private onPasswordChange = (value: string): void => {
		this._password = value;
		this.validateInputSignIn();
		this.validateInputSignUp();
	}

	private onRepeatPasswordChange = (value: string): void => {
		this._repeatPassword = value;
		this.validateInputSignUp();
	}

	private openSignInWithEmail = (): void => {
		this.setState({
			signInWithEmailDialogActive: true,
			signUpWithEmailDialogActive: false,
		});
	}

	private openSignUpWithEmail = (): void => {
		this.setState({
			signInWithEmailDialogActive: false,
			signUpWithEmailDialogActive: true,
		})
	}

	private onBack = (): void => {
		this.setState({
			signInWithEmailDialogActive: false,
			signUpWithEmailDialogActive: false,
		});
	}

	private signUpAsync = async(): Promise<void> => {
		this.setState({
			signingUp: true,
		});
		await userService.createAccount(this._email, this._password);
		this.setState({
			signingUp: false,
		}, () => {
			this.onClose();
			openUserProfileEvent.emit();
		});
	}

	private onSignInAsync = async(): Promise<void> => {
		this.setState({
			loggingIn: true,
		});
		await userService.signIn(this._email, this._password);
		this.setState({
			loggingIn: false,
		}, () => {
			this.onClose();
			openUserProfileEvent.emit();
		});
	}
}
export default SignInDialog;
