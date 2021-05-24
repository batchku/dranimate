import React, { useEffect } from 'react';

import List from '@material-ui/core/List';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectPuppets, setSelected } from '../../../redux/reducers/puppets'

import dranimate from 'services/dranimate/dranimate';
import generateUniqueId from 'services/util/uuid';
import puppetSelectedEvent, { PuppetSelectedEventData } from 'services/eventManager/puppet-selected-event';

import './puppet-list.scss';
import PuppetListItem from './puppet-list-item/puppet-list-item';

const PuppetList = (): JSX.Element => {
	const dispach = useAppDispatch();

	const puppets = useAppSelector(selectPuppets);

	const onStagePuppetSelected = (data: PuppetSelectedEventData): void => {
		dispach(setSelected({
			puppetId: data.puppet?.id,
			selected: Boolean(data.puppet)
		}));
	}

	useEffect(() => {
		puppetSelectedEvent.subscribe({
			id: generateUniqueId(),
			callback: onStagePuppetSelected
		})
	}, []);

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
