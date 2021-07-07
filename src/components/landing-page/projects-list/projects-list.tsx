import React, { FC } from 'react';

import { Typography } from '@material-ui/core';

import { LabelButton } from 'components/primitives/button-mui/button';
import ProjectListItem from './project-list-item/project-list-item';

import './projects-list.scss';

const ProjectsList: FC<{}> = (): JSX.Element => {
	return (
		<div className='projects-list-container'>
			<div className='project-list-header'>
				<Typography variant='h6'>
					My projects (N)
				</Typography>
				<LabelButton>
					New project
				</LabelButton>
			</div>
			<ProjectListItem />
			<ProjectListItem />
		</div>
	);
}
export default ProjectsList;
