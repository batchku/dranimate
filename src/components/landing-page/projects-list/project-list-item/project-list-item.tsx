import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';

import { MoreHoriz } from '@material-ui/icons';

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
		<ListItem button onClick={openProject}>
			<ListItemAvatar>
				<Avatar>
					<img src='./assets/Paused 1.svg'/>
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={props.project.name} />
			<ListItemSecondaryAction>
				<IconButton edge="end" aria-label="more">
					<MoreHoriz />
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
	);
}
export default ProjectListItem;
