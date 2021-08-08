import React, { useState, useRef, FC } from 'react';

import Typography, { TypographyVariant } from 'components/typography/typography';
import Spacer from 'components/primitives/spacer/spacer';
import Button from 'components/primitives/button-v2/button';
import CircularProgress from 'components/primitives/circular-progress/circular-progress';
import PuppetEditorClosePrompt from '../close-prompt/puppet-editor-close-prompt';

import puppetEditorStateService from 'services/imagetomesh/puppet-editor-state-service';
import { loadDranimateFile } from 'services/util/file';
import apiService from 'services/api/apiService';
import PuppetCard from 'components/user-profile/puppet-card/puppet-card';

import '../../user-profile/user-profile.scss';

interface ImportOrCreateProps {
  onCancel: () => void;
  onCreate: () => void;
}

const ImportOrCreate: FC<ImportOrCreateProps> = (props): JSX.Element => {
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [userPuppets, setUserPuppets] = useState([]);
  const [showPuppetList, setShowPuppetList] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const filePicker = useRef<HTMLInputElement>();

  const onCloseExitPrompt = (): void => {
    setExitPromptOpen(false);
  }

  const onOpenExitPrompt = (): void => {
    setExitPromptOpen(true);
  }

  const onSelectImage = (): void => {
    filePicker.current.click();
  }

  const onImageSelected = async (): Promise<void> => {
    const file = await loadDranimateFile(filePicker.current);

    puppetEditorStateService.setItem(file);

    props.onCreate();
  }

  const onImportClick = async (): Promise<void> => {
    const puppets = await apiService.getAllPuppetsForUser();
    if (!puppets) {
      return;
    }

    setUserPuppets(puppets);
    setShowPuppetList(true);
  }

  const onAddPuppetToScene = (): void => {
    setShowLoading(false);
    props.onCancel();
  }

  const onStartAddingToScene = (): void => {
    setShowLoading(true);
  }

  return (
    <div className='image-editor-container'>
      {/* Exit prompt */}
      {exitPromptOpen && <PuppetEditorClosePrompt onClose={props.onCancel} onKeepCreating={onCloseExitPrompt} />}

      {/* Import or Create dialog */}
      <div className='image-editor-dialog-white'>
        <div className='image-editor-dialog-title'>
          <img className='image-editor-close-button' src='./assets/close.svg' onClick={onOpenExitPrompt}/>
          <div className='image-editor-title-container'>
            <Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
              Import or Create
            </Typography>
          </div>
        </div>
        <div className='puppet-editor-dialog-body' style={{pointerEvents: 'all', padding: '24px 0px 24px 0px', overflowY: 'auto'}}>
            {!showPuppetList &&
            <>
              <Spacer size={32} />
              <Typography variant={TypographyVariant.HEADING_MEDIUM} color='rgba(0, 0, 0, 0.9)'>
                Import puppet from puppet library
              </Typography>
              <Spacer size={8} />
              <Button label='Import' onClick={onImportClick} />
              <Spacer size={32} />
              <Typography variant={TypographyVariant.HEADING_MEDIUM} color='rgba(0, 0, 0, 0.9)'>
                ...or create a brand new puppet
              </Typography>
              <Spacer size={8} />
              <Button label='Create' onClick={onSelectImage} />
            </>}
            {showPuppetList &&
            <>
              <div className='user-profile-projects-list-grid'>
                {userPuppets.map((puppet) => {
                  return (
                    <PuppetCard
                      key={puppet.databaseId}
                      puppet={puppet}
                      onAddToScene={onAddPuppetToScene}
                      onStartAddingToScene={onStartAddingToScene}
                    />
                  );
                })}
              </div>
            </>}
        </div>
      </div>
      <input
          type='file'
          ref={filePicker}
          value=''
          onChange={onImageSelected}
          className='hiddenFilePicker'
      />
      {showLoading
        && <div className='puppet-details-progress-backdrop'>
          <CircularProgress />
          <Spacer size={10} />
          <Typography variant={TypographyVariant.HEADING_SMALL} color='rgba(255, 255, 255, 0.9)' >
            Adding puppet to stage, please wait...
          </Typography>
        </div>}
    </div>
  );
}
export default ImportOrCreate;
