import React from 'react';

import apiService from 'services/api/apiService';
import userService from 'services/api/userService';
import { savePuppetToFile } from 'services/storage/serializer';

import showToastEvent from 'services/eventManager/show-toast-event';
import editPuppetEvent from 'services/eventManager/edit-puppet-event';

import Typography, { TypographyVariant } from 'components/typography/typography';
import Spacer from 'components/primitives/spacer/spacer';
import BorderButton from 'components/primitives/border-button/border-button';
import PuppetCard from './puppet-card/puppet-card';
import CircularProgress from 'components/primitives/circular-progress/circular-progress';

import './user-profile.scss';

interface UserProfileProps {
	onClose: () => void;
	user: firebase.User;
}

interface UserProfileState {
	userPuppets: any[];
	showLoadingOverlay: boolean;
	loadingOverlayMessage: string;
}

class UserProfile extends React.Component<UserProfileProps, UserProfileState> {
	private readonly DEFAULT_IMAGE_URL = './assets/profile-image-placeholder.svg';

	constructor(props: UserProfileProps) {
		super(props);

		this.state = {
			userPuppets: [],
			showLoadingOverlay: false,
			loadingOverlayMessage: '',
		};
	}

	public componentDidMount = (): void => {
		this.fetchPuppetsForUserAsync();
	}

	public render = (): JSX.Element[] => {
		return ([
			<div key='backdrop' className='user-profile-backdrop' onClick={this.props.onClose}/>,
			<div key='profile-container' className='user-profile-container'>
				<div className='user-profile-dialog'>
					{this.state.showLoadingOverlay
					&& <div className='user-profile-loading-overlay'>
						<CircularProgress />
						<Spacer size={10} />
						<Typography variant={TypographyVariant.HEADING_SMALL} color='#4A73E2' >
							{this.state.loadingOverlayMessage}
						</Typography>
					</div>}
					<div className='user-profile-dialog-title'>
						<img className='user-profile-close-button' src='./assets/close.svg' onClick={this.props.onClose}/>
						<div className='user-profile-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Your Profile
							</Typography>
						</div>
					</div>
					<div className='user-profile-main-info'>
						<div className='user-profile-main-info-left-side'>
							<img src={this.props.user.photoURL || this.DEFAULT_IMAGE_URL} className='user-profile-image' />
							<div className='user-profile-info'>
								<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.6)'>
									{this.props.user.email}
								</Typography>
								<Spacer size={4} />
								<Typography variant={TypographyVariant.TEXT_SMALL} color='rgba(0, 0, 0, 0.6)'>
									Google account
								</Typography>
							</div>
						</div>
						<div className='user-profile-main-info-right-side'>
							<BorderButton label='Logout' onClick={this.onUserLogoutAsync} />
						</div>
					</div>
					<div className='user-profile-items'>
						<Typography color='rgba(0, 0, 0, 0.6)' variant={TypographyVariant.TEXT_LARGE}>
							Puppets ({this.state.userPuppets.length})
						</Typography>
						<Spacer size={12} />
						<div className='user-profile-projects-list-grid'>
							{this.state.userPuppets.map((puppet) => {
								return (
									<PuppetCard
										key={puppet.databaseId}
										puppet={puppet}
										onDelete={this.onPuppetDeleted}
										onAddToScene={this.onAddToScene}
										onStartAddingToScene={this.onStartAddingToScene}
										onDownloadPuppet={this.onDownloadPuppetAsync}
										onEdit={this.onEditAsync}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		]);
	}

	private onEditAsync = async (puppet: any): Promise<void> => {
		this.setState({
			showLoadingOverlay: true,
			loadingOverlayMessage: 'Preparing your puppet for edit. This may take a while...'
		});
		const puppetModel = await apiService.openPuppet(puppet);
		editPuppetEvent.emit({
			puppet: puppetModel
		});
		this.props.onClose();
	}

	private fetchPuppetsForUserAsync = async(): Promise<void> => {
		const puppets = await apiService.getAllPuppetsForUser();
		if (!puppets) {
			return;
		}

		this.setState({
			userPuppets: puppets
		});
	}

	private onDownloadPuppetAsync = async (puppet: any): Promise<void> => {
		this.setState({
			showLoadingOverlay: true,
			loadingOverlayMessage: 'Preparing your puppet for export. This may take a while...'
		});
		savePuppetToFile(await apiService.openPuppet(puppet));
		this.setState({
			showLoadingOverlay: false,
			loadingOverlayMessage: ''
		});
	}

	private onPuppetDeleted = (): void => {
		this.fetchPuppetsForUserAsync();
	}

	private onUserLogoutAsync = async(): Promise<void> => {
		await userService.signOut();
	}

	private onAddToScene = (): void => {
		this.props.onClose();

		showToastEvent.emit({
			duration: 4,
			text: 'Puppet successfully added to the scene.'
		});
	}

	private onStartAddingToScene = (): void => {
		this.setState({
			showLoadingOverlay: true,
			loadingOverlayMessage: 'Loading the puppet. This may take a while...'
		});
	}
}
export default UserProfile;