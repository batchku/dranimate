import React, { useEffect, useRef } from 'react';

import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import List from '@material-ui/core/List';
import RootRef from '@material-ui/core/RootRef';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectActivePuppet, selectPuppets, setSelected, reorderPuppet } from 'redux-util/reducers/puppets'
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

	const onDragEnd = (result: DropResult): void => {
		// dropped outside the list
		if (!result.destination) {
			return;
		}

		dispatch(reorderPuppet({
			from: result.source.index,
			to: result.destination.index,
		}));
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
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='droppable'>
				{(provided): JSX.Element => (
					<RootRef rootRef={provided.innerRef}>
						<List>
							{puppets.map((puppet, index) => {
								return (
									<Draggable key={puppet.id} draggableId={puppet.id} index={index}>
										{(provided, snapshot): JSX.Element => (
											<PuppetListItem
												key={puppet.id}
												puppet={puppet}
												provided={provided}
												snapshot={snapshot}
											/>
										)}
									</Draggable>
								);
							})}
							{provided.placeholder}
						</List>
					</RootRef>
				)}
			</Droppable>
		</DragDropContext>
	)
}
export default PuppetList;
