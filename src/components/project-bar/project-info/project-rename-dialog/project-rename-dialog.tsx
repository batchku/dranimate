import React, { FC, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

import { ColorButton } from 'components/primitives/button-mui/button';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectProjectName, setName } from 'redux-util/reducers/project';

interface RenameProjectDialogProps {
	open: boolean;
	onClose: () => void;
}

const RenameProjectDialog: FC<RenameProjectDialogProps> = (props) => {
	const dispatch = useAppDispatch();

	const projectName = useAppSelector(selectProjectName);

	const [localName, setLocalName] = useState(projectName);

	const onNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setLocalName(event.target.value)
	}

	const onRename = (): void => {
		dispatch(setName(localName));
		props.onClose();
	}

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>
				Rename project
			</DialogTitle>
			<DialogContent>
				<TextField
					fullWidth
					label='Project name'
					helperText='Enter a short name'
					variant='outlined'
					onChange={onNameChange}
					value={localName}
				/>
			</DialogContent>
			<DialogActions>
				<ColorButton onClick={onRename}>
					Rename
				</ColorButton>
			</DialogActions>
		</Dialog>
	)
}
export default RenameProjectDialog;
