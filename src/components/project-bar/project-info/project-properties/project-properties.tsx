import React, { FC } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';

import { ColorButton } from 'components/primitives/button-mui/button';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectBackgroundColor, selectCanvasSize, setBackgroundColor } from 'redux-util/reducers/project';
import { setCanvasSize } from 'redux-util/reducers/project';

const availableCanvasSizes = [
	{x: 320, y: 320},
	{x: 480, y: 480},
	{x: 640, y: 640},
	{x: 800, y: 800},
	{x: 1024, y: 1024},
	{x: 1080, y: 1080},
	{x: 1280, y: 1280},
	{x: 1920, y: 1920},
];

const availableCanvasColors = [
	{name: 'Black', value: 0x000000},
	{name: 'Red', value: 0xff0000},
	{name: 'Green', value: 0x00ff00},
	{name: 'Blue', value: 0x0000ff},
];

interface ProjectPropertiesProps {
	open: boolean;
	onClose: () => void;
}

const ProjectProperties: FC<ProjectPropertiesProps> = (props) => {
	const canvasSize = useAppSelector(selectCanvasSize);
	const backgroundColor = useAppSelector(selectBackgroundColor);

	const dispatch = useAppDispatch();

	const onCanvasSizeChanged = (event: React.ChangeEvent<{
		value: string;
	}>): void => {
		const x = Number(event.target.value.split('x')[0]);
		const y = Number(event.target.value.split('x')[1]);

		dispatch(setCanvasSize({
			x: x,
			y: y,
		}));
	}

	const onBackgroundColorChanged = (event: React.ChangeEvent<{
		value: number;
	}>): void => {
		const selectedColorData = availableCanvasColors.find((color) => {
			return color.value === event.target.value;
		})

		dispatch(setBackgroundColor({
			name: selectedColorData.name,
			value: selectedColorData.value
		}));
	}

	const onSave = (): void => {
		// TODO - Add save to firebase
	}

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>
				Project properties
			</DialogTitle>
			<DialogContent>
				{/* Canvas Dimensions */}
				<DialogContentText>
					Canvas dimensions
				</DialogContentText>
				<FormControl variant="outlined" fullWidth>
					<InputLabel id="canvas-resolution">
						Select a frame
					</InputLabel>
					<Select
						labelId="canvas-resolution"
						value={`${canvasSize.x}x${canvasSize.y}`}
						onChange={onCanvasSizeChanged}
						label="Select a frame"
					>
						{availableCanvasSizes.map((size) => {
							return (
								<MenuItem
									key={`${size.x}x${size.y}`}
									value={`${size.x}x${size.y}`}
								>
									{size.x}x{size.y}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>

				<Box m={1} />

				{/* Background Color */}
				<DialogContentText>
					Background Color
				</DialogContentText>
				<FormControl variant="outlined" fullWidth>
					<InputLabel id="background-color">
						Select a color
					</InputLabel>
					<Select
						labelId="background-color"
						value={backgroundColor.value}
						onChange={onBackgroundColorChanged}
						label="Select a color"
					>
						{availableCanvasColors.map((color) => {
							return (
								<MenuItem
									key={color.name}
									value={color.value}
								>
									{color.name}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions>
			<ColorButton onClick={onSave}>
				Save
			</ColorButton>
			</DialogActions>
		</Dialog>
	)
}
export default ProjectProperties;
