import React from 'react';

import Typography, { TypographyVariant } from 'components/typography/typography';

import './dialog-title.scss';

interface DialogTitleProps {
	title: string;
}

export default class DialogTitle extends React.Component<DialogTitleProps, {}> {
	constructor(props: DialogTitleProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='dialog-title'>
				<div className='dialog-title-container'>
					<Typography variant={TypographyVariant.TEXT_LARGE} color='rgba(0, 0, 0, 0.9)'>
						{this.props.title}
					</Typography>
				</div>
			</div>
		);
	}
}
