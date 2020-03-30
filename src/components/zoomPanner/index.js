import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import styles from './styles.scss';

class ZoomPanner extends Component {
	constructor(props) {
		super(props);

		this.state = {
			panIsSelected: false,
		};
		
		this.onWheel = this.onWheel.bind(this);
	}

	componentDidMount() {
		window.addEventListener('wheel', this.onWheel);
	}

	componentWillUnmount() {
		window.removeEventListener('wheel', this.onWheel);
	}

	onWheel(event) {
		if (!this.props.zoomEnabled) {
			return;
		}

		if (event.deltaY > 0) {
			this.props.onZoomSelect(false, event.deltaY / 5000);
		}
		else if (event.deltaY < 0) {
			this.props.onZoomSelect(true, -event.deltaY / 5000);
		}
	}

	onPanClick = () => {
		const panIsSelected = !this.state.panIsSelected;
		this.props.onPanSelect(panIsSelected);
		this.setState({ panIsSelected });
	}

	renderPanButton() {
		return (
			<Button
				className={this.state.panIsSelected ? styles.panActive : styles.pan}
				onClick={this.onPanClick}
			>
				Pan
			</Button>
		);
	}

	render() {
		return (
			<div className={this.props.className}>
				{ this.props.onPanSelect ? this.renderPanButton() : null }
				<Button
					className={ styles.zoomButton }
					onClick={() => this.props.onZoomSelect(true)}
				>
					Zoom In
				</Button>
				<Button
					className={ styles.zoomButton }
					onClick={() => this.props.onZoomSelect(false)}
				>
					Zoom Out
				</Button>
			</div>
		);
	}
}

ZoomPanner.propTypes = {
	onPanSelect: PropTypes.func,
	onZoomSelect: PropTypes.func.isRequired,
	zoomEnabled: PropTypes.bool,
};

export default ZoomPanner;
