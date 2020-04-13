import React from 'react';

import './range.scss';

interface RangeState {
	value: string;
}

class Range extends React.Component<{}, RangeState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			value: '30'
		};
	}

	public render = (): JSX.Element => {
		return (
			<div className='range-container'>
				<input
					type="range"
					min="0"
					max="100"
					value={this.state.value}
					onChange={this.onChange}
				/>
					<p className='range-input-label'>
						{this.state.value}
					</p>
			</div>
		);
	}

	private onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		this.setState({
			value: event.target.value
		});
	}
}
export default Range;
