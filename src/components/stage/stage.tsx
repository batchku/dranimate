import React from 'react';

import Loader from 'components/loader';
import GifPreview from 'components/GifPreview';
import TopBar from 'components/top-bar/top-bar';
import RightBar from 'components/right-bar/right-bar';
import BottomBar from 'components/bottom-bar/bottom-bar';
import PuppetEditor from 'components/puppetEditor';
import Profile from 'components/Profile';
import Toast from 'components/primitives/toast';
import WelcomeMessage from 'components/welcome-message/welcome-message';

import { loadDranimateFile, loadImageFile } from 'services/util/file';
import puppetEditorStateService from 'services/imagetomesh/PuppetEditorStateService';
import dranimate from 'services/dranimate/dranimate';
import eventManager from 'services/eventManager/event-manager';

import './styles.scss';

enum FILE_PICKER_STATE {
	DRANIMATE = 'DRANIMATE',
	BACKGROUND = 'BACKGROUND'
}

interface StageState {
	editorIsOpen: boolean;
	profileIsOpen: boolean;
	controllerIsOpen: boolean;
	selectedPuppet: any;
	loaderIsVisible: boolean;
	loaderMessage: string;
	gifPreviewBlob: any;
	backgroundColor: string;
	hasBackgroundImage: boolean;
}

class Stage extends React.Component<{}, StageState> {
	private filePickerState: FILE_PICKER_STATE = FILE_PICKER_STATE.DRANIMATE;
	private dranimateStageContainer: HTMLDivElement;
	private filePicker: HTMLInputElement;
	private colorPicker: HTMLInputElement;

	private onAddPuppetEventId: string;
	private onOpenLoaderEventId: string;
	private onCloseLoaderEventId: string;
	private onEditPuppetEventId: string;

	constructor(props: {}) {
		super(props);

		this.state = {
			editorIsOpen: false,
			profileIsOpen: false,
			controllerIsOpen: false,
			selectedPuppet: null,
			loaderIsVisible: false,
			loaderMessage: '',
			gifPreviewBlob: null,
			backgroundColor: '#66FF66',
			hasBackgroundImage: false,
		};
	}

	public componentDidMount = (): void => {
		dranimate.setup(this.dranimateStageContainer, 'dranimate-canvas-background');

		this.onAddPuppetEventId = eventManager.on('on-add-puppet', this.onFabClick);
		this.onOpenLoaderEventId = eventManager.on('open-loader', this.openLoader);
		this.onCloseLoaderEventId = eventManager.on('close-loader', this.closeLoader);
		this.onEditPuppetEventId = eventManager.on('edit-puppet', this.onEditSelectedPuppet);
	}

	public componentWillUnmount = (): void => {
		eventManager.remove(this.onAddPuppetEventId);
		eventManager.remove(this.onOpenLoaderEventId);
		eventManager.remove(this.onCloseLoaderEventId);
	}

	private onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
		dranimate.onMouseDown(event);

