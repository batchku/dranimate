import React, { FC } from 'react';

import { Paper, Box } from '@material-ui/core';

import CreateGif from './create-gif/create-gif';
import ZoomLabel from './zoom-label/zoom-label';
import ProjectInfo from './project-info/project-info';

import './project-bar.scss';

const ProjectBar: FC<{}> = () => {
	return (
		<Paper square className='project-bar-container'>
			<ProjectInfo />
			<CreateGif />
			<Box m={1} />
			<ZoomLabel />
		</Paper>
	);
}
export default ProjectBar;
