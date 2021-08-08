import React, { FC, useEffect, useState, useRef } from 'react';
import { v1 as uuid } from 'uuid';
import { useHistory } from 'react-router';

import { Typography, List } from '@material-ui/core';

import { LabelButton } from 'components/primitives/button-mui/button';
import ProjectListItem from './project-list-item/project-list-item';

import apiService from 'services/api/apiService';
import userService from 'services/api/userService';

import userSignedInEvent, { UserSignedInEventData } from 'services/eventManager/user-signed-in-event';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { ProjectData } from 'redux-util/reducers/project';
import { selectUserSignedIn, setUserSignedIn } from 'redux-util/reducers/ui';

import './projects-list.scss';

const ProjectsList: FC<{}> = (): JSX.Element => {
	const history = useHistory();

	const dispatch = useAppDispatch();

	const userSignedIn = useAppSelector(selectUserSignedIn);

	const onUserSignedInEventId = useRef(uuid());

	const [projects, setProjects] = useState<ProjectData[]>([]);

	const onNewProject = (): void => {
		history.push('/editor');
	}

	const loadProjects = async (): Promise<void> => {
		if (!userService.getUser()) {
			return;
		}

		const projects = await apiService.getAllProjectsForUser();
		setProjects(projects);
	}

	const onUserSignedIn = (data: UserSignedInEventData): void => {
		if (!data.user) {
			dispatch(setUserSignedIn(false));
			return;
		}
		dispatch(setUserSignedIn(true));

		loadProjects();
	}

	useEffect(() => {
		userSignedInEvent.subscribe({
			callback: onUserSignedIn,
			id: onUserSignedInEventId.current,
		});

		return (): void => {
			userSignedInEvent.unsubscribe(onUserSignedInEventId.current);
		}
	});

	useEffect(() => {
		loadProjects();
	}, []);

	return (
		<div className='projects-list-container'>
			{userSignedIn &&
			<>
				<div className='project-list-header'>
					<Typography variant='h6'>
						My projects ({projects.length})
					</Typography>
					<LabelButton onClick={onNewProject}>
						New project
					</LabelButton>
				</div>
				<List style={{
					width: '100%'
				}}>
					{projects.map((project) => {
						return (
							<ProjectListItem key={project.id} project={project} />
						);
					})}
				</List>
			</>}
			{!userSignedIn &&
			<Typography variant='body1'>
				Please sign in to view your projects
			</Typography>}
		</div>
	);
}
export default ProjectsList;
