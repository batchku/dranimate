import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { Paper, Box, IconButton } from '@material-ui/core';

import { ArrowBack } from '@material-ui/icons';

import CreateGif from './create-gif/create-gif';
import ZoomLabel from './zoom-label/zoom-label';
import ProjectInfo from './project-info/project-info';
import SaveProject from './save-project/save-project';

import './project-bar.scss';

const ProjectBar: FC<{}> = () => {
	const history = useHistory();
	
	const goBackToLanding = (): void => {
		history.push('/');
	}

	return (
		<Paper square className='project-bar-container'>
			<div className='back-button-container'>
				<IconButton className='back-button' onClick={goBackToLanding}>
					<ArrowBack />
				</IconButton>
			</div>
			<ProjectInfo />
			<SaveProject />
			<Box m={1} />
			<CreateGif />
			<Box m={1} />
			<ZoomLabel />
		</Paper>
	);
}
export default ProjectBar;
