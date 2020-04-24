import React from 'react';

import './menu-item.scss'
import Typography, { TypographyVariant } from 'components/typography/typography';

interface MenuItemProps {
	label: string;
	labelColor: string;
	highlightColor: string;
	onClick: () => void;
}

interface MenuItemState {
	highlighted: boolean;
}

export interface MenuItemData {
	label: string;
	labelColor: string;
	highlightColor: string;
	onClick: () => void;
}

export default class MenuItem extends React.Component<MenuItemProps, MenuItemState> {
	constructor(props: MenuItemProps) {
		super(props);

		this.state = {
			highlighted: false,
		};
	}

	public render = (): JSX.Element => {
		return (
			<div
				className='menu-item-container'
				style={{
					background: this.state.highlighted ? this.props.highlightColor : '#FFFFFF',
				}}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				onClick={this.props.onClick}
			>
				<Typography variant={TypographyVariant.HEADING_MEDIUM} color={this.props.labelColor}>
					{this.props.label}
				</Typography>
			</div>
		);
	}

	private onMouseEnter = (): void => {
		this.setState({
			highlighted: true,
		});
	}

	private onMouseLeave = (): void => {
		this.setState({
			highlighted: false,
		});
	}
}
