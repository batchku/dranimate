import React from 'react';
import ReactDOM from 'react-dom';

import '../config/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import App from './components/app/app';

import './index.scss';

ReactDOM.render(
	<App />,
	document.getElementById('root')
);
