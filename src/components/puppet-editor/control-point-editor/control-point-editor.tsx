import React from 'react';

import ControlPointService, {ActiveHand, FingerToMap} from 'services/imagetomesh/control-point-service';

import Typography, { TypographyVariant } from 'components/typography/typography';
import BorderButton from 'components/primitives/border-button/border-button';
import Spacer from 'components/primitives/spacer/spacer';
import Button from 'components/primitives/button-v2/button';
import FingerLabel from 'components/finger-label/finger-label';
import CircleIconButton from 'components/primitives/circle-icon-button/circle-icon-button';
import PuppetEditorClosePrompt from '../close-prompt/puppet-editor-close-prompt';

import './control-point-editor.scss';

enum HandToMap {
	LEFT = 'Left',
	RIGHT = 'Right',
}

interface ControlPointEditorProps {
	imageSrc: any;
	backgroundRemovalData: any;
	controlPointPositions: any;
	zoom: number;
	onSave: (controlPoints: any[]) => void;
	onClose: () => void;
	onBack: () => void;
	onNext: (controlPointPositions: any) => void;
}

interface ControlPointEditorState {
	canGoToNextStep: boolean;
	toolOptionsVisible: boolean;
	currentFingerToMap: FingerToMap;
	currentHandToMap: HandToMap;
	exitPromptOpen: boolean;
}

class ControlPointEditor extends React.Component<ControlPointEditorProps, ControlPointEditorState> {
	private _controlPointService = new ControlPointService();
	private _canvasElement: HTMLCanvasElement;

	constructor(props: ControlPointEditorProps) {
		super(props);

		this.state = {
			canGoToNextStep: this.props.controlPointPositions?.length > 0,
			toolOptionsVisible: true,
			currentFingerToMap: FingerToMap.THUMB,
			currentHandToMap: HandToMap.RIGHT,
			exitPromptOpen: false,
		};
	}

	public componentDidMount(): void {
		this._canvasElement.width = 400;
		this._canvasElement.height = 300;

		this._controlPointService.init(
			this._canvasElement,
			this.props.imageSrc,
			this.props.backgroundRemovalData,
			this.props.controlPointPositions,
			this.props.zoom
		);
	}

