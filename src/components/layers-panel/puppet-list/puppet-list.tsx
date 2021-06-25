import React, { useEffect, useRef } from 'react';

import List from '@material-ui/core/List';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectActivePuppet, selectPuppets, setSelected } from 'redux-util/reducers/puppets'
import { setInspectPanelOpen } from 'redux-util/reducers/ui';

import generateUniqueId from 'services/util/uuid';
import puppetSelectedEvent, { PuppetSelectedEventData } from 'services/eventManager/puppet-selected-event';

import PuppetListItem from './puppet-list-item/puppet-list-item';

import './puppet-list.scss';

const PuppetList = (): JSX.Element => {
	const dispatch = useAppDispatch();

	const puppets = useAppSelector(selectPuppets);
	const activePuppet = useAppSelector(selectActivePuppet);

	const puppetSelectedEventId = useRef(generateUniqueId());

	const onStagePuppetSelected = (data: PuppetSelectedEventData): void => {
		dispatch(setSelected({
			puppetId: data.puppet?.id,
			selected: Boolean(data.puppet)
		}));
		if (activePuppet?.id !== data.puppet?.id) {
			dispatch(setInspectPanelOpen(Boolean(data.puppet)));
		}
		if (!data.puppet) {
			dispatch(setInspectPanelOpen(false));
		}
	}

	useEffect(() => {
		puppetSelectedEvent.subscribe({
			id: puppetSelectedEventId.current,
			callback: onStagePuppetSelected
		})

		return (): void => {
			puppetSelectedEvent.unsubscribe(puppetSelectedEventId.current);
		}
	}, [activePuppet]);

	return (
		<List>
			{puppets.map((puppet) => {
				return (
					<PuppetListItem key={puppet.id} puppet={puppet} />
				);
			})}
		</List>
	)
}
export default PuppetList;
