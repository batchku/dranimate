import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import '../config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import { createMuiTheme } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import App from './components/app/app';

import { store } from './redux-util/store';

import './index.scss';

const theme = createMuiTheme({
	palette: {
		type: 'dark'
	}
});

ReactDOM.render(
	<ThemeProvider theme={theme}>
		<Provider store={store}>
			<App />
		</Provider>
	</ThemeProvider>,
	document.getElementById('root')
);
