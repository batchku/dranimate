import React, { Component } from 'react';
import ImageEditor from './image-editor/image-editor';
import ControlPointEditor from './control-point-editor.tsx/control-point-editor';
import dranimate from 'services/dranimate/dranimate';
import puppetEditorStateService from './../../services/imagetomesh/PuppetEditorStateService';
import generateUniqueId from 'services/util/uuid';
import { generateMesh } from 'services/imagetomesh/generateMesh';
import { getImageDataFromImage } from 'services/imagetomesh/ImageUtil';
import loadImage from 'services/util/imageLoader';
import './puppet-editor.scss';

import eventManager from '../../services/eventManager/event-manager';

enum EditorStep {
	IMAGE = 'image',
	CONTROL_POINT = 'control-point',
}

interface PuppetEditorProps {
	onClose: () => void;
}

interface PuppetEditorState {
	imageSrc: any;
	step: EditorStep;
	backgroundRemovalData: any;
	controlPointPositions: any;
	zoom: number;
}

class PuppetEditor extends Component<PuppetEditorProps, PuppetEditorState> {
	constructor(props: PuppetEditorProps) {
		super(props);

		if (puppetEditorStateService.isPuppet) {
			const puppet = puppetEditorStateService.getItem();
			this.state = {
				imageSrc: puppet.image.src,
				backgroundRemovalData: puppet.backgroundRemovalData || null,
				controlPointPositions: puppet.controlPointPositions,
				zoom: 1,
				step: EditorStep.IMAGE
			};
		}
		else {
			this.state = {
				imageSrc: puppetEditorStateService.getItem(),
				step: EditorStep.IMAGE,
				backgroundRemovalData: null,
				controlPointPositions: null,
				zoom: 1,
			};
		}
	}

	public componentWillUnmount = (): void => {
		eventManager.emit('puppet-editor-closed');
	}

	public componentDidMount = (): void => {
		eventManager.emit('puppet-editor-opened');
	}

	private onClose = (): void => {
		this.props.onClose();
	}

	onImageEditorNext = (backgroundRemovalData, zoom): void => {
		this.setState({
			step: EditorStep.CONTROL_POINT,
			backgroundRemovalData,
			zoom: zoom
		});
	}

	onControlPointEditorBack = (): void => {
		this.setState({
			step: EditorStep.IMAGE
		});
	}

	onSave = (controlPointPositions): void => {
		if (controlPointPositions.length < 2) {
			alert('Puppet must have at least two control points');
			return;
		}
		const puppetId = puppetEditorStateService.isPuppet ?
			puppetEditorStateService.getItem().id : generateUniqueId();
		const puppetName = puppetEditorStateService.isPuppet ?
			puppetEditorStateService.getItem().getName() : '';

		loadImage(this.state.imageSrc)
			.then((imageElement) => {
				const { width, height } = this.state.backgroundRemovalData;
				const originalImageData = getImageDataFromImage(imageElement, width, height);
				return generateMesh(puppetId, puppetName, imageElement, this.state.backgroundRemovalData, originalImageData, controlPointPositions);
			})
			.then((puppet) => {
				if (puppet) {
					dranimate.addPuppet(puppet);
				}
				this.onClose();
			});
	}

	render(): JSX.Element {
		return (
			<div className='puppet-editor-backdrop'>
				{this.state.step === EditorStep.IMAGE
					? <ImageEditor
						imageSrc={this.state.imageSrc}
						backgroundRemovalData={this.state.backgroundRemovalData}
						onCancel={this.onClose}
						onNext={this.onImageEditorNext}
					/>
					: <ControlPointEditor
						imageSrc={this.state.imageSrc}
						backgroundRemovalData={this.state.backgroundRemovalData}
						controlPointPositions={this.state.controlPointPositions}
						onClose={this.onControlPointEditorBack}
						onSave={this.onSave}
						zoom={this.state.zoom}
					/>
				}
			</div>
		);
	}
}
export default PuppetEditor;
