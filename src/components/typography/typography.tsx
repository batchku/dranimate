import React from 'react';

import './typography.scss';

export enum TypographyVariant {
	TEXT_X_SMALL = 'text-x-small',
	TEXT_SMALL = 'text-small',
	TEXT_MEDIUM = 'text-medium',
	TEXT_LARGE = 'text-large',
	HEADING_SMALL = 'heading-small',
	HEADING_MEDIUM = 'heading-medium',
	HEADING_LARGE = 'heading-large',
	HEADING_X_LARGE = 'heading-x-large',
	HEADING_XX_LARGE = 'heading-xx-large',
	HEADING_XXX_LARGE = 'heading-xxx-large',
	HEADING_XXXX_LARGE = 'heading-xxxx-large',
	DISPLAY_BIG = 'display-big',
	DISPLAY_BIGGER = 'display-bigger',
	DISPLAY_BIGGEST = 'display-biggest',
}

interface TypographyProps {
	variant: TypographyVariant;
	color: string;
}

export default class Typography extends React.Component<TypographyProps, {}> {
	constructor(props: TypographyProps) {
		super(props);
	}

	public render = (): JSX.Element[] => {
		return ([
			// Text XSmall
			this.props.variant === TypographyVariant.TEXT_X_SMALL &&
			<p key='text-x-small' className='text-x-small' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Text Small
			this.props.variant === TypographyVariant.TEXT_SMALL &&
			<p key='text-small' className='text-small' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Text Medium
			this.props.variant === TypographyVariant.TEXT_MEDIUM &&
			<p key='text-medium' className='text-medium' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Text Large
			this.props.variant === TypographyVariant.TEXT_LARGE &&
			<p key='text-large' className='text-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading Small
			this.props.variant === TypographyVariant.HEADING_SMALL &&
			<p key='heading-small' className='heading-small' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading Medium
			this.props.variant === TypographyVariant.HEADING_MEDIUM &&
			<p key='heading-medium' className='heading-medium' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading Large
			this.props.variant === TypographyVariant.HEADING_LARGE &&
			<p key='heading-large' className='heading-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading XLarge
			this.props.variant === TypographyVariant.HEADING_X_LARGE &&
			<p key='heading-x-large' className='heading-x-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading XXLarge
			this.props.variant === TypographyVariant.HEADING_XX_LARGE &&
			<p key='heading-xx-large' className='heading-xx-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading XXXLarge
			this.props.variant === TypographyVariant.HEADING_XXX_LARGE &&
			<p key='heading-xxx-large' className='heading-xxx-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Heading XXXXLarge
			this.props.variant === TypographyVariant.HEADING_XXXX_LARGE &&
			<p key='heading-xxxx-large' className='heading-xxxx-large' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Display Big
			this.props.variant === TypographyVariant.DISPLAY_BIG &&
			<p key='display-big' className='display-big' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Display Big
			this.props.variant === TypographyVariant.DISPLAY_BIGGER &&
			<p key='display-bigger' className='display-bigger' style={{color: this.props.color}}>
				{this.props.children}
			</p>,

			// Display Big
			this.props.variant === TypographyVariant.DISPLAY_BIGGEST &&
			<p key='display-biggest' className='display-biggest' style={{color: this.props.color}}>
				{this.props.children}
			</p>,
		]);
	}
}