import { withStyles } from "@material-ui/core";

import Button from "@material-ui/core/Button";

export const ColorButton = withStyles(() => ({
	root: {
		color: '#ededed',
		backgroundColor: '#474747',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#5c5c5c',
			boxShadow: 'none'
		},
		borderRadius: '16px',
		boxShadow: 'none',
		display: 'inline-flex',
		justifyContent: 'flex-start'
	},
}))(Button);

export const LabelButton = withStyles(() => ({
	root: {
		color: '#ededed',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#5c5c5c',
			boxShadow: 'none'
		},
		borderRadius: '16px',
		boxShadow: 'none',
		fontFamily: 'Inter',
		fontWeight: 700,
		fontSize: '16px',
		lineHeight: '20px'
	},
}))(Button);
