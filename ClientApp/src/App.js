import React from 'react';
import Toggl from './components/Toggl';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import './custom.css'

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#2196F3',
		},
	},
	typography: {
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),
	}
});

export default function App() {

	return (
		<MuiPickersUtilsProvider utils={MomentUtils}>
			<ThemeProvider theme={theme}>
				<Toggl />
			</ThemeProvider>
		</MuiPickersUtilsProvider>
	);
}
