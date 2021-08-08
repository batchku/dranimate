import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import PuppetCard from 'components/user-profile/puppet-card/puppet-card';

import apiService from 'services/api/apiService';

const PuppetsList = (): JSX.Element => {
  const history = useHistory();

  const [userPuppets, setUserPuppets] = useState([]);

  const loadUserPuppets = async (): Promise<void> => {
    const puppets = await apiService.getAllPuppetsForUser();
    if (!puppets) {
      return;
    }

    setUserPuppets(puppets);
  }

  const onAddPuppetToScene = () => {
    history.push('/editor');
  }
  const onStartAddingToScene = () => {/** */}

  const onPuppetDeleted = (): void => {
    loadUserPuppets();
  }

  useEffect(() => {
    loadUserPuppets();
  });

  return (
    <div className='puppets-list-container user-profile-projects-list-grid'>
      {userPuppets.map((puppet) => {
        return (
          <PuppetCard
            landingPage={true}
            key={puppet.databaseId}
            puppet={puppet}
            onAddToScene={onAddPuppetToScene}
            onStartAddingToScene={onStartAddingToScene}
            onDelete={onPuppetDeleted}
          />
        );
      })}
    </div>
  );
}
export default PuppetsList;
