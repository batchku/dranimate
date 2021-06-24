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
	},
}))(Button);
