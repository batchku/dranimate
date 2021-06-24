import React, { FC, useRef, useState } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { LabelButton } from 'components/primitives/button-mui/button';

import ProjectProperties from './project-properties/project-properties';

import { useAppSelector } from 'redux-util/hooks';
import { selectProjectName } from 'redux-util/reducers/project';

import './project-info.scss';

const ProjectInfo: FC<{}> = () => {
	const projectName = useAppSelector(selectProjectName);

	const [menuOpen, setMenuOpen] = useState(false);
	const [propertiesOpen, setPropertiesOpen] = useState(false);

	const projectNameButtonRef = useRef<HTMLButtonElement>();

	const onMenuOpen = (): void => {
		setMenuOpen(true);
	}

	const onMenuClose = (): void => {
		setMenuOpen(false);
	}

	const onOpenProperties = (): void => {
		setPropertiesOpen(true);
		setMenuOpen(false);
	}

	const onCloseProperties = (): void => {
		setPropertiesOpen(false);
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
			</Menu>
			{propertiesOpen &&
			<ProjectProperties open={propertiesOpen} onClose={onCloseProperties} />}
		</div>
	);
}
export default ProjectInfo;
