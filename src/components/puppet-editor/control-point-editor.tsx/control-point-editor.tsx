import React from 'react';

import Button from 'components/primitives/button';

import ControlPointService from 'services/imagetomesh/control-point-service';

import './control-point-editor.scss';
import Typography, { TypographyVariant } from 'components/typography/typography';

interface ControlPointEditorProps {
	imageSrc: any;
	backgroundRemovalData: any;
	controlPointPositions: any;
	zoom: number;
	onSave: (controlPoints: any[]) => void;
	onClose: () => void;
}

class ControlPointEditor extends React.Component<ControlPointEditorProps, {}> {
	private _controlPointService = new ControlPointService();
	private _canvasElement: HTMLCanvasElement;

	constructor(props: ControlPointEditorProps) {
		super(props);
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
		return (
			<div className='control-point-editor-container'>
				<div className='control-point-editor-dialog'>
					<div className='control-point-editor-dialog-title'>
						<img className='control-point-editor-back-button' src='./assets/back.svg' onClick={this.props.onClose}/>
						<img className='control-point-editor-next-button' src='./assets/next.svg' onClick={this.onSave}/>
						<div className='control-point-editor-title-container'>
							<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
								Select Control Points
							</Typography>
						</div>
					</div>
					<div className='control-point-editor-dialog-body'>
						<canvas
							ref={(input): void => {
								this._canvasElement = input
							}}
							onMouseMove={this._controlPointService.onMouseMove}
							onMouseDown={this._controlPointService.onMouseDown}
							onContextMenu={this._controlPointService.onContextMenu}
							onMouseUp={this._controlPointService.onMouseUp}
							onMouseOut={this._controlPointService.onMouseOut}
							onMouseOver={this._controlPointService.onMouseOver}
							onDoubleClick={this._controlPointService.onDoubleClick}
						/>
					</div>
				</div>
			</div>
			/* <div>

				<div className='editorNav'>
					<Button
						onClick={this.props.onClose}
						className='navButton'
					>
						Back
					</Button>
					<Button
						onClick={this.onSave}
						className='navButton'
					>
						Done
					</Button>
				</div>

				<div>
					<canvas
						className='editorCanvasChecker'
						ref={(input): void => {
							this._canvasElement = input
						}}
						onMouseMove={this._controlPointService.onMouseMove}
						onMouseDown={this._controlPointService.onMouseDown}
						onContextMenu={this._controlPointService.onContextMenu}
						onMouseUp={this._controlPointService.onMouseUp}
						onMouseOut={this._controlPointService.onMouseOut}
						onMouseOver={this._controlPointService.onMouseOver}
						onDoubleClick={this._controlPointService.onDoubleClick}
					/>
				</div>

				<div className='editorControlParam'>
					<div className='editorControlRow'>
						<div className='editorControlLabel'>
							<p>2</p>
						</div>
						<p>Control Points</p>
					</div>
				</div>

			</div> */
		);
	}

	private onSave = (): void => {
		this.props.onSave(this._controlPointService.getControlPoints())
	}
}
export default ControlPointEditor;
