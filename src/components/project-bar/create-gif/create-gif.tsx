import React, { FC, useState } from "react";
import GIF from 'gif.js';
import FileSaver from 'file-saver';

import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from "@material-ui/core/Typography";
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import { useAppSelector } from "redux-util/hooks";
import { selectCanvasSize } from "redux-util/reducers/project";

import { ColorButton } from '../../primitives/button-mui/button';

import dranimate from "services/dranimate/dranimate";

import './create-gif.scss';

const CreateGif: FC<{}> = () => {
	const canvasSize = useAppSelector(selectCanvasSize);

	const [open, setOpen] = useState(false);
	const [loop, setLoop] = useState(true);
	const [length, setLength] = useState(3);

	const onOpen = (): void => {
		setOpen(true);
	}

	const onClose = (): void => {
		setOpen(false);
	}

	const onDownloadGif = (): void => {
		const recorder = new GIF({
			workers: 2,
			quality: 30,
			workerScript: '/assets/gif.worker.js',
			repeat: loop ? 0 : -1
		});

		// dranimate.renderer.setViewport(0, 0, 800, 600);

		// const renderer = new THREE.WebGLRenderer();
		dranimate.renderer.setSize(canvasSize.x, canvasSize.y, true);
		dranimate.renderer.setViewport(0, 0, canvasSize.x, canvasSize.y);

		dranimate.exportCamera.left = -canvasSize.x / 2;
		dranimate.exportCamera.right = canvasSize.x / 2;
		dranimate.exportCamera.top = -canvasSize.y / 2;
		dranimate.exportCamera.bottom = canvasSize.y / 2;
		dranimate.exportCamera.updateProjectionMatrix();

		// Frames per second = 30
		const frameCount = 30 * length;
		for(let i = 0; i < frameCount; i++) {
			dranimate.puppets.forEach((puppet) => {
				puppet.renderFrame(i);
			});

			dranimate.renderer.render(dranimate.scene, dranimate.exportCamera);

			recorder.addFrame(dranimate.renderer.domElement, {
				copy: true,
				delay: 32
			});
		}

		recorder.on('finished', (blob) => {
			FileSaver.saveAs(blob, `my-gif.gif`);
		});
		recorder.render();

		setOpen(false);
	}

	const onLoopChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setLoop(event.target.checked);
	}

	const onLengthChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setLength(Math.max(1, Number(event.target.value)));
	}

	const increaseLength = (): void => {
		setLength(length + 1);
	}

	const decreaseLength = (): void => {
		setLength(Math.max(1, length - 1));
	}

	return (
		<>
			<ColorButton onClick={onOpen}>
				Create gif
			</ColorButton>
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>
					Create gif
				</DialogTitle>
				<DialogContent>
					<Divider orientation='horizontal' />
					<Box m={2} />
					<div className='flex-row'>
						<Typography variant='h6'>
							Animation
						</Typography>
					</div>
					<Box m={2} />
					<div className='flex-row'>
						<TextField
							size='small'
							type='number'
							label="Length (seconds)"
							variant="outlined"
							value={length}
							onChange={onLengthChange}
						/>
						<Box m={1} />
						<div style={{minWidth: '40px'}}>
							<IconButton size='small' onClick={increaseLength}>
								<AddIcon />
							</IconButton>
						</div>
						<div style={{minWidth: '40px'}}>
							<IconButton size='small' onClick={decreaseLength}>
								<RemoveIcon />
							</IconButton>
						</div>
					</div>
					<Box m={2} />
					<div className='create-gif-settings-row'>
						<Typography variant='body2'>
							Loop
						</Typography>
						<Switch
							checked={loop}
							onChange={onLoopChange}
						/>
					</div>
					<Divider orientation='horizontal' />
				</DialogContent>
				<DialogActions>
					<ColorButton onClick={onDownloadGif} color="primary">
						Download gif
					</ColorButton>
				</DialogActions>
			</Dialog>
		</>
	);
}
export default CreateGif;