		const selectedPuppet = dranimate.getSelectedPuppet();
		this.setState({
			selectedPuppet: selectedPuppet
		});
	}

	private closeEditor = (): void => {
		dranimate.startRenderLoop();

		this.setState({
			editorIsOpen: false
		});
	}

	private closeProfile = (): void => {
		dranimate.startRenderLoop();

		this.setState({
			profileIsOpen: false
		});
	}

	private onFabClick = (): void => {
		this.filePickerState = FILE_PICKER_STATE.DRANIMATE;
		this.filePicker.click();
	}

	private onZoomSelect = (isZoomIn: boolean): void => {
		isZoomIn ? dranimate.zoomIn() : dranimate.zoomOut();
	}

	private onPanSelect = (isPanSelected): void => {
		dranimate.setPanEnabled(isPanSelected);
	}

	public onDeleteSelectedPuppet = (): void => {
		dranimate.deleteSelectedPuppet();
		if (!dranimate.hasPuppet()) {
			dranimate.stopRenderLoop();
		}
		this.setState({
			selectedPuppet: null
		});
	}

	private onEditSelectedPuppet = (): void => {
		puppetEditorStateService.setItem(dranimate.getSelectedPuppet());
		this.setState({
			editorIsOpen: true
		});
		dranimate.stopRenderLoop();
	}

	private openLoader = (message: string): void => {
		this.setState({
			loaderIsVisible: true,
			loaderMessage: message
		});
		dranimate.stopRenderLoop();
	}

	private closeLoader = (): void => {
		this.setState({
			loaderIsVisible: false,
			loaderMessage: ''
		});
		dranimate.startRenderLoop();
	}

	private gifPreviewAvailable = (gifPreviewBlob): void => {
		this.setState({
			gifPreviewBlob
		});
		dranimate.stopRenderLoop();
	}

	private closeGifPreview = (): void => {
		this.setState({
			gifPreviewBlob: null
		});
		dranimate.startRenderLoop();
	}

	private onFileChange = (): void => {
		if (this.filePickerState === FILE_PICKER_STATE.DRANIMATE) {
			this.loadDranimateFile();
			return;
		}
		if (this.filePickerState === FILE_PICKER_STATE.BACKGROUND) {
			this.loadBackgroundFile();
			return;
		}
	}

	private loadDranimateFile = async(): Promise<void> => {
		const file = await loadDranimateFile(this.filePicker)

		const isPuppet = !!file.id;
		if (isPuppet) {
			dranimate.addPuppet(file);
			dranimate.startRenderLoop();
		}
		else {
			puppetEditorStateService.setItem(file);
			this.setState({
				editorIsOpen: true
			});
		}
	}

	private loadBackgroundFile = async(): Promise<void> => {
		const imageFile = await loadImageFile(this.filePicker)
		dranimate.setBackgroundImage(imageFile);

		this.setState({
			hasBackgroundImage: true
		});
	}

	private onBackgroundImage = (): void => {
		this.filePickerState = FILE_PICKER_STATE.BACKGROUND;
		this.filePicker.click();
	}

	private onBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const backgroundColor = event.target.value;
		dranimate.setBackgroundColor(backgroundColor);
		this.setState({
			backgroundColor
		});
	}

	private clearBackground = (): void => {
		dranimate.clearBackground();
		this.setState({
			hasBackgroundImage: false
		});
	}

	private onBackgroundImageSizeChange = (value: number): void => {
		const normalizedValue = value / 100;
		dranimate.setBackgroundImageSize(normalizedValue);
	};

	private onProfileClick = (): void => {
		this.setState({
			profileIsOpen: true
		});
		dranimate.stopRenderLoop();
	};

	public render(): JSX.Element {
		return (
			<div className='stage'>
				<video style={{display: 'none', position: 'fixed'}} id="video" width={'auto'} height={'auto'} playsInline></video>
				<div
					className='dranimateCanvas'
					onMouseDown={this.onMouseDown}
					onMouseMove={dranimate.onMouseMove}
					onMouseUp={dranimate.onMouseUp}
					onTouchStart={dranimate.onTouchStart}
					onTouchEnd={dranimate.onTouchEnd}
					ref={(input): void => {
						this.dranimateStageContainer = input;
					}}
				/>
				<WelcomeMessage />
				<TopBar />
				<RightBar />
				<BottomBar />
				<input
					type='file'
					ref={(input): void => {
						this.filePicker = input
					}}
					value=''
					onChange={this.onFileChange}
					className='hiddenFilePicker'
				/>
				<input
					type='color'
					ref={(element): void => {
						this.colorPicker = element
					}}
					value={this.state.backgroundColor}
					onChange={this.onBackgroundColorChange}
				/>
				{
					this.state.editorIsOpen ?
						<PuppetEditor
							onClose={this.closeEditor}
						/> :
						null
				}
				{ this.state.gifPreviewBlob ?
					<GifPreview
						gifBlob={this.state.gifPreviewBlob}
						closeGifPreview={this.closeGifPreview}
						openLoader={this.openLoader}
						closeLoader={this.closeLoader}
					/> : null
				}
				<Loader
					isVisible={this.state.loaderIsVisible}
					message={this.state.loaderMessage}
				/>
				<Toast />
			</div>
		);
	}
}
export default Stage;
