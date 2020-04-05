import React from 'react';

import './icon-style.scss';

interface MoveToFrontIconProps {
	fill: string;
	opacity: string;
}

export default class DeleteIcon extends React.Component<MoveToFrontIconProps, {}> {
	public render = (): JSX.Element => {
		return (
			<div className='icon-container'>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M15.5294 24H18.3529V21.8824H15.5294V24Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M24 18.3529H21.8824V15.5294H24V18.3529Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M24 13.4118H21.8824V10.5882H24V13.4118Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M24 21.8824V20.4706H21.8824V21.8824H20.4706V24H21.8824C23.04 24 24 23.04 24 21.8824Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M24 8.47059H21.8824V7.05882H20.4706V4.94118H21.8824C23.04 4.94118 24 5.90117 24 7.05882V8.47059Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M13.4118 24H10.5882V21.8824H13.4118V24Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M4.94118 21.8824V20.4706H7.05882V21.8824H8.47059V24H7.05882C5.90118 24 4.94118 23.04 4.94118 21.8824Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path fillRule="evenodd" clipRule="evenodd" d="M2.11765 19.0588H16.9412C18.0988 19.0588 19.0588 18.0988 19.0588 16.9412V2.11765C19.0588 0.959999 18.0988 0 16.9412 0H2.11765C0.959999 0 0 0.959999 0 2.11765V16.9412C0 18.0988 0.959999 19.0588 2.11765 19.0588ZM16.9412 2.11765H2.11765V16.9412H16.9412V2.11765Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
				</svg>
			</div>
		);
	}
}
