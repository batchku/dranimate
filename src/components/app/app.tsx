import React from 'react';

import Stage from 'components/stage/stage';
import SignInDialog from 'components/sign-in-dialog/sign-in-dialog';

class App extends React.Component<{}, {}> {
	public render = (): JSX.Element[] => {
		return ([
			<Stage key='stage' />,
			<SignInDialog key='sign-in-dialog' />
		]);
	}
}
export default App;
