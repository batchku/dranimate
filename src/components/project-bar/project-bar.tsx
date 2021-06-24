import React, { FC } from 'react';

import Paper from '@material-ui/core/Paper';

import CreateGif from './create-gif/create-gif';
import ProjectInfo from './project-info/project-info';

import './project-bar.scss';

const ProjectBar: FC<{}> = () => {
	return (
		<Paper square className='project-bar-container'>
			<ProjectInfo />
			<CreateGif />
		</Paper>
	);
}
export default ProjectBar;
