import React, { FC, useRef, useState } from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/ListItemAvatar';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import PersonIcon from '@material-ui/icons/Person';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import HiddenIcon from 'icons/hidden-icon';

import { PuppetData, setSelected, deletePuppet, setVisible } from '../../../../redux-util/reducers/puppets';
import { useAppDispatch } from '../../../../redux-util/hooks';

import RenamePuppetDialog from './rename-puppet-dialog/rename-puppet-dialog';

interface PuppetListItemProps {
	puppet: PuppetData;
}

const PuppetListItem: FC<PuppetListItemProps> = ({puppet}) => {
	const dispatch = useAppDispatch();

	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const [menuOpen, setMenuOpen] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);

	const onHidePuppet = (): void => {
		dispatch(setVisible({
			puppetId: puppet.id,
			visible: !puppet.visible
		}));
	}

	const onSelectPuppet = (): void => {
		dispatch(setSelected({
			puppetId: puppet.id,
			selected: true,
		}));
	}

	const onMenuOpen = (event: React.MouseEvent): void => {
		event.stopPropagation();

		setMenuOpen(true);
	}

	const onMenuClose = (): void => {
		setMenuOpen(false);
	}

	const onDeletePuppet = (): void => {
		dispatch(deletePuppet(puppet.id));

		onMenuClose();
	}

	const onOpenRenameDialog = (): void => {
		setRenameDialogOpen(true);
	}

	const onCloseRenameDialog = (): void => {
		setRenameDialogOpen(false);
	}

	return (
		<ListItem button selected={puppet.selected} onClick={onSelectPuppet}>
			<ListItemAvatar>
				<Avatar>
					<PersonIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary={puppet.name}
				disableTypography
				className='puppet-list-item-text'
			/>
			<Menu
				anchorEl={menuButtonRef.current}
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
				<MenuItem onClick={onOpenRenameDialog}>Rename</MenuItem>
				<MenuItem onClick={onDeletePuppet}>Delete</MenuItem>
			</Menu>
			{puppet.selected &&
			<ListItemSecondaryAction>
				<IconButton edge="end" onClick={onHidePuppet}>
					{puppet.visible && <VisibilityOutlinedIcon />}
					{!puppet.visible && <HiddenIcon fill='#c6c6c6' opacity='0.4' />}
				</IconButton>
				<IconButton edge="end" onClick={onMenuOpen} ref={menuButtonRef}>
					<MoreHorizIcon />
				</IconButton>
			</ListItemSecondaryAction>}
			{!puppet.selected && !puppet.visible &&
			<ListItemSecondaryAction>
				<IconButton edge="end" onClick={onHidePuppet}>
					<HiddenIcon fill='#c6c6c6' opacity='0.4' />
				</IconButton>
				<IconButton edge="end" disabled={true}>
					<HiddenIcon fill='#fff' opacity='0' />
				</IconButton>
			</ListItemSecondaryAction>}
			<RenamePuppetDialog open={renameDialogOpen} onClose={onCloseRenameDialog} puppet={puppet} />
		</ListItem>
	)
}
export default PuppetListItem;
