import React from 'react';

import Typography, { TypographyVariant } from 'components/typography/typography';
import BorderButton from 'components/primitives/border-button/border-button';
import BorderlessButton from 'components/primitives/borderless-button/borderless-button';
import Spacer from 'components/primitives/spacer/spacer';

import apiService from 'services/api/apiService';
import dranimate from 'services/dranimate/dranimate';

import './puppet-card.scss';

interface PuppetCardProps {
	puppet: any;
	onDelete: () => void;
	onAddToScene: () => void;
}

interface PuppetCardState {
	actionsVisible: boolean;
}

class PuppetCard extends React.Component<PuppetCardProps, PuppetCardState> {
	constructor(props: PuppetCardProps) {
		super(props);

		this.state = {
			actionsVisible: false,
		};
	}

	public render = (): JSX.Element => {
		return (
			<div className='puppet-card-container'>
				<div className='puppet-card-title'>
					<Typography variant={TypographyVariant.TEXT_SMALL} color='rgba(0, 0, 0, 0.6)'>
						{this.props.puppet.name || 'My puppet'}
					</Typography>
				</div>
				<div className='puppet-image-container' onMouseOver={this.openActions}>
					<div style={{
						background: `url(${this.props.puppet.thumbnailUrl}) no-repeat center`,
						backgroundSize: 'contain',
						width: '100%'
					}}/>
					{this.state.actionsVisible &&
					<div className='puppet-actions-container' onMouseLeave={this.closeActions}>
						<BorderButton label='Add to scene' color='#4A73E2' fullWidth={true} onClick={this.onAddToSceneAsync} />
						<Spacer size={10} />
						<BorderlessButton label='Delete' color={{red: 182, green: 0, blue: 0}} onClick={this.onDeletePuppetAsync}/>
					</div>}
				</div>
			</div>
		);
	}

	private openActions = (): void => {
		this.setState({
			actionsVisible: true,
		});
	}

	private closeActions = (): void => {
		this.setState({
			actionsVisible: false,
		});
	}

	private onDeletePuppetAsync = async(): Promise<void> => {
		await apiService.deletePuppet(this.props.puppet);
		this.props.onDelete();
	}

	private onAddToSceneAsync = async(): Promise<void> => {
		const puppet = await apiService.openPuppet(this.props.puppet);
		dranimate.addPuppet(puppet);

		this.props.onAddToScene();
	}
}
export default PuppetCard;
