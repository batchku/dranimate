import React, { FC } from 'react';

import TopBar from './top-bar/top-bar';
import SidePanel from './side-panel/side-panel';
import ProjectsList from './projects-list/projects-list';

import './landing-page.scss';

const LandingPage: FC<{}> = (): JSX.Element => {
	return (
		<div className='landing-page-container'>
			<TopBar />
			<SidePanel />
			<ProjectsList />
		</div>
	);
}
export default LandingPage;
