import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Toggl from './components/Toggl';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

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

const useStyles = makeStyles({
	root: {
		flexGrow: 1,
	},
	title: {
		flexGrow: 1,
	},
	appBarCustom: {
		background: 'linear-gradient(45deg, #2196F3 50%, #07bae4 90%)',
	}
});

export default function App() {
	const classes = useStyles();
	const [loggedIn, setLoggedIn] = useState(false);

	const setLoggedInStatus = (loggedInStatus) => { setLoggedIn(loggedInStatus) }

	return (
		<ThemeProvider theme={theme}>
			<div>
				<div className={classes.root}>
					<AppBar position="static" className={classes.appBarCustom}>
						<Toolbar>
							<Typography variant="h6" className={classes.title}>
								Toggl timeline
								</Typography>
							{loggedIn
								? <Button onClick={() => setLoggedInStatus(false)} color="inherit">Logout</Button>
								: ''}

						</Toolbar>
					</AppBar>
				</div>
				<Container>
					<Toggl loggedIn={loggedIn} setLoggedInStatus={setLoggedInStatus} />
				</Container>
			</div>
		</ThemeProvider>
	);
}
