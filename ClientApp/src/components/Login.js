import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Button from '@material-ui/core/Button';

const useStyles = (theme) => ({
	rootLogin: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	loginForm: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	loginInput: {
		marginLeft: theme.spacing(1),
		flex: 1,
	},
	loginButton: {
		margin: theme.spacing(3, 0, 2),
	},
	loginIconButton: {
		padding: 10,
	},
	errorMessage: {
		textAlign: 'center',
	}
});

class Login extends Component {

	render() {
		const { classes, apiKey, loggingIn, handleApiFieldChange, getWorkspaces, loginError } = this.props;

		return (
			<Container component="main" maxWidth="xs">
				<div className={classes.rootLogin}>
					<Avatar className={classes.avatar}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
						</Typography>
					<Container className={classes.loginForm}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							name='apiKey'
							label="Api key"
							id="apiKey"
							autoFocus
							value={apiKey}
							disabled={loggingIn}
							onChange={handleApiFieldChange}
							inputProps={{ 'aria-label': 'login with API key' }}
						/>
						<Button
							type="submit"
							color="primary"
							fullWidth
							variant="contained"
							onClick={() => getWorkspaces()}
							disabled={loggingIn}
							className={classes.loginButton}
						>
							{loggingIn && <CircularProgress size={14} />}
							{!loggingIn && 'Sign in'}
						</Button>
						<Grid container>
							<Grid item xs={12}>
								<Link href="https://toggl.com/app/profile" target="_blank" rel="noopener" variant="body2">
									You can find your API Key in your Toggl profile settings
								</Link>
							</Grid>
							<Grid item xs={12}>
								<Typography color="error" variant="subtitle1" className={classes.errorMessage}>
									{loginError}
								</Typography>
							</Grid>
						</Grid>
					</Container>
				</div>
			</Container>
		)
	}
}

export default withStyles(useStyles)(Login)