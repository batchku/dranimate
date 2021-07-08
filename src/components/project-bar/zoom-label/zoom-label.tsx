import React, { FC, useRef, useState } from 'react';

import { Menu, MenuItem } from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { LabelButton } from 'components/primitives/button-mui/button';

import dranimate from 'services/dranimate/dranimate';
import { useEffect } from 'react';

const getZoomLabelValue = (): number => {
	return Math.floor(dranimate.zoom * 100);
}

const ZoomLabel: FC<{}> = (): JSX.Element => {
	const zoomLabelButtonRef = useRef<HTMLButtonElement>();

	const [zoom, setZoom] = useState(getZoomLabelValue());
	const [menuOpen, setMenuOpen] = useState(false);

	const onMenuOpen = (): void => {
		setMenuOpen(true);
	}

	const onMenuClose = (): void => {
		setMenuOpen(false);
	}

	const setZoomLevel = (zoom: number): void => {
		setZoom(zoom);

		dranimate.setZoom(zoom);

		setMenuOpen(false);
	}

	useEffect(() => {
		const onMouseWheel = (): void => {
			setZoom(getZoomLabelValue());
		}

		addEventListener('wheel', onMouseWheel);

		return (): void => {
			removeEventListener('wheel', onMouseWheel);
		}
	}, []);

	return (
		<>
			<LabelButton
				ref={zoomLabelButtonRef}
				onClick={onMenuOpen}
				endIcon={<ArrowDropDownIcon />}
				style={{
					width: '108px'
				}}
			>
				{zoom}%
			</LabelButton>
			<Menu
				anchorEl={zoomLabelButtonRef.current}
				open={menuOpen}
				onClose={onMenuClose}
				getContentAnchorEl={null}
				anchorOrigin={{
					horizontal: 'right',
					vertical: 'bottom'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<MenuItem onClick={(): void => {setZoomLevel(150)}}>150%</MenuItem>
				<MenuItem onClick={(): void => {setZoomLevel(130)}}>130%</MenuItem>
				<MenuItem onClick={(): void => {setZoomLevel(110)}}>110%</MenuItem>
				<MenuItem onClick={(): void => {setZoomLevel(90)}}>90%</MenuItem>
				<MenuItem onClick={(): void => {setZoomLevel(70)}}>70%</MenuItem>
			</Menu>
		</>
	);
}
export default ZoomLabel;
