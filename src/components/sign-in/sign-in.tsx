import React from 'react';

import Button from 'components/primitives/button-v2/button';

import './sign-in.scss';

class SignIn extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='sign-in-container'>
				<Button label='Sign in'/>
			</div>
		);
	}
}
export default SignIn;