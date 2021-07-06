import React from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Stage from 'components/stage/stage';
import ProjectBar from 'components/project-bar/project-bar';
import LayersPanel from 'components/layers-panel/layers-panel';
import InspectPanel from 'components/inspect-panel/inspect-panel';
import LandingPage from 'components/landing-page/landing-page';
class App extends React.Component<{}, {}> {
	public render = (): JSX.Element => {
		return (
			<>
				<BrowserRouter>
					<Switch>
						<Route path='/'>
							<Stage />
							<ProjectBar />
							<LayersPanel />
							<InspectPanel />
						</Route>
						<Route path='/'>
							<LandingPage />
						</Route>
					</Switch>

				</BrowserRouter>
			</>
		);
	}
}
export default App;
