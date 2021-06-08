import React, { Component } from 'react';

import Range from 'components/primitives/range/range';
import ToggleButton from 'components/primitives/toggle-button/toggle-button';
import BorderButton from 'components/primitives/border-button/border-button';
import Button from 'components/primitives/button-v2/button';
import Spacer from 'components/primitives/spacer/spacer';
import PuppetEditorClosePrompt from '../close-prompt/puppet-editor-close-prompt';
import Typography, { TypographyVariant } from 'components/typography/typography';

import ImageEditorService from 'services/imagetomesh/image-editor-service';

import './image-editor.scss';

interface ImageEditorProps {
	imageSrc: any;
	backgroundRemovalData: any;
	onNext: (imageForegroundSelection: any, imageEditorZoom: any) => void;
	onCancel: () => void;
}

interface ImageEditorState {
	threshold: number;
	loaderIsVisible: boolean;
	step: number;
	toolOptionsVisible: boolean;
	canGoToNextStep: boolean;
	exitPromptOpen: boolean;
	brushActive: boolean;
}

class ImageEditor extends Component<ImageEditorProps, ImageEditorState> {
	private _imageEditorService = new ImageEditorService();
	private _canvasElement: HTMLCanvasElement;

	constructor(props: ImageEditorProps) {
		super(props);

		this.state = {
			threshold: 30,
			loaderIsVisible: false,
			step: 0,
			toolOptionsVisible: true,
			canGoToNextStep: false,
			exitPromptOpen: false,
			brushActive: true,
		};

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
	}

	public componentDidMount(): void {
		this._canvasElement.width = 400;
		this._canvasElement.height = 300;

		this._imageEditorService.init(this._canvasElement, this.props.imageSrc, this.props.backgroundRemovalData)
			.then(() => this.runSlic())
			.catch(error => console.log('error', error));

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	private onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Shift') {
			this._imageEditorService.toggleSelectState();
			this.setState((prevState) => {
				return {
					...prevState,
					brushActive: !prevState.brushActive
				}
			});
		}
	}

	private onKeyUp(event: KeyboardEvent): void {
		if (event.key === 'Shift') {
			this._imageEditorService.toggleSelectState();
			this.setState((prevState) => {
				return {
					...prevState,
					brushActive: !prevState.brushActive
				}
			});
		}
	}

	private runSlic = (): void => {
		console.log('Running SLIC...')

		this.setState({
			loaderIsVisible: true
		});

		setTimeout(() => {
			this._imageEditorService.doSlic(this.state.threshold);
			this.setState({
				loaderIsVisible: false,
				canGoToNextStep: this._imageEditorService.selectedRegionExists(),
			});
		});
	};

	private updateThresholdUi = (threshold: any): void => {
		this.setState({
			threshold
		});
	}

	private onZoomSelect = (isZoomIn: boolean, zoomStep: number): void => {
		isZoomIn ? this._imageEditorService.zoomIn(zoomStep) : this._imageEditorService.zoomOut(zoomStep);
	}

	private onNext = (): void => {
		const imageForegroundSelection = this._imageEditorService.getImageForegroundSelection();
		const imageEditorZoom = this._imageEditorService.getZoom();
		this.props.onNext(imageForegroundSelection, imageEditorZoom);
	};

	public render(): JSX.Element {
		return (
			<div className='image-editor-container'>
				{this.state.exitPromptOpen
				&& <PuppetEditorClosePrompt onClose={this.props.onCancel} onKeepCreating={this.onCloseExitPrompt} />}
				<div className='image-editor-dialog'>
					<div className='image-editor-dialog-title'>
						<img className='image-editor-close-button' src='./assets/close.svg' onClick={this.onOpenExitPrompt}/>
						<div className='image-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Select Figure
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
								onMouseMove={this._imageEditorService.onMouseMove}
								onMouseDown={this._imageEditorService.onMouseDown}
								onContextMenu={this._imageEditorService.onContextMenu}
								onMouseUp={this.onMouseUp}
								onMouseOut={this._imageEditorService.onMouseOut}
								onMouseOver={this._imageEditorService.onMouseOver}
							/>
						</div>
						<div className='puppet-editor-options-container'>
							<div className='image-editor-tool-main-bar'>
								<div className='image-editor-tool-name'>
									<Typography variant={TypographyVariant.TEXT_MEDIUM} color='#FFFFFF'>
										Magic selection
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
							<div className='image-editor-tool-options'>
								<ToggleButton
									leftIconNameActive='brush-active.svg'
									leftIconNameInactive='brush-inactive.svg'
									rightIconNameActive='eraser-active.svg'
									rightIconNameInactive='eraser-inactive.svg'
									leftActive={this.state.brushActive}
									onLeftSelected={this.onActivateBrush}
									onRightSelected={this.onActivateEraser}
								/>
								<Range onChangeEnd={this.runSlic} onChange={this.updateThresholdUi} />
							</div>}
							<div className='image-editor-toolbar'>
								<div className='image-editor-undo-redo-container'>
									<img className='image-editor-tool-action-icon' src='./assets/undo.svg' />
									<img className='image-editor-tool-action-icon' src='./assets/redo.svg' />
								</div>
								<div className='image-editor-tools-container'>
									<div className='image-editor-tool-container'>
										<img className='image-editor-tool-action-icon' src='./assets/wand.svg' />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='image-editor-dialog-bottom-bar'>
						<div className='image-editor-bottom-bar-left-actions'>
							<BorderButton
								label='Previous'
								disabled={true}
								disabledColor='rgba(0, 0, 0, 0.3)'
							/>
							<Spacer size={8} />
							<BorderButton
								label='Next'
								disabled={!this.state.canGoToNextStep}
								color='#4A73E2'
								disabledColor='rgba(74, 115, 226, 0.4)'
								onClick={this.onNext}
							/>
						</div>
						<div className='image-editor-bottom-bar-right-actions'>
							<Button label='Save' disabled={true} />
						</div>
					</div>
				</div>
			</div>
		);
	}

	private onCloseExitPrompt = (): void => {
		this.setState({
			exitPromptOpen: false,
		});
	}

	private onOpenExitPrompt = (): void => {
		this.setState({
			exitPromptOpen: true,
		});
	}

	private onMouseUp = (): void => {
		this._imageEditorService.onMouseUp();

		this.setState({
			canGoToNextStep: this._imageEditorService.selectedRegionExists(),
		});
	}

	private onActivateBrush = (): void => {
		this._imageEditorService.setSelectState('SELECT');
		this.setState({
			brushActive: true
		});
	}

	private onActivateEraser = (): void => {
		this._imageEditorService.setSelectState('DESELECT');
		this.setState({
			brushActive: false
		});
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
}
export default ImageEditor;
