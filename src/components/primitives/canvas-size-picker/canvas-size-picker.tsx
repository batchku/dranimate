import React, { useState, FC } from 'react';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import LockOpenIcon from 'icons/lock-open';
import LockClosedIcon from 'icons/lock-closed';

interface CanvasSizePickerProps {
	width: string;
	height: string;
	onChange: (width: string, height: string) => void;
}

const CanvasSizePicker: FC<CanvasSizePickerProps> = (props): JSX.Element => {
	const [locked, setLocked] = useState(false);

	const toggleLock = (): void => {
		setLocked(!locked);
	}

	const onWidthChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		if (locked) {
			const currentWidth = Number(props.width) || 1;
			const currentHeight = Number(props.height) || 1;

			const newWidth = Number(event.target.value);
			const newHeight = (newWidth / currentWidth) * currentHeight;

			props.onChange(newWidth.toString(), newHeight.toString());
		}
		else {
			props.onChange(event.target.value, props.height);
		}
	}

	const onHeightChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		if (locked) {
			const currentWidth = Number(props.width) || 1;
			const currentHeight = Number(props.height) || 1;

			const newHeight = Number(event.target.value);
			const newWidth = (newHeight / currentHeight) * currentWidth;

			props.onChange(newWidth.toString(), newHeight.toString());
		}
		else {
			props.onChange(props.width, event.target.value);
		}
	}

	return (
		<div className='fr-space-between'>
			<TextField
				label='Width'
				variant='outlined'
				onChange={onWidthChange}
				value={props.width}
				type='number'
			/>
			<IconButton onClick={toggleLock}>
				{!locked && <LockOpenIcon fill='#ffffff' opacity='0.9' />}
				{locked && <LockClosedIcon fill='#ffffff' opacity='0.9' />}
			</IconButton>
			<TextField
				label='Height'
				variant='outlined'
				onChange={onHeightChange}
				value={props.height}
				type='number'
			/>
		</div>
	)
}
export default CanvasSizePicker;
