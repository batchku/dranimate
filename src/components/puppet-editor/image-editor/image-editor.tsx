import React, { Component } from 'react';

import Button from 'components/primitives/button';
import Checkbox from 'components/primitives/checkbox';
import Slider from 'components/primitives/slider';
import ZoomPanner from 'components/zoomPanner';
import Spacer from 'components/primitives/spacer/spacer';
import Range from 'components/primitives/range/range';
import ToggleButton from 'components/primitives/toggle-button/toggle-button';
import Typography, { TypographyVariant } from 'components/typography/typography';

import BrushIcon from './../../../icons/brush-icon';
import EraserIcon from './../../../icons/eraser-icon';

import ImageEditorService from 'services/imagetomesh/ImageEditorService';

import './image-editor.scss';

interface ImageEditorProps {
	imageSrc: any;
	backgroundRemovalData: any;
	onNext: (imageForegroundSelection: any, imageEditorZoom: any) => void;
	onCancel: () => void;
}

interface ImageEditorState {
	eraseDraw: boolean;
	selector: string;
	threshold: number;
	loaderIsVisible: boolean;
	step: number;
}

class ImageEditor extends Component<ImageEditorProps, ImageEditorState> {
	private _imageEditorService = new ImageEditorService();
	private _canvasElement: HTMLCanvasElement;

	constructor(props: ImageEditorProps) {
		super(props);

		this.state = {
			eraseDraw: true,
			selector: 'SELECT',
			threshold: 30,
			loaderIsVisible: false,
			step: 0
		};
	}

	public componentDidMount(): void {
		this._canvasElement.width = 400;
		this._canvasElement.height = 300;

		this._imageEditorService.init(this._canvasElement, this.props.imageSrc, this.props.backgroundRemovalData)
			.then(() => this.runSlic())
			.catch(error => console.log('error', error));
	}

	private runSlic = (): void => {
		console.log('Running SLIC...')

		this.setState({
			loaderIsVisible: true
		});

		setTimeout(() => {
			this._imageEditorService.doSlic(this.state.threshold);
			this.setState({
				loaderIsVisible: false
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
				<div className='image-editor-dialog'>
					<div className='image-editor-dialog-title'>
						<img className='image-editor-close-button' src='./assets/close.svg' onClick={this.props.onCancel}/>
						<img className='image-editor-next-button' src='./assets/next.svg' onClick={this.onNext}/>
						<div className='image-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Select Figure
							</Typography>
						</div>
					</div>
					<div className='image-editor-dialog-body'>
						<canvas
							className='editor-canvas'
							ref={(input): void => {
								this._canvasElement = input
							}}
							onMouseMove={this._imageEditorService.onMouseMove}
							onMouseDown={this._imageEditorService.onMouseDown}
							onContextMenu={this._imageEditorService.onContextMenu}
							onMouseUp={this._imageEditorService.onMouseUp}
							onMouseOut={this._imageEditorService.onMouseOut}
							onMouseOver={this._imageEditorService.onMouseOver}
						/>
						<div className='image-editor-tool-main-bar'>
							<div className='image-editor-tool-name'>
								<Typography variant={TypographyVariant.TEXT_MEDIUM} color='#FFFFFF'>
									Magic selection
								</Typography>
							</div>
							<div className='image-editor-tool-actions-container'>
								<img className='image-editor-tool-action-icon' src='./assets/question-mark.svg' />
								<img className='image-editor-tool-action-icon' src='./assets/arrow-down.svg' />
							</div>
						</div>
						<div className='image-editor-tool-options'>
							<ToggleButton
								leftIconNameActive='brush-active.svg'
								leftIconNameInactive='brush-inactive.svg'
								rightIconNameActive='eraser-active.svg'
								rightIconNameInactive='eraser-inactive.svg'
								onLeftSelected={this.onActivateBrush}
								onRightSelected={this.onActivateEraser}
							/>
							<Range />
						</div>
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

				{/*<div className='editorControlParam'>
					<div className='editorControlRow'>

						<div className='editorControlLabel'>
							<p>1</p>
						</div>
						<p>Select Image</p>

						<div className='editorControlRow rowSpaceAround'>

							<div>
								<Checkbox
									defaultChecked={ this.state.eraseDraw }
									onChange={ this.onEraseDrawChange }
								/>
								<p className='drawEraseLabel'>
									{ this.state.eraseDraw ? 'Draw' : 'Erase'}
								</p>
							</div>

							<div>
								<label htmlFor='thresholdSlider'>Selection Threshold</label>
								<Slider
									min={ 20 }
									max={ 75 }
									defaultValue={ this.state.threshold }
									onChange={ this.updateThresholdUi }
									onChangeEnd={ this.runSlic }
								/>
								<span>{this.state.threshold}</span>
							</div>

						</div>
					</div>
				</div>*/}

			</div>
		);
	}

	private onActivateBrush = (): void => {
		this._imageEditorService.setSelectState('SELECT');
	}

	private onActivateEraser = (): void => {
		this._imageEditorService.setSelectState('DESELECT');
	}
}
export default ImageEditor;
