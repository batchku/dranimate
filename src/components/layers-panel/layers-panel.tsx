import React, { useRef, useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import AddIcon from '@material-ui/icons/Add';

import PuppetList from './puppet-list/puppet-list';

import eventManager from '../../services/eventManager/event-manager';

import dranimate from 'services/dranimate/dranimate';

import { useAppDispatch } from '../../redux/hooks';
import { addLiveVideo, addPuppet } from '../../redux/reducers/puppets';

import Puppet from 'services/puppet/puppet';

import './layers-panel.scss';

const LayersPanel = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const addPuppetButtonRef = useRef<HTMLButtonElement>(null);

	const [addPuppetMenuOpen, setAddPuppetMenuOpen] = useState(false);

	// Callback workaround - replace with redux state once UI for puppet editor is updated
	const puppetAddedCallback = (puppet: Puppet): void => {
		dispatch(addPuppet(puppet));
	}

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

		// Callback workaround - replace with redux state once UI for puppet editor is updated
		if (dranimate.puppetAddedCallbacks.length === 0) {
			dranimate.puppetAddedCallbacks.push(puppetAddedCallback);
		}

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
