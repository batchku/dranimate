import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";

export interface UiData {
	inspectPanelOpen: boolean;
	landingPageActiveScreen: string;
	userSignedIn: boolean;
}

const initialState: {data: UiData} = {
	data: {
		inspectPanelOpen: false,
		landingPageActiveScreen: 'projects',
		userSignedIn: false,
	}
};

export const uiDataSlice = createSlice({
	name: 'ui-data-slice',
	initialState,
	reducers: {
		setInspectPanelOpen: (state, action: PayloadAction<boolean>): void => {
			state.data.inspectPanelOpen = action.payload;
		},
		setLandingPageActiveScreen: (state, action: PayloadAction<string>): void => {
			state.data.landingPageActiveScreen = action.payload;
		},
		setUserSignedIn: (state, action: PayloadAction<boolean>): void => {
			state.data.userSignedIn = action.payload;
		},
	}
});

export const {
	setInspectPanelOpen,
	setLandingPageActiveScreen,
	setUserSignedIn
} = uiDataSlice.actions;

export const selectInspectPanelOpen = (state: RootState): boolean => state.ui.data.inspectPanelOpen;
export const selectActiveLandingPageScreen = (state: RootState): string => state.ui.data.landingPageActiveScreen;
export const selectUserSignedIn = (state: RootState): boolean => state.ui.data.userSignedIn;

export default uiDataSlice.reducer;
