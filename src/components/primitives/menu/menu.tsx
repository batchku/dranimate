import React from 'react';

import MenuItem, {MenuItemData} from './menu-item';

import './menu.scss'

interface MenuProps {
	top: number;
	left: number;
	width: number;
	pointerLeft: number;
	menuItems: MenuItemData[];
}

export default class Menu extends React.Component<MenuProps, {}> {
	constructor(props: MenuProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='menu-container' style={{
				width: `${this.props.width}px`,
				left: `${this.props.left}px`,
				top: `${this.props.top}px`
			}}>
				<div className='menu-arrow-pointer' style={{
					marginLeft: `${this.props.pointerLeft}px`
				}}/>
				<div className='menu-body'>
					{this.props.menuItems.map((menuItem) => {
						return (
							<MenuItem
								key={menuItem.label}
								label={menuItem.label}
								highlightColor={menuItem.highlightColor}
								labelColor={menuItem.labelColor}
								onClick={menuItem.onClick}
							/>
						);
					})}
				</div>
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
