import React from 'react';

import UserProfile from 'components/user-profile/user-profile';

import './profile-image.scss';

interface ProfileImageProps {
	user: firebase.User;
}

interface ProfileImageState {
	profileOpen: boolean;
}

class ProfileImage extends React.Component<ProfileImageProps, ProfileImageState> {
	private readonly DEFAULT_IMAGE_URL = './assets/profile-image-placeholder.svg';

	constructor(props: ProfileImageProps) {
		super(props);

		this.state = {
			profileOpen: false,
		};
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
