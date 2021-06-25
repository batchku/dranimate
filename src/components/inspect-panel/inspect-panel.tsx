import React, { useState } from 'react';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import FilterIcon from 'icons/filter-icon';
import CloseIcon from 'icons/close-icon';

import LiveVideoInspect from './live-video-inspect/live-video-inspect';
import PuppetInspect from './puppet-inspect/puppet-inspect';

import { useAppDispatch, useAppSelector } from '../../redux-util/hooks';
import { selectActivePuppet } from '../../redux-util/reducers/puppets';
import { selectInspectPanelOpen, setInspectPanelOpen } from 'redux-util/reducers/ui';

import './inspect-panel.scss';

const InspectPanel = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const activePuppet = useAppSelector(selectActivePuppet);
	const open = useAppSelector(selectInspectPanelOpen);

	const onSetOpen = (): void => {
		dispatch(setInspectPanelOpen(true));
	}

	const onSetClosed = (): void => {
		dispatch(setInspectPanelOpen(false));
	}

	return (
		<Paper square className='inspect-panel-container' style={{
			transform: open ? 'translateX(0px)' : 'translateX(100%)'
		}}>
			{!open &&
			<div className='toggle-panel-container'>
				<IconButton onClick={onSetOpen}>
					<FilterIcon fill='#FFFFFF' opacity='0.9' />
				</IconButton>
			</div>}
			<Divider orientation='horizontal'/>
			{open && !activePuppet &&
			<>
				<div className='inspect-panel-header'>
					<Typography>
						Inspector
					</Typography>
					<IconButton size='small' onClick={onSetClosed}>
						<CloseIcon fill='#fff' opacity='0.9' />
					</IconButton>
				</div>
				<div className='inspect-row'>
					<Typography variant='body2'>
						Select a layer to change its properties or record animation
					</Typography>
				</div>
			</>}
			{activePuppet?.type === 'puppet' && open && <PuppetInspect onClose={onSetClosed} />}
			{activePuppet?.type === 'livedraw-puppet' && open && <LiveVideoInspect onClose={onSetClosed} />}
		</Paper>
	);
}
export default InspectPanel;
