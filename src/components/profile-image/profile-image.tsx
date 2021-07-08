import React from 'react';
import { v1 as uuid } from 'uuid';

import { Popper, Paper, Typography, Box } from '@material-ui/core';

import './profile-image.scss';
import { LabelButton } from 'components/primitives/button-mui/button';
import userService from 'services/api/userService';

interface ProfileImageProps {
	user: firebase.User;
}

interface ProfileImageState {
	profileOpen: boolean;
	userInfoOpen: boolean;
}

class ProfileImage extends React.Component<ProfileImageProps, ProfileImageState> {
	private readonly DEFAULT_IMAGE_URL = './assets/profile-image-placeholder.svg';

	private userImageRef = React.createRef<HTMLImageElement>();

	private _openUserProfileEventId = uuid();

	constructor(props: ProfileImageProps) {
		super(props);

		this.state = {
			profileOpen: false,
			userInfoOpen: false,
		};
	}

	private onSignOut = (): void => {
		userService.signOut();
	}

	public render = (): JSX.Element => {
		const userData = userService.getUser();

		return (
			<>
				<img
					key='profile-image'
					className='profile-image'
					ref={this.userImageRef}
					src={this.props.user.photoURL || this.DEFAULT_IMAGE_URL}
					onClick={this.onToggleProfileInfo}
				/>
				<Popper open={this.state.userInfoOpen} anchorEl={this.userImageRef.current} placement='bottom-start'>
					<Paper className='user-info-popper'>
						<div className='user-info-container'>
							<Typography variant='body1'>
								{userData.displayName}
							</Typography>
							<Typography variant='body2'>
								{userData.email}
							</Typography>
						</div>
						<Box m={1} />
						<div className='inspect-row'>
							<LabelButton onClick={this.onSignOut} fullWidth>
								Sign out
							</LabelButton>
						</div>
						<Box m={1} />
					</Paper>
				</Popper>
			</>
		);
	}

	private onToggleProfileInfo = (): void => {
		this.setState({
			userInfoOpen: !this.state.userInfoOpen,
		});
	}
}
export default ProfileImage;
