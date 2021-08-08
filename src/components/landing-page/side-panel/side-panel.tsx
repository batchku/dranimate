import React, { FC, useState } from 'react';

import { Divider, List, ListItem, ListItemText } from '@material-ui/core';

import { useAppDispatch } from 'redux-util/hooks';
import { setLandingPageActiveScreen } from 'redux-util/reducers/ui';

import './side-panel.scss';

const SidePanel: FC<{}> = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const [selectedIndex, setSelectedIndex] = useState(0);

	const onOpenProjects = (): void => {
		setSelectedIndex(0);
		
		dispatch(setLandingPageActiveScreen('projects'));
	}

	const onOpenPuppets = (): void => {
		setSelectedIndex(1);

		dispatch(setLandingPageActiveScreen('puppets'));
	}

	const onOpenAbout = (): void => {
		setSelectedIndex(2);
	}

	const onOpenHelp = (): void => {
		setSelectedIndex(3);
	}

	const onOpenKeyboardShortcuts = (): void => {
		setSelectedIndex(4);
	}

	return (
		<div className='side-panel-container'>
			<List>
				<ListItem
					button
					selected={selectedIndex === 0}
					onClick={onOpenProjects}
				>
					<ListItemText primary="Projects" />
				</ListItem>
				<ListItem
					button
					selected={selectedIndex === 1}
					onClick={onOpenPuppets}
				>
					<ListItemText primary="Puppets" />
				</ListItem>
			</List>
			<Divider />
			<List>
				<ListItem
					button
					selected={selectedIndex === 2}
					onClick={onOpenAbout}
				>
					<ListItemText primary="About" />
				</ListItem>
				<ListItem
					button
					selected={selectedIndex === 3}
					onClick={onOpenHelp}
				>
					<ListItemText primary="Help" />
				</ListItem>
				<ListItem
					button
					selected={selectedIndex === 4}
					onClick={onOpenKeyboardShortcuts}
				>
					<ListItemText primary="Keyboard Shortcuts" />
				</ListItem>
			</List>
		</div>
	);
}
export default SidePanel;
