import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { sumBy, isEmpty, parseInt, isNil, head, find } from "lodash";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import ScheduleIcon from '@material-ui/icons/Schedule';
import SnoozeIcon from '@material-ui/icons/Snooze';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import FormGroup from '@material-ui/core/FormGroup';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Button from '@material-ui/core/Button';
import moment from 'moment'

const useStyles = (theme) => ({
	root: {
		flexGrow: 1,
	},
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
	divider: {
		height: 28,
		margin: 4,
	},
	card: {
		borderRadius: 12,
		minWidth: 256,
		textAlign: 'center',
	},
	avatar: {
		width: 60,
		height: 60,
		margin: 'auto',
	},
	heading: {
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: '0.5px',
		marginTop: 8,
		marginBottom: 0,
	},
	subheader: {
		fontSize: 14,
		color: theme.palette.grey[500],
		marginBottom: '0.875em',
	},
	statLabel: {
		fontSize: 12,
		color: theme.palette.grey[500],
		fontWeight: 500,
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
		margin: 0,
	},
	statValue: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
		letterSpacing: '1px',
	},
	paper: {
		padding: theme.spacing(2),
		//    textAlign: 'center',
		//    color: theme.palette.text.secondary,
	},
});

class Toggl extends Component {
	constructor(props) {
		super(props);

		const apiKey = localStorage.getItem('togglApiKey') || '';
		let selectedWorkspace = localStorage.getItem('togglWorkspace');
		selectedWorkspace = selectedWorkspace ? parseInt(selectedWorkspace, 10) : null;

		this.state = {
			apiKey: apiKey,
			loggedIn: false,
			loggingIn: false,
			loginError: 'test',
			loadingWorkspaces: false,
			selectedWorkspace: selectedWorkspace,
			workspaces: [],
			togglData: [],
			loadingActivities: false,
			totalTrackedTime: 0,
			totalIdleTime: 0,
			showIdle: false,
			singleLine: false,
		};
	}

	static toHourMinuteFormat(time) {
		const tempTime = moment.duration(time);
		return `${tempTime.hours()} h ${tempTime.minutes()} min`
	}

	handleLineChange = (event) => {
		this.setState({ ...this.state, [event.target.name]: event.target.checked });
	};

	handleApiFieldChange = (event) => {
		console.log(event);
		this.setState({ ...this.state, [event.target.name]: event.target.value });
	};

	componentDidMount() {
		if (!isEmpty(this.state.apiKey)) {
			this.getWorkspaces();
		}
	}

	renderTogglList() {
		const te = this.state.togglData.map((toggl) => [(this.state.singleLine ? 'Toggl' : toggl.description), toggl.description, new Date(toggl.start), new Date(toggl.end)]);
		console.log(te);
		const columns = [
			{ type: 'string', id: 'Toggl' },
			{ type: 'string', id: 'Description' },
			{ type: 'date', id: 'Start' },
			{ type: 'date', id: 'End' },
		];
		return (
			<div>
				<Chart
					width={'100%'}
					height={'500px'}
					chartType="Timeline"
					loader={<div>Loading Chart</div>}
					columns={columns}
					rows={te}
					rootProps={{ 'data-testid': '1' }}
				/>
			</div>
		);
	}

	render() {
		const { classes } = this.props;

		if (!this.state.loggedIn) {
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
								label="apiKey"
								id="apiKey"
								autoFocus
								value={this.state.apiKey}
								disabled={this.state.loggingIn}
								onChange={this.handleApiFieldChange}
								inputProps={{ 'aria-label': 'login with API key' }}
							/>
							<Button
								type="submit"
								color="primary"
								fullWidth
								variant="contained"
								onClick={() => this.getWorkspaces()} 
								disabled={this.state.loggingIn}
								className={classes.loginButton}
							>
								{this.state.loggingIn && <CircularProgress size={14} />}
								{!this.state.loggingIn && 'Sign in'}
							</Button>
							<Grid container>
								<Grid item xs={12}>
									<Link href="https://toggl.com/app/profile" target="_blank" rel="noopener" variant="body2">
										You can find your API Key in your Toggl profile settings
								</Link>
								</Grid>
								<Grid item xs={12}>
									<Typography color="error" variant="subtitle1">
										{this.state.loginError}
									</Typography>
								</Grid>
							</Grid>
						</Container>
					</div>
				</Container>
			)
		}

