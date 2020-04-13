import React from 'react';

import './toggle-button.scss';

interface ToggleButtonProps {
	onClick?: () => void;
	leftIconNameActive: string;
	leftIconNameInactive: string;
	rightIconNameActive: string;
	rightIconNameInactive: string;
	onLeftSelected: () => void;
	onRightSelected: () => void;
}

interface ToggleButtonState {
	leftSelected: boolean;
}

class ToggleButton extends React.Component<ToggleButtonProps, ToggleButtonState> {
	constructor(props: ToggleButtonProps) {
		super(props);

		this.state = {
			leftSelected: true
		};
	}

	public render = (): JSX.Element => {
		return (
			<div className='toggle-button-container'>
				<div
					style={{
						backgroundColor: this.state.leftSelected ? '#FFFFFF' : ''
					}}
					className='toggle-button-left-container'
					onClick={this.onLeftItemSelected}
				>
					{this.state.leftSelected && <img src={`./assets/${this.props.leftIconNameActive}`} />}
					{!this.state.leftSelected && <img src={`./assets/${this.props.leftIconNameInactive}`} />}
				</div>
				<div
					style={{backgroundColor: this.state.leftSelected ? '' : '#FFFFFF'}}
					className='toggle-button-right-container'
					onClick={this.onRightItemSelected}
				>
					{this.state.leftSelected && <img src={`./assets/${this.props.rightIconNameInactive}`} />}
					{!this.state.leftSelected && <img src={`./assets/${this.props.rightIconNameActive}`} />}
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
