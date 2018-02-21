import React from 'react';
import ReactDOM from 'react-dom';
import firebaseApp from './config/firebase';
import App from '../components/app';
console.log('firebaseApp', firebaseApp);
ReactDOM.render(<App />, document.getElementById('root'));
