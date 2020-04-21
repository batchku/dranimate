import React, { Component } from 'react';

import ImageEditor from './image-editor/image-editor';
import ControlPointEditor from './control-point-editor.tsx/control-point-editor';
import PuppetDetailsEditor from './puppet-details-editor/puppet-details-editor';

import dranimate from 'services/dranimate/dranimate';
import puppetEditorStateService from 'services/imagetomesh/puppet-editor-state-service';
import generateUniqueId from 'services/util/uuid';
import { generateMesh } from 'services/imagetomesh/generateMesh';
import { getImageDataFromImage } from 'services/imagetomesh/ImageUtil';
import loadImage from 'services/util/imageLoader';
import apiService from 'services/api/apiService';
import userService from 'services/api/userService';

import './puppet-editor.scss';

import eventManager from '../../services/eventManager/event-manager';
import Puppet from 'services/puppet/puppet';

enum EditorStep {
	IMAGE = 'image',
	CONTROL_POINT = 'control-point',
	DETAILS = 'details',
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
	private _puppetName = '';

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

	onControlPointEditorNext = (controlPointPositions): void => {
		this.setState({
			step: EditorStep.DETAILS,
			controlPointPositions: controlPointPositions,
		});
	}

	onPuppetDetailsEditorBack = (): void => {
		this.setState({
			step: EditorStep.CONTROL_POINT
		});
	}

	onSave = (): void => {
		if (this.state.controlPointPositions.length < 2) {
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
				return generateMesh(puppetId, puppetName || this._puppetName, imageElement, this.state.backgroundRemovalData, originalImageData, this.state.controlPointPositions);
			})
			.then((puppet) => {
				if (puppet) {
					dranimate.addPuppet(puppet);
					eventManager.emit('open-loader', 'Saving puppet')
					this.savePuppetAsync(puppet).then(() => {
						this.onClose();
						eventManager.emit('close-loader');
					});
				}
			});
	}

	/**
	 * Saves puppet in database.
	 */
	private savePuppetAsync = async(puppet: Puppet): Promise<void> => {
		if (!userService.isAuthenticated()) {
			console.warn('User not logged in, skipping puppet save to DB...');
			return;
		}
		await apiService.savePuppet(puppet);
	}

	private onNameChange = (value: string): void => {
		this._puppetName = value;
	}

	render(): JSX.Element {
		return (
			<div className='puppet-editor-backdrop'>
				{this.state.step === EditorStep.IMAGE
				&& <ImageEditor
					imageSrc={this.state.imageSrc}
					backgroundRemovalData={this.state.backgroundRemovalData}
					onCancel={this.onClose}
					onNext={this.onImageEditorNext}
				/>}
				{this.state.step === EditorStep.CONTROL_POINT
				&& <ControlPointEditor
					imageSrc={this.state.imageSrc}
					backgroundRemovalData={this.state.backgroundRemovalData}
					controlPointPositions={this.state.controlPointPositions}
					onBack={this.onControlPointEditorBack}
					onClose={this.onClose}
					onSave={this.onSave}
					zoom={this.state.zoom}
					onNext={this.onControlPointEditorNext}
				/>}
				{this.state.step === EditorStep.DETAILS
				&& <PuppetDetailsEditor
					onClose={this.onClose}
					onBack={this.onPuppetDetailsEditorBack}
					onSave={this.onSave}
					onNameChange={this.onNameChange}
				/>}
			</div>
		);
	}
}
export default PuppetEditor;
