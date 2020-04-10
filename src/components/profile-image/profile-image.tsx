import React from 'react';
import { v1 as uuid } from 'uuid';

import UserProfile from 'components/user-profile/user-profile';

import openUserProfileEvent from 'services/eventManager/open-user-profile-event';

import './profile-image.scss';

interface ProfileImageProps {
	user: firebase.User;
}

interface ProfileImageState {
	profileOpen: boolean;
}

class ProfileImage extends React.Component<ProfileImageProps, ProfileImageState> {
	private readonly DEFAULT_IMAGE_URL = './assets/profile-image-placeholder.svg';

	private _openUserProfileEventId = uuid();

	constructor(props: ProfileImageProps) {
		super(props);

		this.state = {
			profileOpen: false,
		};
	}

	public componentDidMount = (): void => {
		openUserProfileEvent.subscribe({
			callback: this.onOpenProfile,
			id: this._openUserProfileEventId
		});
	}

	public componentWillUnmount = (): void => {
		openUserProfileEvent.unsubscribe(this._openUserProfileEventId);
	}

	public render = (): JSX.Element[] => {
		return ([
			<img
				key='profile-image'
				className='profile-image'
				src={this.props.user.photoURL || this.DEFAULT_IMAGE_URL}
				onClick={this.onOpenProfile}
			/>,
			this.state.profileOpen &&
			<UserProfile key='user-profile' onClose={this.onCloseProfile} user={this.props.user} />
		]);
	}

	private onCloseProfile = (): void => {
		this.setState({
			profileOpen: false,
		});
	}

	private onOpenProfile = (): void => {
		this.setState({
			profileOpen: true,
		});
	}
}
export default ProfileImage;
