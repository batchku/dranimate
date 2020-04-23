import React from 'react';
import EmailValidator from 'email-validator';

import CancelIcon from './../../../icons/cancel-icon';

import './input.scss';

interface InputProps {
	onChange: (value: string) => void;
	placeholder: string;
	label: string;
	type: string;
	value?: string;
	fullWidth?: boolean;
	backgroundColor?: string;
	color?: string;
	inputColor?: string;
	error?: string;
}

interface InputState {
	focused: boolean;
	initialRender: boolean;
	value: string;
	emailValid: boolean;
}

class Input extends React.Component<InputProps, InputState> {
	constructor(props: InputProps) {
		super(props);

		this.state = {
			focused: Boolean(this.props.value),
			initialRender: !this.props.value,
			value: this.props.value || '',
			emailValid: true,
		}
	}

	public render = (): JSX.Element => {
		let inputLabelClasses = 'input-label';
		if (this.state.focused) {
			inputLabelClasses += ' input-label-to-to-top';
		}
		else {
			inputLabelClasses += ' input-label-to-to-bottom';
		}
		if (this.state.initialRender) {
			inputLabelClasses = 'input-label';
		}

		let placeholderText = this.props.placeholder;
		if (!this.state.emailValid) {
			placeholderText = 'Please enter a valid email address';
		}
		if (this.props.error) {
			placeholderText = this.props.error;
		}

		let placeholderColor = '';
		if (this.props.color) {
			placeholderColor = this.props.color;
		}
		if (!this.state.emailValid && this.props.error) {
			placeholderColor = '#B60000';
		}

		let color = 'rgba(0, 0, 0, 0.6)';
		if (this.props.color) {
			color = this.props.color;
		}

		return (
			<div style={{
				width: this.props.fullWidth ? '100%' : '336px'
			}} className="input-field">
				<input
					className='input-text'
					value={this.state.value}
					type={this.props.type}
					style={{
						borderColor: this.state.emailValid && !this.props.error ? '' : '#B60000',
						backgroundColor: this.props.backgroundColor || '',
						color: this.props.inputColor || 'rgba(0, 0, 0, 0.9)',
						border: `2px solid ${color}`
					}}
					onChange={this.onValueChange}
					onFocus={this.onInputFocus}
					onBlur={this.onInputFocusOut}
				/>
				<label style={{
					color: this.props.color || 'rgba(0, 0, 0, 0.6)'
				}} className={inputLabelClasses} htmlFor="email">
					{this.props.label}
				</label>
				<label style={{
					color: placeholderColor
				}} className='input-placeholder' htmlFor="email">
					{placeholderText}
				</label>
				{this.state.value && !this.props.color &&
				<img
					onClick={this.onClear}
					className='input-cancel-button'
					src={this.state.emailValid && !this.props.error ? './assets/cancel.svg' : './assets/invalid-input.svg'}
				/>}
				{this.state.value && this.props.color &&
				<div onClick={this.onClear} className='input-cancel-button'>
					<CancelIcon fill='white' opacity='0.7'/>
				</div>}
			</div>
		);
	}

	private onInputFocus = (): void => {
		this.setState({
			focused: true,
			initialRender: false,
		});
	}

	private onInputFocusOut = (): void => {
		this.setState({
			focused: Boolean(this.state.value)
		});

		if (this.props.type === 'email') {
			const emailValid = EmailValidator.validate(this.state.value);
			this.setState({
				emailValid: emailValid,
			});
		}
	}

	private onValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		this.setState({
			value: event.target.value
		}, () => {
			this.props.onChange(this.state.value);
		});
	}

	private onClear = (): void => {
		this.setState({
			value: '',
			emailValid: true
		}, () => {
			this.props.onChange(this.state.value);
		});
	}
}
export default Input;
