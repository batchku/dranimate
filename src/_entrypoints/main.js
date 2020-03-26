import React from 'react';
import ReactDOM from 'react-dom';

import './config/firebase';
import 'regenerator-runtime';

import App from '../components/app';

ReactDOM.render(
	<App/>,
	document.getElementById('root')
);
