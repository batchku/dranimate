import React from 'react';

import './dialog.scss';

interface DialogProps {
	onClose: () => void;
	backdropDisabled?: boolean;
}

export default class Dialog extends React.Component<DialogProps, {}> {
	constructor(props: DialogProps) {
		super(props);
	}

	public render = (): JSX.Element[] => {
		return ([
			!this.props.backdropDisabled
			&& <div key='dialog-backdrop' className='dialog-backdrop' onClick={this.props.onClose} />,
			<div key='dialog-container' className='dialog-container'>
				<div className='dialog'>
					{this.props.children}
				</div>
			</div>
		]);
	}
}
