import React from 'react';

import './puppet-editor-close-prompt.scss';
import Dialog from 'components/primitives/dialog/dialog';
import DialogTitle from 'components/primitives/dialog/dialog-title';
import DialogBody from 'components/primitives/dialog/dialog-body';
import Typography, { TypographyVariant } from 'components/typography/typography';
import DialogActions from 'components/primitives/dialog/dialog-actions';
import BorderButton from 'components/primitives/border-button/border-button';
import Button from 'components/primitives/button-v2/button';
import Spacer from 'components/primitives/spacer/spacer';

interface PuppetEditorClosePromptProps {
	onClose: () => void;
	onKeepCreating: () => void;
}

export default class PuppetEditorClosePrompt extends React.Component<PuppetEditorClosePromptProps, {}> {
	constructor(props: PuppetEditorClosePromptProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<div className='puppet-editor-close-prompt-backdrop'>
				<Dialog onClose={this.props.onClose} backdropDisabled={true}>
					<DialogTitle title='Exit without finishing?' />
					<DialogBody>
						<Typography variant={TypographyVariant.TEXT_SMALL} color='rgba(0, 0, 0, 0.9)' align='center'>
							If you leave now, your puppet won&apos;t be created and your progress won&apos;t be saved.
						</Typography>
						<DialogActions>
							<BorderButton label='Exit' onClick={this.props.onClose} width={162} />
							<Spacer size={12} />
							<Button label='Keep creating' onClick={this.props.onKeepCreating} width={162} />
						</DialogActions>
					</DialogBody>
				</Dialog>
			</div>
		);
	}
}
