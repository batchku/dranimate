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

import { PuppetData, setSelected, deletePuppet } from '../../../../redux/reducers/puppets';
import { useAppDispatch } from '../../../../redux/hooks';

import dranimate from 'services/dranimate/dranimate';

interface PuppetListItemProps {
	puppet: PuppetData;
}

const PuppetListItem: FC<PuppetListItemProps> = ({puppet}) => {
	const dispach = useAppDispatch();

	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const [menuOpen, setMenuOpen] = useState(false);

	const onHidePuppet = (): void => {
		const targetPuppet = dranimate.getPuppetWithId(puppet.id);

		targetPuppet.setVisible(!targetPuppet.group.visible);
	}

	const onSelectPuppet = (): void => {
		dispach(setSelected({
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
		dispach(deletePuppet(puppet.id));

		onMenuClose();
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
				<MenuItem onClick={onDeletePuppet}>Delete</MenuItem>
			</Menu>
			{puppet.selected &&
			<ListItemSecondaryAction>
				<IconButton edge="end" onClick={onHidePuppet}>
					<VisibilityOutlinedIcon />
				</IconButton>
				<IconButton edge="end" onClick={onMenuOpen} ref={menuButtonRef}>
					<MoreHorizIcon />
				</IconButton>
			</ListItemSecondaryAction>}
		</ListItem>
	)
}
export default PuppetListItem;
