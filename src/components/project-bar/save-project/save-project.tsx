import React, { FC } from 'react';

import { ColorButton } from 'components/primitives/button-mui/button';

import apiService from 'services/api/apiService';

import { useAppSelector } from 'redux-util/hooks';
import { selectProject } from 'redux-util/reducers/project';
import { selectPuppets } from 'redux-util/reducers/puppets';

const SaveProject: FC<{}> = (): JSX.Element => {
	const project = useAppSelector(selectProject);
	const puppets = useAppSelector(selectPuppets);

	const onSave = (): void => {
		apiService.saveProject(project, puppets);
	}

	return (
		<ColorButton onClick={onSave}>
			Save Project
		</ColorButton>
	)
}
export default SaveProject;
