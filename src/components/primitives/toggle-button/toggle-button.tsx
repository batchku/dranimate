import React from 'react';

import './toggle-button.scss';

interface ToggleButtonProps {
	onClick?: () => void;
	leftIconNameActive: string;
	leftIconNameInactive: string;
	rightIconNameActive: string;
	rightIconNameInactive: string;
	leftActive: boolean;
	onLeftSelected: () => void;
	onRightSelected: () => void;
}

class ToggleButton extends React.Component<ToggleButtonProps, {}> {
	public render = (): JSX.Element => {
		return (
			<div className='toggle-button-container'>
				<div
					style={{
						backgroundColor: this.props.leftActive ? '#FFFFFF' : ''
					}}
					className='toggle-button-left-container'
					onClick={this.onLeftItemSelected}
				>
					{this.props.leftActive && <img src={`./assets/${this.props.leftIconNameActive}`} />}
					{!this.props.leftActive && <img src={`./assets/${this.props.leftIconNameInactive}`} />}
				</div>
				<div
					style={{backgroundColor: this.props.leftActive ? '' : '#FFFFFF'}}
					className='toggle-button-right-container'
					onClick={this.onRightItemSelected}
				>
					{this.props.leftActive && <img src={`./assets/${this.props.rightIconNameInactive}`} />}
					{!this.props.leftActive && <img src={`./assets/${this.props.rightIconNameActive}`} />}
				</div>
			</div>
		);
	}

	private onLeftItemSelected = (): void => {
		this.setState({
			leftSelected: true
		});

		this.props.onLeftSelected();
	}

	private onRightItemSelected = (): void => {
		this.setState({
			leftSelected: false
		});

		this.props.onRightSelected();
	}
}
export default ToggleButton;
