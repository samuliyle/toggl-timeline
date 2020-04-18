import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import { NavMenu } from './components/NavMenu';
import Toggl from './components/Toggl';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import './custom.css'

const theme = createMuiTheme({
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


export default class App extends Component {
	static displayName = App.name;

	render() {
		return (
			<ThemeProvider theme={theme}>
				<div>
					<NavMenu />
					<Container>
						<Toggl />
					</Container>
				</div>
			</ThemeProvider>
		);
	}
}
