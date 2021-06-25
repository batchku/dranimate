import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

export interface UiData {
	inspectPanelOpen: boolean;
}

const initialState: {data: UiData} = {
	data: {
		inspectPanelOpen: false
	}
};

export const uiDataSlice = createSlice({
	name: 'ui-data-slice',
	initialState,
	reducers: {
		setInspectPanelOpen: (state, action: PayloadAction<boolean>): void => {
			state.data.inspectPanelOpen = action.payload;
		},
	}
});

export const {
	setInspectPanelOpen
} = uiDataSlice.actions;

export const selectInspectPanelOpen = (state: RootState): boolean => state.ui.data.inspectPanelOpen;

export default uiDataSlice.reducer;
