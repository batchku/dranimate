import React, { FC, useRef, useState } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { LabelButton } from 'components/primitives/button-mui/button';

import ProjectProperties from './project-properties/project-properties';
import RenameProjectDialog from './project-rename-dialog/project-rename-dialog';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectProjectName } from 'redux-util/reducers/project';
import { selectProjectPropertiesOpen, setProjectPropertiesOpen } from 'redux-util/reducers/ui';

import './project-info.scss';

const ProjectInfo: FC<{}> = () => {
	const dispatch = useAppDispatch();

	const projectName = useAppSelector(selectProjectName);
	const projectPropertiesOpen = useAppSelector(selectProjectPropertiesOpen);

	const [menuOpen, setMenuOpen] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);

	const projectNameButtonRef = useRef<HTMLButtonElement>();

	const onMenuOpen = (): void => {
		setMenuOpen(true);
	}

	const onMenuClose = (): void => {
		setMenuOpen(false);
	}

	const onOpenProperties = (): void => {
		dispatch(setProjectPropertiesOpen(true));
		setMenuOpen(false);
	}

	const onCloseProperties = (): void => {
		dispatch(setProjectPropertiesOpen(false));
	}

	const onOpenRenameDialog = (): void => {
		setRenameDialogOpen(true);
		setMenuOpen(false);
	}

	const onCloseRenameDialog = (): void => {
		setRenameDialogOpen(false);
	}

	return (
		<div className='project-info-container'>
			<LabelButton
				ref={projectNameButtonRef}
				onClick={onMenuOpen}
				endIcon={<ArrowDropDownIcon />}
			>
				{projectName}
			</LabelButton>
			<Menu
				anchorEl={projectNameButtonRef.current}
				open={menuOpen}
				onClose={onMenuClose}
				getContentAnchorEl={null}
				anchorOrigin={{
					horizontal: 'right',
					vertical: 'bottom'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<MenuItem onClick={onOpenProperties}>Properties</MenuItem>
				<MenuItem onClick={onOpenRenameDialog}>Rename</MenuItem>
			</Menu>
			{projectPropertiesOpen &&
			<ProjectProperties open={projectPropertiesOpen} onClose={onCloseProperties} />}
			<RenameProjectDialog open={renameDialogOpen} onClose={onCloseRenameDialog} />
		</div>
	);
}
export default ProjectInfo;
