import React from 'react';
import ReactDOM from 'react-dom';

import 'regenerator-runtime';

import './config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import App from '../components/app';

ReactDOM.render(
	<App/>,
	document.getElementById('root')
);
