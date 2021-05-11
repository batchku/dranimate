import React from 'react';
import ReactDOM from 'react-dom';

import '../config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import { createMuiTheme } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import App from './components/app/app';

import './index.scss';

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#4a72e2',
		}
	}
});

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>,
	document.getElementById('root')
);
