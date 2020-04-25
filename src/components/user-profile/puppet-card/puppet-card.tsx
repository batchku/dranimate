import React from 'react';

import Spacer from 'components/primitives/spacer/spacer';
import Menu from 'components/primitives/menu/menu';
import {MenuItemData} from 'components/primitives/menu/menu-item';
import Typography, { TypographyVariant } from 'components/typography/typography';

import EditIcon from 'icons/edit-icon';
import AddIcon from 'icons/add-icon';
import MoreIcon from 'icons/more-icon';

import apiService from 'services/api/apiService';
import dranimate from 'services/dranimate/dranimate';
import { savePuppetToFile } from 'services/storage/serializer';

import './puppet-card.scss';

interface PuppetCardProps {
	puppet: any;
	onDelete: () => void;
	onAddToScene: () => void;
	onStartAddingToScene: () => void;
	onDownloadPuppet: (puppet: any) => void;
}

interface PuppetCardState {
	actionsVisible: boolean;
	addHighlighted: boolean;
	editHighlighted: boolean;
	moreHighlighted: boolean;
	moreMenuVisible: boolean;
}

class PuppetCard extends React.Component<PuppetCardProps, PuppetCardState> {
	private _cardContainer: HTMLDivElement;
	private _moreIconContainer: HTMLDivElement;

	private _cardContainerRect: DOMRect;
	private _moreIconRect: DOMRect;

	private _moreMenuItems: MenuItemData[] = [{
		label: 'Download puppet.zip',
		highlightColor: 'rgba(74, 115, 226, 0.1)',
		labelColor: '#4A73E2',
		onClick: this.onDownloadPuppetAsync.bind(this)
	}, {
		label: 'Delete puppet',
		highlightColor: 'rgba(182, 0, 0, 0.1)',
		labelColor: '#B60000',
		onClick: this.onDeletePuppetAsync.bind(this)
	}];

	constructor(props: PuppetCardProps) {
		super(props);

		this.state = {
			actionsVisible: false,
			addHighlighted: false,
			editHighlighted: false,
			moreHighlighted: false,
			moreMenuVisible: false,
		};
	}

	public componentDidMount = (): void => {
		this._cardContainerRect = this._cardContainer.getBoundingClientRect();
	}

	public render = (): JSX.Element => {
		return (
			<div className='puppet-card-container' ref={(element): void => {
				this._cardContainer = element;
			}}>
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
						<div className='puppet-actions-icon-container' onClick={this.onAddToSceneAsync} onMouseEnter={(): void => {this.onSetHighlightAdd(true)}} onMouseLeave={(): void => {this.onSetHighlightAdd(false)}}>
							<AddIcon fill={this.state.addHighlighted ? '#4A73E2' : 'black'} opacity={this.state.addHighlighted ? '1' : '0.6'} />
							<Spacer size={4} />
							<Typography variant={TypographyVariant.TEXT_X_SMALL} color={this.state.addHighlighted ? '#4A73E2' : 'rgba(0, 0, 0, 0.6)'}>
								Add to scene
							</Typography>
						</div>
						<Spacer size={24} />
						<div className='puppet-actions-icon-container' onMouseEnter={(): void => {this.onSetHighlightedEdit(true)}} onMouseLeave={(): void => {this.onSetHighlightedEdit(false)}}>
							<EditIcon fill={this.state.editHighlighted ? '#4A73E2' : 'black'} opacity={this.state.editHighlighted ? '1' : '0.6'} />
							<Spacer size={4} />
							<Typography variant={TypographyVariant.TEXT_X_SMALL} color={this.state.editHighlighted ? '#4A73E2' : 'rgba(0, 0, 0, 0.6)'}>
								Edit
							</Typography>
						</div>
						<Spacer size={24} />
						<div ref={(element): void => {
								this._moreIconContainer = element;
						}} className='puppet-actions-icon-container' onMouseEnter={(): void => {this.onSetHighlightedMore(true)}} onMouseLeave={(): void => {this.onSetHighlightedMore(false)}} onClick={this.onToggleMoreMenuVisible}>
							<MoreIcon fill={this.state.moreHighlighted ? '#4A73E2' : 'black'} opacity={this.state.moreHighlighted ? '1' : '0.6'} />
							<Spacer size={4} />
							<Typography variant={TypographyVariant.TEXT_X_SMALL} color={this.state.moreHighlighted ? '#4A73E2' : 'rgba(0, 0, 0, 0.6)'}>
								More
							</Typography>
						</div>
					</div>}
				</div>
				{this.state.moreMenuVisible
				&& <div onMouseEnter={this.openActions} onMouseLeave={this.closeActions}>
					<Menu
						left={this._cardContainerRect.left}
						top={this._moreIconRect.bottom} width={240}
						pointerLeft={this._moreIconRect.left - this._cardContainerRect.left + (this._moreIconRect.width / 2)}
						menuItems={this._moreMenuItems}
					/>
				</div>}
			</div>
		);
	}

	private onDownloadPuppetAsync(): void {
		this.setState({
			moreMenuVisible: false,
			actionsVisible: false,
		});

		this.props.onDownloadPuppet(this.props.puppet);
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

	private async onDeletePuppetAsync(): Promise<void> {
		await apiService.deletePuppet(this.props.puppet);
		this.props.onDelete();
	}

	private onAddToSceneAsync = async(): Promise<void> => {
		this.props.onStartAddingToScene();

		const puppet = await apiService.openPuppet(this.props.puppet);
		dranimate.addPuppet(puppet);

		this.props.onAddToScene();
	}

	private onSetHighlightAdd = (highlighted: boolean): void => {
		this.setState({
			addHighlighted: highlighted,
		});
	}

	private onSetHighlightedEdit = (highlighted: boolean): void => {
		this.setState({
			editHighlighted: highlighted,
		});
	}

	private onSetHighlightedMore = (highlighted: boolean): void => {
		this.setState({
			moreHighlighted: highlighted,
		});
	}

	private onToggleMoreMenuVisible = (): void => {
		this._cardContainerRect = this._cardContainer.getBoundingClientRect();
		this._moreIconRect = this._moreIconContainer.getBoundingClientRect();

		this.setState({
			moreMenuVisible: !this.state.moreMenuVisible
		});
	}
}
export default PuppetCard;
