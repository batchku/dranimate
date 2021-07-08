import React, { FC } from 'react';

import { ColorButton } from 'components/primitives/button-mui/button';

import apiService from 'services/api/apiService';

import { useAppSelector } from 'redux-util/hooks';
import { selectProject } from 'redux-util/reducers/project';
import { selectPuppets } from 'redux-util/reducers/puppets';

import showToastEvent from 'services/eventManager/show-toast-event';

const SaveProject: FC<{}> = (): JSX.Element => {
	const project = useAppSelector(selectProject);
	const puppets = useAppSelector(selectPuppets);

	const onSave = async (): Promise<void> => {
		await apiService.saveProject(project, puppets);

		showToastEvent.emit({
			text: 'Successfully saved',
			duration: 4,
		});
	}

	return (
		<ColorButton onClick={onSave}>
			Save Project
		</ColorButton>
	)
}
export default SaveProject;
