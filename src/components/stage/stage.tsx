import React from 'react';

import Button from 'components/primitives/button';
import Fab from 'components/primitives/fab';
import Loader from 'components/loader';
import GifPreview from 'components/GifPreview';
import TopBar from 'components/topbar';
import ParamControl from 'components/paramControl';
import Recorder from 'components/recorder';
import HandTrackingToolbar from 'components/handTrackingToolbar';
import LowPassFilterToolbar from 'components/lowPassFilterToolbar';
import PuppetRecorderToolbar from 'components/puppet-recorder';
import ZoomPanner from 'components/zoomPanner';
import PuppetEditor from 'components/puppetEditor';
import Profile from 'components/Profile';
import Slider from 'components/primitives/slider';
import Toast from 'components/primitives/toast';

import { loadDranimateFile, loadImageFile } from 'services/util/file';
import puppetEditorStateService from 'services/imagetomesh/PuppetEditorStateService';
import dranimate from 'services/dranimate/dranimate';

import './styles.scss';

enum FILE_PICKER_STATE {
	DRANIMATE = 'DRANIMATE',
	BACKGROUND = 'BACKGROUND'
};

interface IStageState {
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

class Stage extends React.Component<{}, IStageState> {
	private filePickerState: FILE_PICKER_STATE = FILE_PICKER_STATE.DRANIMATE;
	private dranimateStageContainer: HTMLDivElement;
	private filePicker: HTMLInputElement;
	private colorPicker: HTMLInputElement;

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

	componentDidMount = () => {
		dranimate.setup(this.dranimateStageContainer, 'dranimateCanvasBackground');
	};

	onMouseDown = event => {
		dranimate.onMouseDown(event);
		const selectedPuppet = dranimate.getSelectedPuppet();
		this.setState({ selectedPuppet });
	};

	closeEditor = () => {
		this.setState({ editorIsOpen: false });
		dranimate.startRenderLoop();
	};

	closeProfile = () => {
		this.setState({ profileIsOpen: false });
		dranimate.startRenderLoop();
	};

	openController = controllerIsOpen => {
		this.setState({ controllerIsOpen });
		controllerIsOpen ? dranimate.stopRenderLoop() : dranimate.startRenderLoop();
	};

	onFabClick = () => {
		this.filePickerState = FILE_PICKER_STATE.DRANIMATE;
		this.filePicker.click();
	};

	onZoomSelect = isZoomIn => isZoomIn ? dranimate.zoomIn() : dranimate.zoomOut();

	onPanSelect = isPanSelected => dranimate.setPanEnabled(isPanSelected);

	onDeleteSelectedPuppet = () => {
		dranimate.deleteSelectedPuppet();
		if (!dranimate.hasPuppet()) {
			dranimate.stopRenderLoop();
		}
		this.setState({ selectedPuppet: null });
	};

	onEditSelectedPuppet = () => {
		console.log('setItem?', dranimate.getSelectedPuppet())
		puppetEditorStateService.setItem(dranimate.getSelectedPuppet());
		this.setState({ editorIsOpen: true });
		dranimate.stopRenderLoop();
	};

	openLoader = message => {
		this.setState({
			loaderIsVisible: true,
			loaderMessage: message
		});
		dranimate.stopRenderLoop();
	};

	closeLoader = () => {
		this.setState({
			loaderIsVisible: false,
			loaderMessage: ''
		});
		dranimate.startRenderLoop();
	};

	gifPreviewAvailable = gifPreviewBlob => {
		this.setState({ gifPreviewBlob });
		dranimate.stopRenderLoop();
	};

	closeGifPreview = () => {
		this.setState({ gifPreviewBlob: null });
		dranimate.startRenderLoop();
	};

	onFileChange = event => {
		if (this.filePickerState === FILE_PICKER_STATE.DRANIMATE) {
			this.loadDranimateFile();
			return;
		}
		if (this.filePickerState === FILE_PICKER_STATE.BACKGROUND) {
			this.loadBackgroundFile();
			return;
		}
		console.log('error: no file picker state');
	}

	loadDranimateFile = () => {
		loadDranimateFile(this.filePicker)
			.then((result) => {
				const isPuppet = !!result.id;
				if (isPuppet) {
					dranimate.addPuppet(result);
					dranimate.startRenderLoop();
				}
				else {
					puppetEditorStateService.setItem(result);
					this.setState({ editorIsOpen: true });
				}
			})
			.catch(error => console.log('error', error)); // TODO: show error modal
	};

	loadBackgroundFile = () => {
		loadImageFile(this.filePicker)
			.then(imageDataUrl => {
				dranimate.setBackgroundImage(imageDataUrl);
				this.setState({ hasBackgroundImage: true });
			})
			.catch(error => console.log('error', error)); // TODO: show error modal
	};

	onBackgroundImage = event => {
		this.filePickerState = FILE_PICKER_STATE.BACKGROUND;
		this.filePicker.click();
	};

	onBackgroundColorChange = event => {
		const backgroundColor = event.target.value;
		dranimate.setBackgroundColor(backgroundColor);
		this.setState({ backgroundColor });
	};

	clearBackground = () => {
		dranimate.clearBackground();
		this.setState({ hasBackgroundImage: false });
	};

	onBackgroundImageSizeChange = value => {
		const normalizedValue = value / 100;
		dranimate.setBackgroundImageSize(normalizedValue);
	};

	onProfileClick = () => {
		this.setState({ profileIsOpen: true });
		dranimate.stopRenderLoop();
	};

	render() {
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
					ref={input => this.dranimateStageContainer = input}
				/>
				<TopBar className='topBar'/>
				<Button
					className={'profileButton'}
					onClick={this.onProfileClick}
				>
					Profile
				</Button>
				<div className={'backgroundButtons'}>
					<Button onClick={this.onBackgroundImage}>
						Background Image
					</Button>
					{
						this.state.hasBackgroundImage ?
							<Slider
								min={ 0 }
								max={ 500 }
								defaultValue={ 100 }
								onChange={ this.onBackgroundImageSizeChange }
								className='backgroundSlider'
							/> : null
					}
					<Button onClick={() => this.colorPicker.click()}>
						Background Color
					</Button>
					<Button onClick={this.clearBackground}>
						Clear background
					</Button>
				</div>
				{
					this.state.selectedPuppet ?
					<ParamControl
						className='paramControl'
						selectedPuppet={this.state.selectedPuppet}
						onEditSelectedPuppet={this.onEditSelectedPuppet}
						onDeleteSelectedPuppet={this.onDeleteSelectedPuppet}
						openLoader={this.openLoader}
						closeLoader={this.closeLoader}
					/> : null
				}
				<div className='lowerLeft'>
					<ZoomPanner
						onPanSelect={this.onPanSelect}
						onZoomSelect={this.onZoomSelect}
						zoomEnabled={!this.state.editorIsOpen}
					/>
					<Recorder
						openLoader={this.openLoader}
						closeLoader={this.closeLoader}
						gifPreviewAvailable={this.gifPreviewAvailable}
					/>
					<PuppetRecorderToolbar/>
					<HandTrackingToolbar/>
					<LowPassFilterToolbar/>
				</div>
				<Fab
					className='fab'
					onClick={this.onFabClick}
				/>
				<input
					type='file'
					ref={input => this.filePicker = input}
					value=''
					onChange={this.onFileChange}
					className='hiddenFilePicker'
				/>
				<input
					type='color'
					ref={element => this.colorPicker = element}
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
				{ this.state.profileIsOpen ?
					<Profile
						onClose={this.closeProfile}
						openLoader={this.openLoader}
						closeLoader={this.closeLoader}
					/> : null
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