	public render(): JSX.Element {
		const controlPoints = this._controlPointService.getControlPoints();

		return (
			<div className='control-point-editor-container'>
				{this.state.exitPromptOpen
				&& <PuppetEditorClosePrompt onClose={this.props.onClose} onKeepCreating={this.onCloseExitPrompt} />}
				<div className='control-point-editor-dialog'>
					<div className='control-point-editor-dialog-title'>
					<img className='image-editor-close-button' src='./assets/close.svg' onClick={this.onOpenExitPrompt}/>
						<div className='control-point-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Map fingers
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
								onMouseMove={this._controlPointService.onMouseMove}
								onMouseDown={this.onMouseDown}
								onContextMenu={this._controlPointService.onContextMenu}
								onMouseUp={this._controlPointService.onMouseUp}
								onMouseOut={this._controlPointService.onMouseOut}
								onMouseOver={this._controlPointService.onMouseOver}
								onDoubleClick={this.onDoubleClick}
							/>
						</div>
						<div className='puppet-editor-options-container'>
							<div className='image-editor-tool-main-bar'>
								<div className='control-point-editor-tool-name'>
									{controlPoints.length < 5
									&& <Typography variant={TypographyVariant.TEXT_MEDIUM} color='#FFFFFF'>
										{`${this.state.currentHandToMap} ${this.state.currentFingerToMap} finger`}
									</Typography>}
									{controlPoints.length < 5
									&& <Typography variant={TypographyVariant.TEXT_X_SMALL} color='rgba(255, 255, 255, 0.7)'>
										Tap on the figure to map
									</Typography>}
									{controlPoints.length > 4
									&& <Typography variant={TypographyVariant.TEXT_MEDIUM} color='#FFFFFF'>
										All fingers mapped
									</Typography>}
									{controlPoints.length > 4
									&& <Typography variant={TypographyVariant.TEXT_X_SMALL} color='rgba(255, 255, 255, 0.7)'>
										Drag markers to update position
									</Typography>}
								</div>
								<div className='control-point-editor-tool-actions-container'>
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
							<div className='control-point-editor-tool-options'>
								{this.state.currentHandToMap === HandToMap.RIGHT
								&& <div className='control-point-editor-hand-option-container'>
									<img src='./assets/hand-r.svg' />
									<FingerLabel
										label='R1'
										position={{left: '-2%', top: '45%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.THUMB && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('R1')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.THUMB)}}
									/>
									<FingerLabel
										label='R2'
										position={{left: '42%', top: '-1%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.INDEX && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('R2')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.INDEX)}}
									/>
									<FingerLabel
										label='R3'
										position={{left: '61%', top: '3%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.MIDDLE && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('R3')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.MIDDLE)}}
									/>
									<FingerLabel
										label='R4'
										position={{left: '74%', top: '24%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.RING && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('R4')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.RING)}}
									/>
									<FingerLabel
										label='R5'
										position={{left: '87%', top: '50%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.PINKY && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('R5')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.PINKY)}}
									/>
								</div>}
								{this.state.currentHandToMap === HandToMap.LEFT
								&& <div className='control-point-editor-hand-option-container'>
									<img src='./assets/hand-l.svg' />
									<FingerLabel
										label='L1'
										position={{left: '86%', top: '45%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.THUMB && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('L1')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.THUMB)}}
									/>
									<FingerLabel
										label='L2'
										position={{left: '42%', top: '-1%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.INDEX && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('L2')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.INDEX)}}
									/>
									<FingerLabel
										label='L3'
										position={{left: '23%', top: '3%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.MIDDLE && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('L3')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.MIDDLE)}}
									/>
									<FingerLabel
										label='L4'
										position={{left: '10%', top: '24%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.RING && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('L4')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.RING)}}
									/>
									<FingerLabel
										label='L5'
										position={{left: '-2%', top: '50%'}}
										highlighted={this.state.currentFingerToMap === FingerToMap.PINKY && controlPoints.length < 5}
										placed={this._controlPointService.controlPointPlaced('L5')}
										onClick={(): void => {this.setCurrentFingerToMap(FingerToMap.PINKY)}}
									/>
								</div>}
							</div>}
							<div className='image-editor-toolbar'>
								<div className='control-point-editor-toolbar-description'>
									<Typography variant={TypographyVariant.TEXT_X_SMALL} color='rgba(255, 255, 255, 0.7)'>
										Select the hand that you want to animate your puppet with
									</Typography>
								</div>
								<Spacer size={16} />
								<div className='control-point-editor-toolbar-actions'>
									<CircleIconButton
										iconUrl='./assets/left-hand.svg'
										active={this.state.currentHandToMap === HandToMap.LEFT}
										onClick={this.setLeftHandActive}
									/>
									<Spacer size={8} />
									<CircleIconButton
										iconUrl='./assets/right-hand.svg'
										active={this.state.currentHandToMap === HandToMap.RIGHT}
										onClick={this.setRightHandActive}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className='control-point-editor-dialog-bottom-bar'>
						<div className='control-point-editor-bottom-bar-left-actions'>
							<BorderButton
								label='Previous'
								disabled={false}
								color='rgba(0, 0, 0, 0.6)'
								onClick={this.props.onBack}
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
						<div className='control-point-editor-bottom-bar-right-actions'>
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

	private onNext = (): void => {
		this.props.onNext(this._controlPointService.getControlPoints());
	}
	
	private onMouseDown = (): void => {
		this._controlPointService.onMouseDown(this.state.currentFingerToMap, this.getFingerLabel(this.state.currentFingerToMap));

		const controlPoints = this._controlPointService.getControlPoints();
		this.setState({
			canGoToNextStep: controlPoints.length > 0,
		});
		this.updateCurrentFingerToMap();
	}

	private getFingerLabel = (fingerName: string): string => {
		const fingerNameToIndexMap = {
			'thumb': 1,
			'index': 2,
			'middle': 3,
			'ring': 4,
			'pinky': 5,
		};
		const fingerHandIndicator = this.state.currentHandToMap === HandToMap.LEFT ? 'L' : 'R';

		return `${fingerHandIndicator}${fingerNameToIndexMap[fingerName]}`;
	}

	private onDoubleClick = (): void => {
		this._controlPointService.onDoubleClick();

		const controlPoints = this._controlPointService.getControlPoints();
		this.setState({
			canGoToNextStep: controlPoints.length > 0,
		});
		this.updateCurrentFingerToMap();
	}

	private updateCurrentFingerToMap = (): void => {
		const nextFingerToMap = this._controlPointService.getNextFingerToMap();
		this.setState({
			currentFingerToMap: nextFingerToMap,
		});
	}

	private setCurrentFingerToMap = (fingerToMap: FingerToMap): void => {
		this.setState({
			currentFingerToMap: fingerToMap,
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

	private setLeftHandActive = (): void => {
		this._controlPointService.clearControlPoints();
		this._controlPointService.setActiveHand(ActiveHand.LEFT);

		this.setState({
			currentHandToMap: HandToMap.LEFT,
			canGoToNextStep: false,
		});
	}

	private setRightHandActive = (): void => {
		this._controlPointService.clearControlPoints();
		this._controlPointService.setActiveHand(ActiveHand.RIGHT);

		this.setState({
			currentHandToMap: HandToMap.RIGHT,
			canGoToNextStep: false,
		});
	}
}
export default ControlPointEditor;
