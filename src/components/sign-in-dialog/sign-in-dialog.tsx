import React from 'react';
import { v1 as uuid } from 'uuid';

import Typography, { TypographyVariant } from './../typography/typography';
import Spacer from 'components/primitives/spacer/spacer';

import openSignInDialogEvent from './../../services/eventManager/open-sign-in-dialog-event';

import userService from './../../services/api/userService';

import './sign-in-dialog.scss';

interface SignInDialogState {
	open: boolean;
}

class SignInDialog extends React.Component<{}, SignInDialogState> {
	private _openEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			open: false,
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
		return (
			this.state.open &&
			<div className='sign-in-dialog-backdrop'>
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
							<Typography color='rgba(0, 0, 0, 0.6)' variant={TypographyVariant.HEADING_MEDIUM}>
								{'Continue with Google'}
							</Typography>
						</div>
						<Spacer size={10}/>
						<div className='sign-in-email-button'>
							<Typography color='#4A73E2' variant={TypographyVariant.HEADING_MEDIUM}>
								{'Sign in with email'}
							</Typography>
						</div>
						<Spacer size={32}/>
						<Typography color='rgba(0, 0, 0, 0.6)' variant={TypographyVariant.TEXT_SMALL}>
							{'Don\'t have an account yet?'}
						</Typography>
						<Spacer size={22}/>
						<div className='sign-in-dialog-sign-up-container'>
							<Typography color='#4A73E2' variant={TypographyVariant.HEADING_MEDIUM}>
								{'Sign up'}
							</Typography>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private onSignInWithGoogleAsync = async(): Promise<void> => {
		await userService.signInWithGoogle();
		this.onClose();
	}

	private onClose = (): void => {
		this.setState({
			open: false,
		});
	}

	private onOpen = (): void => {
		this.setState({
			open: true,
		});
	}
}
export default SignInDialog;
