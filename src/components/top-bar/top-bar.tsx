import React from 'react';
import { v1 as uuid } from 'uuid';

import Logo from 'components/logo/logo';
import PuppetToolbar from 'components/puppet-toolbar/puppet-toolbar';
import SignIn from 'components/sign-in/sign-in';
import ProfileImage from 'components/profile-image/profile-image';

import userSignedInEvent, { UserSignedInEventData } from './../../services/eventManager/user-signed-in-event';

import './top-bar.scss';

interface TopBarState {
	userSignedIn: boolean;
	user: firebase.User;
}

class TopBar extends React.Component<{}, TopBarState> {
	private _onUserSignedInEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			userSignedIn: false,
			user: null,
		};
	}

	public componentDidMount = (): void => {
		userSignedInEvent.subscribe({
			callback: this.onUserSignedIn,
			id: this._onUserSignedInEventId,
		});
	}

	public componentWillUnmount = (): void => {
		userSignedInEvent.unsubscribe(this._onUserSignedInEventId);
	}

	public render(): JSX.Element {
		return (
			<div className='top-bar-container'>
				<Logo />
				<PuppetToolbar />
				{this.state.userSignedIn ? <ProfileImage user={this.state.user} /> : <SignIn />}
			</div>
		);
	}

	private onUserSignedIn = (data: UserSignedInEventData): void => {
		this.setState({
			userSignedIn: Boolean(data.user),
			user: data.user,
		});
	}
}
export default TopBar;
