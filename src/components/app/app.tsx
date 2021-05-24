import React from 'react';

import Stage from 'components/stage/stage';
import SignInDialog from 'components/sign-in-dialog/sign-in-dialog';
import LayersPanel from 'components/layers-panel/layers-panel';

class App extends React.Component<{}, {}> {
	public render = (): JSX.Element => {
		return (
			<>
				<Stage />
				<LayersPanel />
				<SignInDialog />
			</>
		);
	}
}
export default App;
