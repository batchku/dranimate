import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { IconButton, Typography } from '@material-ui/core';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import { useAppDispatch } from 'redux-util/hooks';
import { ProjectData, setProject } from 'redux-util/reducers/project';

import './project-list-item.scss';

interface ProjectListItemProps {
	project: ProjectData;
}

const ProjectListItem: FC<ProjectListItemProps> = (props): JSX.Element => {
	const dispatch = useAppDispatch();
	
	const history = useHistory();

	const openProject = (): void => {
		dispatch(setProject(props.project));

		history.push('/editor');
	}

	return (
		<div className='project-list-item-container'>
			<div className='project-content-container' onClick={openProject}>
				<img src='./assets/Paused 1.svg'/>
				<div className='project-info'>
					<Typography variant='body1'>
						{props.project.name}
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
