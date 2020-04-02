import React, { Component } from 'react';

import eventManager from '../../../services/eventManager/event-manager';

import styles from './styles.scss';

class Toast extends Component {
	constructor(props) {
		super(props);

		this._showEventId = '';
		this._containerRef = React.createRef();

		this.state = {
			open: false,
			text: '',
		};

		this.show = this.show.bind(this);
		this.onAnimationEnd = this.onAnimationEnd.bind(this);
	}

	componentDidMount() {
		this._showEventId = eventManager.on('show-toast', this.show);
	}

	componentWillUnmount() {
		eventManager.remove(this._showEventId);
	}

	show(text) {
		this.setState({
			open: true,
			text: text,
		}, () => {
			this._containerRef.current.addEventListener('animationend', this.onAnimationEnd);
		});
	}

	onAnimationEnd() {
		this._containerRef.current.removeEventListener('animationend', this.onAnimationEnd);

		this.setState({
			open: false,
			text: '',
		});
	}

	render() {
		return (
			this.state.open &&
			<div ref={this._containerRef} className={styles.container}>
				<p>
					{this.state.text}
				</p>
			</div>
		);
	}
}

export default Toast;
