import React from 'react';

import './icon-style.scss';

interface MoveToBackIconProps {
	fill: string;
	opacity: string;
}

export default class DeleteIcon extends React.Component<MoveToBackIconProps, {}> {
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
					<path d="M7.05882 24H21.8824C23.04 24 24 23.04 24 21.8824V7.05882C24 5.90118 23.04 4.94118 21.8824 4.94118H21.3176V7.05882H21.8824V21.8824H7.05882L7.05882 21.3176H4.94118V21.8824C4.94118 23.04 5.90118 24 7.05882 24Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M4.94118 19.0588V16.9412H8.47059V19.0588H4.94118Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M19.0588 4.94118H16.9412V8.47059H19.0588V4.94118Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M2.11765 19.0588H3.52941V16.9412H2.11765V15.5294H0V16.9412C0 18.0988 0.959999 19.0588 2.11765 19.0588Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M2.11765 13.4118H0V10.5882H2.11765V13.4118Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M2.11765 2.11765H3.52941V0H2.11765C0.959999 0 0 0.959999 0 2.11765V3.52941H2.11765V2.11765Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M10.5882 2.11765H13.4118V0H10.5882V2.11765Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M5.64706 2.11765V0H8.47059V2.11765H5.64706Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M0 8.47059H2.11765V5.64706H0V8.47059Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M19.0588 3.52941H16.9412V2.11765H15.5294V0H16.9412C18.0988 0 19.0588 0.959999 19.0588 2.11765V3.52941Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M10.5882 19.0588H13.4118V16.9412H10.5882V19.0588Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M19.0588 13.4118H16.9412V10.5882H19.0588V13.4118Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
					<path d="M15.5294 16.9412H16.9412V15.5294H19.0588V16.9412C19.0588 18.0988 18.0988 19.0588 16.9412 19.0588H15.5294V16.9412Z" fill={this.props.fill} fillOpacity={this.props.opacity}/>
				</svg>
			</div>
		);
	}
}
