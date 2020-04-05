import React from 'react';

import Logo from 'components/logo/logo';
import PuppetToolbar from 'components/puppet-toolbar/puppet-toolbar';
import SignIn from 'components/sign-in/sign-in';

import './top-bar.scss';

class TopBar extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='top-bar-container'>
				<Logo />
				<PuppetToolbar />
				<SignIn />
			</div>
		);
	}
}

export default TopBar;
