import React, { useRef, useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import AddIcon from '@material-ui/icons/Add';

import PuppetList from './puppet-list/puppet-list';

import eventManager from '../../services/eventManager/event-manager';

import { useAppDispatch } from '../../redux/hooks';
import { addLiveVideo } from '../../redux/reducers/puppets';

import './layers-panel.scss';

const LayersPanel = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const addPuppetButtonRef = useRef<HTMLButtonElement>(null);

	const [addPuppetMenuOpen, setAddPuppetMenuOpen] = useState(false);

	const openAddPuppetMenu = (): void => {
		setAddPuppetMenuOpen(true);
	}

	const onCloseAddPuppetMenu = (): void => {
		setAddPuppetMenuOpen(false);
	}

	const onAddPuppet = (): void => {
		eventManager.emit('on-add-puppet', {
			puppetType: 'standard'
		});

		onCloseAddPuppetMenu();
	}

	const onAddLiveVideo = (): void => {
		dispatch(addLiveVideo());
		onCloseAddPuppetMenu();
	}

	return (
		<Paper square className='layers-panel-container'>
			<div className='layers-panel-header'>
				<Typography>
					Layers
				</Typography>
				<IconButton onClick={openAddPuppetMenu} size='small' ref={addPuppetButtonRef}>
					<AddIcon />
				</IconButton>
				<Menu
					id="simple-menu"
					anchorEl={addPuppetButtonRef.current}
					open={addPuppetMenuOpen}
					onClose={onCloseAddPuppetMenu}
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
					<MenuItem onClick={onAddPuppet}>Puppet</MenuItem>
					<MenuItem onClick={onAddLiveVideo}>Live video</MenuItem>
				</Menu>
			</div>
			<PuppetList />
		</Paper>
	);
}
export default LayersPanel;
