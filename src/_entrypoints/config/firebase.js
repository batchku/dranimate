import { initializeApp } from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyAg4q9KdeCnnKe_nwS0RT_IC7WoK5RaaWY',
  authDomain: 'dranimate-beta.firebaseapp.com',
  databaseURL: 'https://dranimate-beta.firebaseio.com',
  projectId: 'dranimate-beta',
  storageBucket: 'dranimate-beta.appspot.com',
  messagingSenderId: '740346662452'
};
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
