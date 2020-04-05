import React from 'react';

import Typography, {TypographyVariant} from 'components/typography/typography';

import './content-button.scss';

interface ContentButtonProps {
	label?: string;
	onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

class ContentButton extends React.Component<ContentButtonProps, {}> {
	constructor(props: ContentButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='content-button-background'>
				<div
					className='content-button-center'
					onClick={this.props.onClick}
					style={{
						paddingLeft: this.props.label ? '20px' : '8px',
						paddingRight: this.props.label ? '20px' : '8px'
					}}
				>
					{this.props.children}
					{this.props.label &&
					<div className='content-button-label-container'>
						<Typography variant={TypographyVariant.HEADING_MEDIUM} color='#00000099'>
							{this.props.label}
						</Typography>
					</div>}
				</div>
			</div>
		);
	}
}
export default ContentButton;
