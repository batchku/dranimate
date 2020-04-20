import React, { Component } from 'react';

import BorderButton from 'components/primitives/border-button/border-button';
import Button from 'components/primitives/button-v2/button';
import Spacer from 'components/primitives/spacer/spacer';
import Input from 'components/primitives/input/input';
import Typography, { TypographyVariant } from 'components/typography/typography';

import './puppet-details-editor.scss';

interface PuppetDetailsProps {
	onSave: () => void;
	onClose: () => void;
	onBack: () => void;
}

interface PuppetDetailsState {
	name: string;
	toolOptionsVisible: boolean;
}

class PuppetDetails extends Component<PuppetDetailsProps, PuppetDetailsState> {
	private _canvasElement: HTMLCanvasElement;

	constructor(props: PuppetDetailsProps) {
		super(props);

		this.state = {
			name: '',
			toolOptionsVisible: true,
		};
	}

	public componentDidMount(): void {
		this._canvasElement.width = 400;
		this._canvasElement.height = 300;
	}

	public render(): JSX.Element {
		return (
			<div className='image-editor-container'>
				<div className='image-editor-dialog'>
					<div className='image-editor-dialog-title'>
						<img className='image-editor-close-button' src='./assets/close.svg' onClick={this.props.onClose}/>
						<div className='image-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Puppet details
							</Typography>
						</div>
					</div>
					<div className='image-editor-dialog-body'>
						<canvas
							ref={(input): void => {
								this._canvasElement = input
							}}
						/>
						<div className='image-editor-tool-main-bar'>
							<div className='image-editor-tool-name'>
								<Typography variant={TypographyVariant.TEXT_MEDIUM} color='#FFFFFF'>
									Puppet details
								</Typography>
							</div>
							<div className='image-editor-tool-actions-container'>
								<div className='image-editor-tool-action-icon-container'>
									<img className='image-editor-tool-action-icon' src='./assets/question-mark.svg' />
								</div>
								{this.state.toolOptionsVisible &&
								<div className='image-editor-tool-action-icon-container'>
									<img className='image-editor-tool-action-icon' src='./assets/arrow-down.svg' onClick={this.hideToolOptions} />
								</div>}
								{!this.state.toolOptionsVisible &&
								<div className='image-editor-tool-action-icon-container'>
									<img className='image-editor-tool-action-icon' src='./assets/arrow-up.svg' onClick={this.showToolOptions} />
								</div>}
							</div>
						</div>
						{this.state.toolOptionsVisible &&
						<div className='puppet-details-editor-tool-options'>
							<Input
								onChange={this.onNameChange}
								label='Puppet name'
								placeholder='Enter a short name for your puppet'
								type='text'
								backgroundColor='#4A73E2'
								inputColor='rgba(255, 255, 255, 0.9)'
								color='rgba(255, 255, 255, 0.7)'
								fullWidth={true}
							/>
						</div>}
					</div>
					<div className='image-editor-dialog-bottom-bar'>
						<div className='image-editor-bottom-bar-left-actions'>
							<BorderButton
								label='Previous'
								disabled={false}
								color='rgba(0, 0, 0, 0.6)'
							/>
							<Spacer size={8} />
							<BorderButton
								label='Next'
								disabled={true}
								disabledColor='rgba(74, 115, 226, 0.4)'
							/>
						</div>
						<div className='image-editor-bottom-bar-right-actions'>
							<Button label='Save' disabled={!this.state.name} onClick={this.props.onSave} />
						</div>
					</div>
				</div>
			</div>
		);
	}

	private showToolOptions = (): void => {
		this.setState({
			toolOptionsVisible: true,
		});
	}

	private hideToolOptions = (): void => {
		this.setState({
			toolOptionsVisible: false,
		});
	}

	private onNameChange = (value: string): void => {
		this.setState({
			name: value,
		});
	}
}
export default PuppetDetails;
