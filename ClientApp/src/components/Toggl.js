import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { sumBy, isEmpty, parseInt, isNil, head, find, map, size } from "lodash";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DatePicker } from "@material-ui/pickers";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
	timelineContainer: {
		marginTop: 10,
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
	dateArrow: {
		paddingTop: 7,
	},
	statContainer: {
		paddingTop: 16,
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
		fontFamily: 'Fira Sans, sans-serif',
		letterSpacing: '1px',
	},
	paper: {
		padding: theme.spacing(2),
		boxShadow: '0 2px 4px -2px rgba(0,0,0,0.24), 0 4px 10px -2px rgba(0, 0, 0, 0.2)',
	},
	title: {
		flexGrow: 1,
	},
	appBarCustom: {
		background: 'linear-gradient(45deg, #2196F3 50%, #07bae4 90%)',
		marginBottom: 7,
	},
	workspaceDropdown: {
		color: 'white',
		marginRight: 5,
		lineHeight: 1.75,
		'&:before': {
			borderColor: 'white',
		},
		'&:after': {
			borderColor: 'white',
		}
	},
	workspaceDropdownIcon: {
		fill: 'white',
	},
});

const originalState = {
	apiKey: '',
	loggedIn: false,
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
		} else {
			this.setState({ loggedIn: true });
		}
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

	handleWorkspaceChange = (event) => {
		this.setState({ ...this.state, selectedWorkspace: event.target.value }, this.getTogglReport);
	};

	handleDateArrowChange = (amountOfDays) => {
		const { selectedDate, loadingActivities } = this.state;
		if (!loadingActivities) {
			const nextDate = moment(selectedDate);
			nextDate.add(amountOfDays, 'day');
			if (!nextDate.isAfter(moment(), 'day')) {
				this.setState({ selectedDate: nextDate }, this.getTogglReport);
			}
		}
	}

	componentDidMount() {
		if (!isEmpty(this.state.apiKey)) {
			this.getWorkspaces();
		}
	}

	renderTogglList() {
		const { togglData } = this.state;

		if (isEmpty(togglData)) {
			return (<div>
				<Typography>
					oh heck
				</Typography>
			</div>)
		}

		const te = togglData.map((toggl) => [(this.state.singleLine ? 'Toggl' : toggl.description), toggl.description, new Date(toggl.start), new Date(toggl.end)]);
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
		const { classes } = this.props;
		const { apiKey, loggingIn, loginError, loggedIn, workspaces, selectedWorkspace } = this.state;
		let content = null;
		let loggedinAppBarContent = '';

		if (!loggedIn) {
			content = (
				<Login
					apiKey={apiKey}
					loggingIn={loggingIn}
					loginError={loginError}
					handleApiFieldChange={this.handleApiFieldChange}
					getWorkspaces={this.getWorkspaces}
				/>
			);
		}

		if (isNil(content)) {
			const currentWorkspace = find(workspaces, { 'id': selectedWorkspace });

			if (isNil(currentWorkspace)) {
				content = (
					<Typography color="error" variant="subtitle1">
						No workspaces found
					</Typography>
				);
			} else {
				let workspaceSelect = '';
				if (size(workspaces) > 1) {
					const workSpaceMenuItems = map(workspaces, (workspace) => {
						return (<MenuItem key={workspace.id} value={workspace.id}>{workspace.name}</MenuItem>)
					})
					workspaceSelect = (
						<Select
							className={classes.workspaceDropdown}
							value={selectedWorkspace}
							disableUnderline
							inputProps={{
								classes: {
									icon: classes.workspaceDropdownIcon,
								},
							}}
							onChange={this.handleWorkspaceChange}
						>
							{workSpaceMenuItems}
						</Select>
					);
				}

				loggedinAppBarContent = (
					<div>
						{workspaceSelect}
						<Button onClick={() => this.setLogStatus(false)} color="inherit">Logout</Button>
					</div>
				)

				content = (
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
									<Box display={'flex'} className={classes.statContainer}>
										<Box p={2} flex={'auto'}>
											<p className={classes.statLabel}>Tracked time</p>
											<p className={classes.statValue}>{Toggl.toHourMinuteFormat(this.state.totalTrackedTime)}</p>
										</Box>
										<Divider light variant="middle" orientation="vertical" flexItem />
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
								<Card className={classes.card} elevation={0}>
									<Grid container spacing={3}>
										<Grid item sm={3} xs={12}>
											<p className={classes.statLabel}>Single line</p>
											<Switch
												checked={this.state.singleLine}
												onChange={this.handleLineChange}
												color="primary"
												name="singleLine" />
										</Grid>
										<Grid item sm={6} xs={12}>
											<p className={classes.statLabel}>Date</p>
											<IconButton className={classes.dateArrow} onClick={() => { this.handleDateArrowChange(-1) }}>
												<ArrowBackIosIcon />
											</IconButton>
											<DatePicker
												disableFuture
												name="selectedDate"
												value={this.state.selectedDate}
												onChange={this.handleDateChange}
												animateYearScrolling
											/>
											<IconButton className={classes.dateArrow} onClick={() => { this.handleDateArrowChange(1) }}>
												<ArrowForwardIosIcon />
											</IconButton>
										</Grid>
										<Grid item sm={3} xs={12}>
											<p className={classes.statLabel}>Third setting</p>
										</Grid>
									</Grid>
								</Card>
								<Divider light />
								<div className={classes.timelineContainer}>
									{this.state.loadingActivities
										? <LinearProgress />
										: this.renderTogglList()
									}
								</div>
							</Paper>
						</Grid>
					</Grid>
				);
			}
		}

		return (
			<div>
				<div className={classes.root}>
					<AppBar position="static" className={classes.appBarCustom}>
						<Toolbar>
							<Typography variant="h6" className={classes.title}>
								Toggl timeline
								</Typography>
							{loggedinAppBarContent}
						</Toolbar>
					</AppBar>
				</div>
				<Container className={classes.root}>
					{content}
				</Container>
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
					this.setState(
						{
							loggedIn: true, apiKey: apiKey, selectedWorkspace: selectedWorkspace, workspaces: data, loadingWorkspaces: false, loadingActivities: true, loggingIn: false
						}, this.getTogglReport);
				})
				.catch((error) => {
					console.log(error);
					localStorage.setItem('togglApiKey', '');
					this.setState({ loggedIn: false, loggingIn: false, loadingWorkspaces: false, apiKey: '', loginError: 'Failed to sign in' });
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
