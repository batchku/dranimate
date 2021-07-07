import React from 'react';

import { ColorButton } from 'components/primitives/button-mui/button';

import openSignInDialogEvent from './../../services/eventManager/open-sign-in-dialog-event';

import './sign-in.scss';

class SignIn extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='sign-in-container'>
				<ColorButton onClick={this.onSignIn}>
					Sign In
				</ColorButton>
			</div>
		);
	}

	private onSignIn = (): void => {
		openSignInDialogEvent.emit();
	}
}
export default SignIn;
