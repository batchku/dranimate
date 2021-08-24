import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v1 as uuid } from 'uuid';

import dranimate from "services/dranimate/dranimate";

import { RootState } from "../store";

export interface ProjectData {
	id: string;
	name: string;
	canvasSize: CanvasSizeData;
	backgroundColor: BackgroundColorData;
	fps: string;
	livedrawInputCameraId: string;
	handposeInputCameraId: string;
}

interface CanvasSizeData {
	x: string;
	y: string;
}

interface BackgroundColorData {
	name: string;
	value: number;
}

const initialState: {data: ProjectData} = {
	data: {
		id: uuid(),
		name: 'Untitled Project',
		canvasSize: {
			x: '640',
			y: '640',
		},
		backgroundColor: {
			name: 'Black',
			value: 0x000
		},
		fps: '30',
		livedrawInputCameraId: '',
		handposeInputCameraId: '',
	}
};

export const projectSlice = createSlice({
	name: 'project-slice',
	initialState,
	reducers: {
		setProject: (state, action: PayloadAction<ProjectData>): void => {
			state.data = action.payload;
		},
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
		},
		setFps: (state, action: PayloadAction<string>): void => {
			state.data.fps = action.payload;
		},
		setLivedrawInputCamera: (state, action: PayloadAction<string>): void => {
			state.data.livedrawInputCameraId = action.payload;
		},
		setHandposeInputCamera: (state, action: PayloadAction<string>): void => {
			state.data.handposeInputCameraId = action.payload;
		},
	}
});

export const {
	setProject,
	setCanvasSize,
	setBackgroundColor,
	setName,
	setFps,
	setLivedrawInputCamera,
	setHandposeInputCamera
} = projectSlice.actions;

export const selectProject = (state: RootState): ProjectData => state.project.data;
export const selectProjectName = (state: RootState): string => state.project.data.name;
export const selectCanvasSize = (state: RootState): CanvasSizeData => state.project.data.canvasSize;
export const selectBackgroundColor = (state: RootState): BackgroundColorData => state.project.data.backgroundColor;
export const selectFps = (state: RootState): string => state.project.data.fps;
export const selectLivedrawInputCamera = (state: RootState): string => state.project.data.livedrawInputCameraId;
export const selectHandposeInputCamera = (state: RootState): string => state.project.data.handposeInputCameraId;

export default projectSlice.reducer;
