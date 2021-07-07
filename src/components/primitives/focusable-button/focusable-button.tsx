import React, { FC } from 'react';

interface FocusableButtonProps {
	label: string;
}

const FocusableButton: FC<FocusableButtonProps> = (props): JSX.Element => {
	return (
		<p>
			{props.label}
		</p>
	);
}
export default FocusableButton;
