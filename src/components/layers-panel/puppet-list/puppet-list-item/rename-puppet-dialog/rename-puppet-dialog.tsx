import React, { FC, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

import { ColorButton } from 'components/primitives/button-mui/button';

import { PuppetData, setName } from 'redux-util/reducers/puppets';
import { useAppDispatch } from 'redux-util/hooks';

interface RenamePuppetDialogProps {
	open: boolean;
	puppet: PuppetData;
	onClose: () => void;
}

const RenamePuppetDialog: FC<RenamePuppetDialogProps> = (props) => {
	const dispatch = useAppDispatch();

	const [localName, setLocalName] = useState(props.puppet.name);

	const onRename = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setLocalName(event.target.value)
	}

	const onSave = (): void => {
		dispatch(setName({
			name: localName,
			puppetId: props.puppet.id
		}));
		props.onClose();
	}

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>
				Rename layer
			</DialogTitle>
			<DialogContent>
				<TextField
					fullWidth
					label='Name'
					helperText='Enter a short name'
					variant='outlined'
					onChange={onRename}
					value={localName}
				/>
			</DialogContent>
			<DialogActions>
			<ColorButton onClick={onSave}>
				Save
			</ColorButton>
			</DialogActions>
		</Dialog>
	)
}
export default RenamePuppetDialog;
