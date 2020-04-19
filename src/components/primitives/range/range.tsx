import React from 'react';

import './range.scss';

interface RangeState {
	value: string;
}

interface RangeProps {
	onChangeEnd: () => void;
	onChange: (value: number) => void;
}

class Range extends React.Component<RangeProps, RangeState> {
	constructor(props: RangeProps) {
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
					onMouseUp={this.props.onChangeEnd}
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
		}, () => {
			this.props.onChange(Number(this.state.value))
		});
	}
}
export default Range;
