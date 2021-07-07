import React, { FC } from 'react';

import { IconButton, Typography } from '@material-ui/core';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import './project-list-item.scss';

const ProjectListItem: FC<{}> = (): JSX.Element => {
	return (
		<div className='project-list-item-container'>
			<div className='project-content-container'>
				<img src='./assets/Paused 1.svg'/>
				<div className='project-info'>
					<Typography variant='body1'>
						Untitled project
					</Typography>
					<Typography variant='body2'>
						20 layers
					</Typography>
				</div>
			</div>
			<IconButton>
				<MoreHorizIcon />
			</IconButton>
		</div>
	);
}
export default ProjectListItem;