		const currentWorkspace = find(this.state.workspaces, { 'id': this.state.selectedWorkspace });
		console.log(currentWorkspace);

		if (isNil(currentWorkspace)) {
			return (
				<Typography color="error" variant="subtitle1">
					No workspaces found
				</Typography>
			)
		}

		return (
			<div className={classes.root}>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<Card className={classes.card} elevation={0}>
								<CardContent>
									<Typography className={classes.heading} variant="h3">
										{currentWorkspace.name}
									</Typography>
									<span className={classes.subheader}>
										{moment(currentWorkspace.at).format('LL')}
									</span>
								</CardContent>
								<Divider light />
								<Box display={'flex'}>
									<Box p={2} flex={'auto'}>
										<p className={classes.statLabel}>Tracked time</p>
										<p className={classes.statValue}>{Toggl.toHourMinuteFormat(this.state.totalTrackedTime)}</p>
									</Box>
									<Box p={2} flex={'auto'}>
										<p className={classes.statLabel}>Idle time</p>
										<p className={classes.statValue}>{Toggl.toHourMinuteFormat(this.state.totalIdleTime)}</p>
									</Box>
								</Box>
							</Card>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<FormGroup row>
								<FormControlLabel
									control={<Switch checked={this.state.singleLine} onChange={this.handleLineChange} name="singleLine" />}
									label="Single line"
								/>
							</FormGroup>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							{this.state.loadingActivities 
								? <LinearProgress />
								: this.renderTogglList()
							}
						</Paper>
					</Grid>
				</Grid>
			</div>
		);
	}

	getWorkspaces() {
		const apiKey = this.state.apiKey;
		if (!isEmpty(apiKey)) {
			this.setState({ loggingIn: true, loadingActivities: true});
			fetch(`Toggl/GetWorkspaces?apiKey=${apiKey}`)
				.then((resp) => {
					if (!resp.ok) {
						return Promise.reject(resp);
					}
					return resp.json();
				})
				.then((data) => {
					console.log(data);
					let selectedWorkspace = this.state.selectedWorkspace;
					console.log(selectedWorkspace);
					if (!isEmpty(data)) {
						if (!isNil(selectedWorkspace)) {
							console.log('existing found');
							const workspace = find(data, { 'id': selectedWorkspace });
							console.log({ workspace });
							if (!isNil(workspace)) {
								console.log('existing ok');
								selectedWorkspace = workspace.id;
							}
						}
						if (isNil(selectedWorkspace)) {
							console.log('no existing. selected head')
							selectedWorkspace = head(data).id;
						}
						localStorage.setItem('togglWorkspace', selectedWorkspace);
					}
					localStorage.setItem('togglApiKey', apiKey);
					this.setState(
						{
							apiKey: apiKey, selectedWorkspace: selectedWorkspace, workspaces: data, loadingWorkspaces: false, loggedIn: true, loadingActivities: true, loggingIn: false
						}, this.getTogglReport);
				})
				.catch((error) => {
					console.log(error);
					localStorage.setItem('togglApiKey', '');
					this.setState({ loggedIn: false, loggingIn: false, loadingWorkspaces: false, apiKey: '', loginError: 'Failed to sign in' });
				});
		}
	}

	getTogglReport() {
		const { apiKey, selectedWorkspace } = this.state;
		if (!isEmpty(apiKey) && !isNil(selectedWorkspace)) {
			this.setState({ loadingActivities: true });
			fetch(`Toggl/GetDetailedReport?apiKey=${apiKey}&workspace=${selectedWorkspace}`)
				.then((resp) => {
					if (!resp.ok) {
						return Promise.reject(resp);
					}
					return resp.json();
				})
				.then((data) => {
					console.log(data);
					const totalTracked = sumBy(data.data, 'dur');
					let totalIdle = 0;
					for (let i = 0; i < data.data.length; i++) {
						if (i + 1 !== data.data.length) {
							const endOfFirst = moment(data.data[i].end);
							const startOfFollowing = moment(data.data[i + 1].start);
							totalIdle += moment.duration(startOfFollowing.diff(endOfFirst)).asMilliseconds();
						}
					}
					this.setState({ togglData: data.data, totalIdleTime: totalIdle, totalTrackedTime: totalTracked, loadingActivities: false });
				})
				.catch((error) => {
					console.log(error);
					// TODO: error msg
					this.setState({ loadingActivities: false });
				});
		}
	}
}

export default withStyles(useStyles)(Toggl)
