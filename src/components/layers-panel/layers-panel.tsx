import React, { useRef, useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

import AddIcon from '@material-ui/icons/Add';

import PuppetList from './puppet-list/puppet-list';

import eventManager from '../../services/eventManager/event-manager';

import dranimate from 'services/dranimate/dranimate';

import { useAppDispatch } from '../../redux/hooks';
import { addLiveVideo, addPuppet } from '../../redux/reducers/puppets';

import Puppet from 'services/puppet/puppet';

import LayersIcon from 'icons/layers-icon';
import CloseIcon from 'icons/close-icon';

import './layers-panel.scss';

const LayersPanel = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const addPuppetButtonRef = useRef<HTMLButtonElement>(null);

	const [addPuppetMenuOpen, setAddPuppetMenuOpen] = useState(false);
	const [open, setOpen] = useState(true);

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

	const onSetOpen = (): void => {
		setOpen(true);
	}

	const onSetClosed = (): void => {
		setOpen(false);
	}

	return (
		<Paper square className='layers-panel-container' style={{
			transform: open ? 'translateX(0px)' : 'translateX(-100%)'
		}}>
			{!open &&
			<div className='toggle-layers-panel-container'>
				<IconButton onClick={onSetOpen}>
					<LayersIcon fill='#FFFFFF' opacity='0.9' />
				</IconButton>
			</div>}
			<div className='layers-panel-header'>
				<Typography>
					Layers
				</Typography>
				<div className='header-actions-container'>
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
					<Box m={0.5} />
					<Divider orientation='vertical' flexItem/>
					<Box m={0.5} />
					<IconButton onClick={onSetClosed} size='small'>
						<CloseIcon fill='#ffffff' opacity='0.9' />
					</IconButton>
				</div>
			</div>
			<PuppetList />
		</Paper>
	);
}
export default LayersPanel;
