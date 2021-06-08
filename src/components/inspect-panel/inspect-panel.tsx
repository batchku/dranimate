import React, { useState } from 'react';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import FilterIcon from 'icons/filter-icon';
import CloseIcon from 'icons/close-icon';

import LiveVideoInspect from './live-video-inspect/live-video-inspect';
import PuppetInspect from './puppet-inspect/puppet-inspect';

import { useAppSelector } from '../../redux/hooks';
import { selectActivePuppet } from '../../redux/reducers/puppets';

import './inspect-panel.scss';

const InspectPanel = (): JSX.Element => {
	const activePuppet = useAppSelector(selectActivePuppet);

	const [open, setOpen] = useState(false);

	const onSetOpen = (): void => {
		setOpen(true);
	}

	const onSetClosed = (): void => {
		setOpen(false);
	}

	return (
		<Paper square className='inspect-panel-container' style={{
			transform: open || activePuppet ? 'translateX(0px)' : 'translateX(100%)'
		}}>
			{!open && !activePuppet &&
			<div className='toggle-panel-container'>
				<IconButton onClick={onSetOpen}>
					<FilterIcon fill='#FFFFFF' opacity='0.9' />
				</IconButton>
			</div>}
			{!activePuppet &&
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
			{activePuppet?.type === 'puppet' && <PuppetInspect />}
			{activePuppet?.type === 'livedraw-puppet' && <LiveVideoInspect />}
		</Paper>
	);
}
export default InspectPanel;
