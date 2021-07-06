import React, { FC } from 'react';

import { Paper } from '@material-ui/core';

import './top-bar.scss';

const TopBar: FC<{}> = (): JSX.Element => {
	return (
		<Paper square className='landing-page-top-bar-container'>
			<img alt='logo' src='./assets/logo.svg' />
		</Paper>
	);
}
export default TopBar;
