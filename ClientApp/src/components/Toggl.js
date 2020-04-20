import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { sumBy, isEmpty, parseInt, isNil, head, find } from "lodash";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import FormGroup from '@material-ui/core/FormGroup';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DatePicker } from "@material-ui/pickers";

import moment from 'moment'

import Login from './Login';

const useStyles = (theme) => ({
	root: {
		flexGrow: 1,
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
	},
});

const originalState = {
	apiKey: '',
	loggingIn: false,
	loginError: '',
	loadingWorkspaces: false,
	selectedWorkspace: null,
	selectedDate: moment(),
	workspaces: [],
	togglData: [],
	loadingActivities: false,
	totalTrackedTime: 0,
	totalIdleTime: 0,
	showIdle: false,
	singleLine: false,
};

class Toggl extends Component {
	constructor(props) {
		super(props);

		const state = { ...originalState };

		state.apiKey = localStorage.getItem('togglApiKey') || '';
		let selectedWorkspace = localStorage.getItem('togglWorkspace');
		state.selectedWorkspace = selectedWorkspace ? parseInt(selectedWorkspace, 10) : null;

		this.state = state;
	}

	static toHourMinuteFormat(time) {
		const tempTime = moment.duration(time);
		return `${tempTime.hours()} h ${tempTime.minutes()} min`
	}

	resetState = () => {
		this.setState(originalState, () => { console.log(this.state) });
	}

	setLogStatus = (status) => {
		if (status === false) {
			this.resetState();
		}
		this.props.setLoggedInStatus(status);
	}

	handleLineChange = (event) => {
		this.setState({ ...this.state, [event.target.name]: event.target.checked });
	};

	handleApiFieldChange = (event) => {
		this.setState({ ...this.state, [event.target.name]: event.target.value });
	};

	handleDateChange = (newDate) => {
		this.setState({ ...this.state, selectedDate: newDate }, this.getTogglReport);
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
		const fontName = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
		return (
			<div>
				<Chart
					width={'100%'}
					height={'500px'}
					chartType="Timeline"
					loader={<div>Loading Chart</div>}
					columns={columns}
					rows={te}
					options={{
						hAxis: {
							format: 'HH:mm'
						},
						timeline: {
							rowLabelStyle: { fontName: fontName },
							barLabelStyle: { fontName: fontName }
						}
					}}
					rootProps={{ 'data-testid': '1' }}
				/>
			</div>
		);
	}

	render() {
		const { classes, loggedIn } = this.props;
		const { apiKey, loggingIn, loginError } = this.state;

		if (!loggedIn) {
			return (
				<Login
					apiKey={apiKey}
					loggingIn={loggingIn}
					loginError={loginError}
					handleApiFieldChange={this.handleApiFieldChange}
					getWorkspaces={this.getWorkspaces}
				/>
			)
		}

		const currentWorkspace = find(this.state.workspaces, { 'id': this.state.selectedWorkspace });

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
							<DatePicker
								label="Basic example"
								name="selectedDate"
								value={this.state.selectedDate}
								onChange={this.handleDateChange}
								animateYearScrolling
							/>
							<Typography>
								{this.state.selectedDate.format('YYYY-MM-DDTHH:mm:ss')}
							</Typography>
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

	getWorkspaces = () => {
		const apiKey = this.state.apiKey;
		if (!isEmpty(apiKey)) {
			this.setState({ loggingIn: true, loadingActivities: true });
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
					this.props.setLoggedInStatus(true);
					this.setState(
						{
							apiKey: apiKey, selectedWorkspace: selectedWorkspace, workspaces: data, loadingWorkspaces: false, loadingActivities: true, loggingIn: false
						}, this.getTogglReport);
				})
				.catch((error) => {
					console.log(error);
					localStorage.setItem('togglApiKey', '');
					this.props.setLoggedInStatus(false);
					this.setState({ loggingIn: false, loadingWorkspaces: false, apiKey: '', loginError: 'Failed to sign in' });
				});
		}
	}

	getTogglReport = () => {
		const { apiKey, selectedWorkspace, selectedDate } = this.state;
		if (!isEmpty(apiKey) && !isNil(selectedWorkspace)) {
			this.setState({ loadingActivities: true });
			const today = selectedDate.format('YYYY-MM-DDTHH:mm:ss');
			fetch(`Toggl/GetDetailedReport?date=${today}&apiKey=${apiKey}&workspace=${selectedWorkspace}`)
				.then((resp) => {
					if (!resp.ok) {
						return Promise.reject(resp);
					}
					return resp.json();
				})
				.then((data) => {
					console.log(data);
					const totalTracked = sumBy(data, 'dur');
					let totalIdle = 0;
					for (let i = 0; i < data.length; i++) {
						if (i + 1 !== data.length) {
							const endOfFirst = moment(data[i].end);
							const startOfFollowing = moment(data[i + 1].start);
							totalIdle += moment.duration(startOfFollowing.diff(endOfFirst)).asMilliseconds();
						}
					}
					this.setState({ togglData: data, totalIdleTime: totalIdle, totalTrackedTime: totalTracked, loadingActivities: false });
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
