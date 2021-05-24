import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

import { createLiveVideoPuppet } from "services/puppet/puppet-factory";
import dranimate from "services/dranimate/dranimate";

export interface PuppetData {
	id: string;
	name: string;
	visible: boolean;
	selected: boolean;
}

interface SetPuppetVisiblePayload {
	puppetId: string;
	visible: boolean;
}

interface SetPuppetSelectedPayload {
	puppetId: string;
	selected: boolean;
}

const initialState: PuppetData[] = [];

export const puppetsSlice = createSlice({
	name: 'puppets-slice',
	initialState,
	reducers: {
		addPuppet: (state) => {
			// state.puppets.push = action.payload;
		},
		addLiveVideo: (state): void => {
			const puppet = createLiveVideoPuppet();

			state.push({
				name: 'Live video',
				id: puppet.id,
				visible: true,
				selected: false,
			});
			
			dranimate.addPuppet(puppet);
		},
		setVisible: (state, action: PayloadAction<SetPuppetVisiblePayload>): void => {
			const puppet = dranimate.getPuppetWithId(action.payload.puppetId);
			puppet.setVisible(action.payload.visible);

			const puppetUiData = state.find((statePuppet) => {
				return statePuppet.id === action.payload.puppetId;
			});
			puppetUiData.visible = action.payload.visible;
		},
		setSelected: (state, action: PayloadAction<SetPuppetSelectedPayload>): void => {
			dranimate.puppets.forEach((puppet) => {
				puppet.setSelectionGUIVisible(false);
			});

			const puppet = dranimate.getPuppetWithId(action.payload.puppetId);
			puppet?.setSelectionGUIVisible(action.payload.selected);

			state.forEach((statePuppet) => {
				statePuppet.selected = false;
			});

			const puppetUiData = state.find((statePuppet) => {
				return statePuppet.id === action.payload.puppetId;
			});
			if (puppetUiData) {
				puppetUiData.selected = action.payload.selected;
			}
		},
		deletePuppet: (state, action: PayloadAction<string>): void => {
			dranimate.deleteSelectedPuppet();

			state = state.filter((puppet) => {
				return puppet.id !== action.payload;
			});
		}
	}
});

export const { addPuppet, addLiveVideo, setVisible, setSelected, deletePuppet } = puppetsSlice.actions;

export const selectPuppets = (state: RootState): PuppetData[] => state.puppets;

export default puppetsSlice.reducer;
