import React, { FC, useEffect, useRef, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';

import { selectActivePuppet, setOpacity, setInvert, setSoftness, setThreshold, setHasRecording, setPlaying, setDisableEffects } from '../../../redux-util/reducers/puppets';
import { useAppDispatch, useAppSelector } from '../../../redux-util/hooks';

import dranimate from 'services/dranimate/dranimate';
import showToastEvent from 'services/eventManager/show-toast-event';

import PlayIcon from '../../../icons/play-icon';
import PauseIcon from 'icons/pause-icon';
import DeleteIcon from 'icons/delete-icon';
import StopIcon from 'icons/stop-icon';

import './live-video-inspect.scss';

const LiveVideoInspect: FC<{}> = (): JSX.Element => {
	const dispach = useAppDispatch();

	const activePuppet = useAppSelector(selectActivePuppet);

	const [recordStep, setRecordStep] = useState(0);

	const recordIntervalHandle = useRef<number>();

	const onOpacityChange = (event: React.ChangeEvent, value: number): void => {
		dispach(setOpacity({
			puppetId: activePuppet.id,
			value: value,
		}));
	}

	const onInvertChange = (event: React.ChangeEvent, value: number): void => {
		dispach(setInvert({
			puppetId: activePuppet.id,
			value: value,
		}));
	}

	const onSoftnessChange = (event: React.ChangeEvent, value: number): void => {
		dispach(setSoftness({
			puppetId: activePuppet.id,
			value: value,
		}));
	}

	const onThresholdChange = (event: React.ChangeEvent, value: number): void => {
		dispach(setThreshold({
			puppetId: activePuppet.id,
			value: value,
		}));
	}

	const onEffectsDisabledChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		dispach(setDisableEffects({
			puppetId: activePuppet.id,
			disabled: event.target.checked,
		}));
	}

	const incrementRecordStep = (): void => {
		setRecordStep(recordStep + 1);
	}

	const onRecordPuppetToggle = (): void => {
		if (recordStep > 0) {
			if (recordIntervalHandle.current) {
				window.clearInterval(recordIntervalHandle.current);
			}
			if (recordStep === 4) {
				dranimate.setRecording(false);
				dranimate.getSelectedPuppet().playing = true;
				dispach(setHasRecording({
					puppetId: activePuppet.id,
					hasRecording: true
				}));
				showToastEvent.emit({
					text: 'Animation recording finished. Your puppet will keep playing the recording on loop.',
					duration: 8,
				});
			}
			setRecordStep(0);
			return;
		}

		setRecordStep(recordStep + 1);

		// Delete previous recording
		dispach(setHasRecording({
			puppetId: activePuppet.id,
			hasRecording: false
		}));

		// Stop playing previous recording
		dispach(setPlaying({
			puppetId: activePuppet.id,
			playing: false
		}));
	}

	useEffect(() => {
		if (recordStep < 4 && recordStep > 0) {
			window.setTimeout(incrementRecordStep, 1000);
		}

		if (recordStep === 4) {
			window.clearInterval(recordIntervalHandle.current);
			dranimate.setRecording(true);
			showToastEvent.emit({
				text: 'Animation recording has started.',
				duration: 4,
			});
		}
	}, [recordStep]);

	const onDeletePuppet = (): void => {
		dispach(setHasRecording({
			puppetId: activePuppet.id,
			hasRecording: false
		}));
	}

	const togglePlayRecording = (): void => {
		dispach(setPlaying({
			puppetId: activePuppet.id,
			playing: !activePuppet.playing
		}));
	}

	return (
		<>
			<div className='inspect-panel-header'>
				<Typography>
					Color
				</Typography>
			</div>
			<div className='inspect-row'>
				<Typography variant='body2'>
					Opacity
				</Typography>
				<Slider value={activePuppet.opacity} onChange={onOpacityChange} style={{width: '100px'}} min={0} max={1} step={0.01}/>
			</div>
			<div className='inspect-row'>
				<Typography variant='body2'>
					Invert
				</Typography>
				<Slider value={activePuppet.invert} onChange={onInvertChange} style={{width: '100px'}} min={0} max={1} step={0.01}/>
			</div>
			<div className='inspect-row'>
				<Typography variant='body2'>
					Softness
				</Typography>
				<Slider value={activePuppet.softness} onChange={onSoftnessChange} style={{width: '100px'}} min={0} max={1} step={0.01}/>
			</div>
			<div className='inspect-row'>
				<Typography variant='body2'>
					Threshold
				</Typography>
				<Slider value={activePuppet.threshold} onChange={onThresholdChange} style={{width: '100px'}} min={0} max={1} step={0.01}/>
			</div>
			<div className='inspect-row'>
				<Typography variant='body2'>
					Disable effects
				</Typography>
				<Checkbox
					value={activePuppet.disableEffects}
					onChange={onEffectsDisabledChange}
				/>
			</div>

			<Divider variant='fullWidth' orientation='horizontal' />

			<div className='inspect-panel-header'>
				<Typography>
					Recording
				</Typography>
			</div>

			<div className='live-video-record-actions'>
				<IconButton onClick={onRecordPuppetToggle} style={{minWidth: '48px'}}>
					{recordStep === 0 && <img src='./assets/recorder.svg' />}
					{recordStep === 1 && <img src='./assets/timer-3.svg' />}
					{recordStep === 2 && <img src='./assets/timer-2.svg' />}
					{recordStep === 3 && <img src='./assets/timer-1.svg' />}
					{recordStep === 4 && <StopIcon opacity='1' fill='#FFFFFF' />}
				</IconButton>
				<IconButton onClick={togglePlayRecording} disabled={!activePuppet.hasRecording}>
					{!activePuppet.playing && <PlayIcon fill='#c6c6c6' opacity={activePuppet.hasRecording ? '1' : '0.4'} />}
					{activePuppet.playing && <PauseIcon fill='#c6c6c6' opacity='1' />}
				</IconButton>
				<IconButton onClick={onDeletePuppet} disabled={!activePuppet.hasRecording}>
					<DeleteIcon fill='#c6c6c6' opacity={activePuppet.hasRecording ? '1' : '0.4'} />
				</IconButton>
			</div>
		</>
	)
}
export default LiveVideoInspect;
