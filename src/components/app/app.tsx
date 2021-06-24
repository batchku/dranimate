import React from 'react';

import Stage from 'components/stage/stage';
import ProjectBar from 'components/project-bar/project-bar';
import SignInDialog from 'components/sign-in-dialog/sign-in-dialog';
import LayersPanel from 'components/layers-panel/layers-panel';
import InspectPanel from 'components/inspect-panel/inspect-panel';

class App extends React.Component<{}, {}> {
	public render = (): JSX.Element => {
		return (
			<>
				<Stage />
				<ProjectBar />
				<LayersPanel />
				<InspectPanel />
				<SignInDialog />
			</>
		);
	}
}
export default App;
