import React, { FC } from 'react';

import TopBar from './top-bar/top-bar';
import SidePanel from './side-panel/side-panel';
import ProjectsList from './projects-list/projects-list';
import PuppetsList from './puppets-list/puppets-list';
import SignInDialog from 'components/sign-in-dialog/sign-in-dialog';

import { useAppSelector } from 'redux-util/hooks';
import { selectActiveLandingPageScreen } from 'redux-util/reducers/ui';

import './landing-page.scss';

const LandingPage: FC<{}> = (): JSX.Element => {
	const activeScreen = useAppSelector(selectActiveLandingPageScreen);

	return (
		<div className='landing-page-container'>
			<TopBar />
			<SidePanel />
			{activeScreen === 'projects' && <ProjectsList />}
			{activeScreen === 'puppets' && <PuppetsList />}
			<SignInDialog />
		</div>
	);
}
export default LandingPage;
