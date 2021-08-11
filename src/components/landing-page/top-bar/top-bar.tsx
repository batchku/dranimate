import React, { FC } from 'react';

import { Paper } from '@material-ui/core';

import SignIn from 'components/sign-in/sign-in';
import ProfileImage from 'components/profile-image/profile-image';

import { useAppSelector } from 'redux-util/hooks';
import { selectUserSignedIn } from 'redux-util/reducers/ui';

import userService from 'services/api/userService';

import './top-bar.scss';

const TopBar: FC<{}> = (): JSX.Element => {
  const userSignedIn = useAppSelector(selectUserSignedIn);
  
  const user = userService.getUser();

  return (
    <Paper square className='landing-page-top-bar-container'>
      <img alt='logo' src='./assets/logo.svg' />
      {userSignedIn && user ? <ProfileImage user={user} /> : <SignIn />}
    </Paper>
  );
}
export default TopBar;
