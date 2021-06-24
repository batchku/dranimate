import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dranimate from "services/dranimate/dranimate";

import { RootState } from "../store";

export interface ProjectData {
	name: string;
	canvasSize: CanvasSizeData;
	backgroundColor: BackgroundColorData;
}

interface CanvasSizeData {
	x: number;
	y: number;
}

interface BackgroundColorData {
	name: string;
	value: number;
}

const initialState: {data: ProjectData} = {
	data: {
		name: 'Untitled Project',
		canvasSize: {
			x: 640,
			y: 640,
		},
		backgroundColor: {
			name: 'Black',
			value: 0x000
		},
	}
};

export const projectSlice = createSlice({
	name: 'project-slice',
	initialState,
	reducers: {
		setName: (state, action: PayloadAction<string>): void => {
			state.data.name = action.payload;
		},
		setCanvasSize: (state, action: PayloadAction<CanvasSizeData>): void => {
			dranimate.setCanvasSize(action.payload.x, action.payload.y);

			state.data.canvasSize = action.payload;
		},
		setBackgroundColor: (state, action: PayloadAction<BackgroundColorData>): void => {
			dranimate.setBackgroundColor(action.payload.value);

			state.data.backgroundColor = action.payload;
		}
	}
});

export const {
	setCanvasSize,
	setBackgroundColor,
	setName
} = projectSlice.actions;

export const selectProjectName = (state: RootState): string => state.project.data.name;
export const selectCanvasSize = (state: RootState): CanvasSizeData => state.project.data.canvasSize;
export const selectBackgroundColor = (state: RootState): BackgroundColorData => state.project.data.backgroundColor;

export default projectSlice.reducer;
