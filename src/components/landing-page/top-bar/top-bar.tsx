import React, { FC, useState, useEffect, useRef } from 'react';
import { v1 as uuid } from 'uuid';

import { Paper } from '@material-ui/core';

import SignIn from 'components/sign-in/sign-in';
import ProfileImage from 'components/profile-image/profile-image';

import userSignedInEvent, { UserSignedInEventData } from 'services/eventManager/user-signed-in-event';

import './top-bar.scss';

const TopBar: FC<{}> = (): JSX.Element => {
	const [user, setUser] = useState(null);
	const [userSignedIn, setUserSignedIn] = useState(false);

	const onUserSignedInEventId = useRef(uuid());

	const onUserSignedIn = (data: UserSignedInEventData): void => {
		setUserSignedIn(Boolean(data.user));
		setUser(data.user);
	}

	useEffect(() => {
		userSignedInEvent.subscribe({
			callback: onUserSignedIn,
			id: onUserSignedInEventId.current,
		});

		return (): void => {
			userSignedInEvent.unsubscribe(onUserSignedInEventId.current);
		}
	});

	return (
		<Paper square className='landing-page-top-bar-container'>
			<img alt='logo' src='./assets/logo.svg' />
			{userSignedIn && user ? <ProfileImage user={user} /> : <SignIn />}
		</Paper>
	);
}
export default TopBar;
