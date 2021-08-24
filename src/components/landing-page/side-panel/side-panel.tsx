import React, { FC, useState } from 'react';

import { Divider, List, ListItem, ListItemText } from '@material-ui/core';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectActiveLandingPageScreen, setLandingPageActiveScreen } from 'redux-util/reducers/ui';

import './side-panel.scss';

const SidePanel: FC<{}> = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const activeScreen = useAppSelector(selectActiveLandingPageScreen);

	const onOpenProjects = (): void => {
		dispatch(setLandingPageActiveScreen('projects'))
	}

	const onOpenPuppets = (): void => {
		dispatch(setLandingPageActiveScreen('puppets'));
	}

	const onOpenAbout = (): void => {
		// TODO
	}

	const onOpenHelp = (): void => {
		// TODO
	}

	const onOpenKeyboardShortcuts = (): void => {
		// TODO
	}

	return (
		<div className='side-panel-container'>
			<List>
				<ListItem
					button
					selected={activeScreen === 'projects'}
					onClick={onOpenProjects}
				>
					<ListItemText primary="Projects" />
				</ListItem>
				<ListItem
					button
					selected={activeScreen === 'puppets'}
					onClick={onOpenPuppets}
				>
					<ListItemText primary="Puppets" />
				</ListItem>
			</List>
			<Divider />
			<List>
				<ListItem
					button
					selected={false}
					onClick={onOpenAbout}
				>
					<ListItemText primary="About" />
				</ListItem>
				<ListItem
					button
					selected={false}
					onClick={onOpenHelp}
				>
					<ListItemText primary="Help" />
				</ListItem>
				<ListItem
					button
					selected={false}
					onClick={onOpenKeyboardShortcuts}
				>
					<ListItemText primary="Keyboard Shortcuts" />
				</ListItem>
			</List>
		</div>
	);
}
export default SidePanel;
