import React, { FC, useEffect, useRef, useState } from 'react';

import { withStyles } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';

import dranimate from 'services/dranimate/dranimate';

import { useAppDispatch, useAppSelector } from '../../../redux-util/hooks';
import { selectActivePuppet, setHasRecording, setPlaying } from '../../../redux-util/reducers/puppets';

import showToastEvent from 'services/eventManager/show-toast-event';

import StopIcon from 'icons/stop-icon';
import PlayIcon from 'icons/play-icon';
import PauseIcon from 'icons/pause-icon';
import DeleteIcon from 'icons/delete-icon';
import CloseIcon from 'icons/close-icon';

import './puppet-inspect.scss';

const ColorButton = withStyles(() => ({
	root: {
		color: '#ededed',
		backgroundColor: '#474747',
		'&:hover': {
			backgroundColor: '#5c5c5c',
			boxShadow: 'none'
		},
		borderRadius: '16px',
		boxShadow: 'none',
	},
}))(Button);

interface PuppetInspectProps {
	onClose: () => void;
}

const PuppetInspect: FC<PuppetInspectProps> = (props): JSX.Element => {
	const dispatch = useAppDispatch();

	const activePuppet = useAppSelector(selectActivePuppet);

	const [recordStep, setRecordStep] = useState(0);
	const [handTrackingMenuOpen, setHandTrackingMenuOpen] = useState(false);
	const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);

	const recordIntervalHandle = useRef<number>();
	const handTrackingButtonRef = useRef<HTMLButtonElement>();

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
				dispatch(setHasRecording({
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
		dispatch(setHasRecording({
			puppetId: activePuppet.id,
			hasRecording: false
		}));

		// Stop playing previous recording
		dispatch(setPlaying({
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

	const togglePlayRecording = (): void => {
		dispatch(setPlaying({
			puppetId: activePuppet.id,
			playing: !activePuppet.playing
		}));
	}

	const onDeleteAnimation = (): void => {
		// Empty
	}

	const onHandTrackingChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setHandTrackingEnabled(event.target.checked);

		dranimate.setHandTrackingEnabled(event.target.checked);
	}

	const onToggleHandTrackingMenu = (): void => {
		setHandTrackingMenuOpen(!handTrackingMenuOpen);
	}

	const onSetClosed = (): void => {
		props.onClose();
	}

	return (
		<>
			<div className='inspect-panel-header'>
				<Typography>
					Setup
				</Typography>
				<IconButton onClick={onSetClosed} size='small'>
					<CloseIcon fill='#ffffff' opacity='0.9' />
				</IconButton>
			</div>
			<div className='inspect-row'>
				<ColorButton variant='contained' fullWidth>
					Edit mask
				</ColorButton>
			</div>
			<div className='inspect-row'>
				<ColorButton variant='contained' fullWidth>
					Edit control points
				</ColorButton>
			</div>

			<Box m={2} />

			<Divider variant='fullWidth' orientation='horizontal' />

			<div className='inspect-panel-header'>
				<Typography>
					Animation
				</Typography>
			</div>

			<div className='inspect-row'>
				<ColorButton variant='contained' fullWidth ref={handTrackingButtonRef} onClick={onToggleHandTrackingMenu}>
					Hand tracking
				</ColorButton>
			</div>
			<Popper className='hand-tracking-menu' open={handTrackingMenuOpen} anchorEl={handTrackingButtonRef.current} placement='bottom-end'>
				<Paper>
					<div className='inspect-panel-header'>
						<Typography>
							Hand tracking
						</Typography>
					</div>
					<Box m={1} />
					<div className='inspect-row'>
						<Typography>
							Animate your puppet with your hands using a camera
						</Typography>
						<Switch
							checked={handTrackingEnabled}
							onChange={onHandTrackingChange}
							name="hand-tracking"
						/>
					</div>
					<Box m={1} />
				</Paper>
			</Popper>

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
				<IconButton onClick={onDeleteAnimation} disabled={!activePuppet.hasRecording}>
					<DeleteIcon fill='#c6c6c6' opacity={activePuppet.hasRecording ? '1' : '0.4'} />
				</IconButton>
			</div>
		</>
	)
}
export default PuppetInspect;
