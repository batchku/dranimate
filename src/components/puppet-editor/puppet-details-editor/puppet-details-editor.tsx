import React, { Component } from 'react';

import { extractForeground, getImageDataFromImage } from 'services/imagetomesh/ImageUtil.js';
import loadImage from 'services/util/imageLoader';

import BorderButton from 'components/primitives/border-button/border-button';
import Button from 'components/primitives/button-v2/button';
import Spacer from 'components/primitives/spacer/spacer';
import Input from 'components/primitives/input/input';
import CircularProgress from 'components/primitives/circular-progress/circular-progress';
import Typography, { TypographyVariant } from 'components/typography/typography';

import './puppet-details-editor.scss';

interface PuppetDetailsProps {
	onSaveAsync: () => Promise<void>;
	onClose: () => void;
	onBack: () => void;
	onNameChange: (name: string) => void;
	imageSrc: any;
	backgroundRemovalData: any;
	zoom: number;
}

interface PuppetDetailsState {
	name: string;
	toolOptionsVisible: boolean;
	saving: boolean;
}

class PuppetDetails extends Component<PuppetDetailsProps, PuppetDetailsState> {
	private _canvasElement: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;
	private _puppetImage: any;
	private _width: number;
	private _height: number;
	private _zoom = 1;

	constructor(props: PuppetDetailsProps) {
		super(props);

		this._zoom = this.props.zoom || 1;

		this.state = {
			name: 'My puppet',
			toolOptionsVisible: true,
			saving: false
		};
	}

	public componentDidMount(): void {
		this._canvasElement.width = 400;
		this._canvasElement.height = 300;

		this.initPuppetImage();
	}

	public render(): JSX.Element {
		return (
			<div className='puppet-details-editor-container'>
				<div className='image-editor-dialog'>
					<div className='image-editor-dialog-title'>
						<img className='image-editor-close-button' src='./assets/close.svg' onClick={this.props.onClose}/>
						<div className='image-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Puppet details
							</Typography>
						</div>
					</div>
					<div className='puppet-editor-dialog-body'>
						<div className='puppet-editor-canvas-container'>
							<canvas
								className='puppet-editor-canvas'
								ref={(input): void => {
									this._canvasElement = input
								}}
							/>
						</div>
						<div className='puppet-editor-options-container'>
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
									value={this.state.name}
								/>
							</div>}
						</div>
					</div>
					<div className='image-editor-dialog-bottom-bar'>
						<div className='image-editor-bottom-bar-left-actions'>
							<BorderButton
								label='Previous'
								disabled={false}
								color='rgba(0, 0, 0, 0.6)'
								onClick={this.props.onBack}
							/>
							<Spacer size={8} />
							<BorderButton
								label='Next'
								disabled={true}
								disabledColor='rgba(74, 115, 226, 0.4)'
							/>
						</div>
						<div className='image-editor-bottom-bar-right-actions'>
							<Button label='Save' disabled={!this.state.name} onClick={this.onSaveAsync} />
						</div>
					</div>
				</div>
				{this.state.saving
				&& <div className='puppet-details-progress-backdrop'>
					<CircularProgress />
					<Spacer size={10} />
					<Typography variant={TypographyVariant.HEADING_SMALL} color='#4A73E2' >
						Saving the puppet. This may take a while...
					</Typography>
				</div>}
			</div>
		);
	}

	private initPuppetImage = async(): Promise<void> => {
		this._context = this._canvasElement.getContext('2d');
		
		this._width = this._canvasElement.width;
		this._height = this._canvasElement.height;

		const image = await loadImage(this.props.imageSrc)
		
		const largerSize = Math.max(image.width, image.height);
		const normWidth = (image.width / largerSize) * 400;
		const normHeight = (image.height / largerSize) * 400;

		this._width = normWidth;
		this._height = normHeight;

		const originalImageData = getImageDataFromImage(image, this._width, this._height);
		const imageNoBG = await extractForeground(originalImageData, this.props.backgroundRemovalData);
		
		this._puppetImage = imageNoBG;
		this.redraw();
	}

	private redraw = (): void => {
		this._context.save();

		this._context.clearRect(0, 0, this._width, this._height);
		this._context.scale(this._zoom, this._zoom);
		this._context.drawImage(this._puppetImage, 0, 0, this._width, this._height, 0, 0, this._width, this._height);

		this._context.restore();
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
		this.props.onNameChange(value);
	}

	private onSaveAsync = async(): Promise<void> => {
		this.setState({
			saving: true,
		});
		await this.props.onSaveAsync();
	}
}
export default PuppetDetails;
