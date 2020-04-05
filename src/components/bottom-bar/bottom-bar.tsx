import React from 'react';

import AddPuppet from 'components/add-puppet/add-puppet';
import ContentButton from 'components/primitives/content-button/content-button';
import Icon, {IconSize} from 'components/primitives/icon/icon';
import Spacer from 'components/primitives/spacer/spacer';

import './bottom-bar.scss';

class BottomBar extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='bottom-bar-container'>
				<div className='bottom-bar-items'>
					<ContentButton>
						<Icon url='./assets/camera.svg'/>
					</ContentButton>
					<Spacer size={12} />
					<ContentButton>
						<Icon url='./assets/gif.svg'/>
					</ContentButton>
					<Spacer size={12} />
					<ContentButton label='Start hand detection'>
						<Icon url='./assets/play.svg' size={IconSize.SMALL} />
					</ContentButton>
				</div>
				<AddPuppet />
			</div>
		);
	}
}
export default BottomBar;
