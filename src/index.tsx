import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import '../config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

import { createTheme } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import App from './components/app/app';

import { store } from './redux-util/store';

import './index.scss';

const theme = createTheme({
	palette: {
		primary: {
			main: 'rgba(255, 255, 255, 0.9)'
		},
		secondary: {
			main: 'rgba(255, 255, 255, 0.9)'
		},
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
