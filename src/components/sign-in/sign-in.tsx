import React from 'react';

import Button from 'components/primitives/button-v2/button';

import openSignInDialogEvent from './../../services/eventManager/open-sign-in-dialog-event';

import './sign-in.scss';

class SignIn extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='sign-in-container' onClick={this.onSignIn}>
				<Button label='Sign in'/>
			</div>
		);
	}

	private onSignIn = (): void => {
		openSignInDialogEvent.emit();
	}
}
export default SignIn;
