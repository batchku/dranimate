import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
} from 'react-router-dom';

import Stage from 'components/stage';

import 'styles/baseStyles.scss';

class App extends Component {
	render() {
		return (
			<Router>
				<Route component={Stage} />
			</Router>
		);
	}
}

export default App;
