import React from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import './inspect-panel.scss';
import LiveVideoInspect from './live-video-inspect/live-video-inspect';

import { useAppSelector } from '../../redux/hooks';
import { selectActivePuppet } from '../../redux/reducers/puppets';

const InspectPanel = (): JSX.Element => {
	const activePuppet = useAppSelector(selectActivePuppet);

	if (!activePuppet) {
		return null;
	}

	return (
		<Paper square className='inspect-panel-container'>
			<LiveVideoInspect />
		</Paper>
	);
}
export default InspectPanel;
