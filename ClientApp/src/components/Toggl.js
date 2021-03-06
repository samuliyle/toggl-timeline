﻿import React, { Component } from 'react';
import { Chart } from 'react-google-charts';
import {
    sumBy, isEmpty, parseInt, isNil, head, find, map, size, concat, forEach,
} from 'lodash';
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
import { DatePicker } from '@material-ui/pickers';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import RefreshIcon from '@material-ui/icons/Refresh';
import moment from 'moment';

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
        marginTop: 15,
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
    errorMessage: {
        textAlign: 'center',
    },
    reloadIconButton: {
        '& svg': {
            fontSize: 48,
        },
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
    settingsLabel: {
        fontSize: 12,
        color: theme.palette.grey[650],
        fontWeight: 500,
        margin: 0,
        marginBottom: 2,
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
        },
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
    selectedWorkspace: null,
    selectedDate: moment(),
    workspaces: [],
    togglData: [],
    loadingActivities: false,
    loadingActivitiesError: '',
    totalTrackedTime: 0,
    totalIdleTime: 0,
    showIdle: false,
    singleLine: false,
};

class Toggl extends Component {
    static toHourMinuteFormat(time) {
        const tempTime = moment.duration(time);
        return `${tempTime.hours()} h ${tempTime.minutes()} min`;
    }

    constructor(props) {
        super(props);

        const state = { ...originalState };

        state.apiKey = localStorage.getItem('togglApiKey') || '';
        const selectedWorkspace = localStorage.getItem('togglWorkspace');
        state.selectedWorkspace = selectedWorkspace ? parseInt(selectedWorkspace, 10) : null;

        this.state = state;
    }

    componentDidMount() {
        const { apiKey } = this.state;

        if (!isEmpty(apiKey)) {
            this.getWorkspaces();
        }
    }

    resetState = () => {
        this.setState(originalState);
    }

    setLogStatus = (status) => {
        if (status === false) {
            this.resetState();
        } else {
            this.setState({ loggedIn: true });
        }
    }

    handleSwitchChange = (event) => {
        this.setState({ [event.target.name]: event.target.checked });
    };

    handleApiFieldChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleDateChange = (newDate) => {
        this.setState({ selectedDate: newDate }, this.getTogglReport);
    };

    handleWorkspaceChange = (event) => {
        localStorage.setItem('togglWorkspace', event.target.value);
        this.setState({ selectedWorkspace: event.target.value }, this.getTogglReport);
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

    getWorkspaces = () => {
        const { apiKey, selectedWorkspace } = this.state;
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
                    let currentSelectedWorkspace = selectedWorkspace;
                    if (!isEmpty(data)) {
                        // Does selected workspace exist
                        if (!isNil(currentSelectedWorkspace)) {
                            const workspace = find(data, { id: currentSelectedWorkspace });
                            if (!isNil(workspace)) {
                                // Selected work space exists
                                currentSelectedWorkspace = workspace.id;
                            }
                        }
                        if (isNil(currentSelectedWorkspace)) {
                            // No existing selected workspace, pick first workspace
                            currentSelectedWorkspace = head(data).id;
                        }
                        localStorage.setItem('togglWorkspace', currentSelectedWorkspace);
                    }
                    localStorage.setItem('togglApiKey', apiKey);
                    this.setState(
                        {
                            loggedIn: true,
                            apiKey,
                            selectedWorkspace: currentSelectedWorkspace,
                            workspaces: data,
                            loadingActivities: true,
                            loggingIn: false,
                        }, this.getTogglReport,
                    );
                })
                .catch(() => {
                    localStorage.setItem('togglApiKey', '');
                    this.setState({
                        loggedIn: false, loggingIn: false, apiKey: '', loginError: 'Failed to sign in',
                    });
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
                    const totalTracked = sumBy(data, 'dur');
                    let totalIdle = 0;
                    const idleActivities = [];
                    for (let i = 0; i < data.length; i++) {
                        if (i + 1 !== data.length) {
                            const endOfFirst = moment(data[i].end);
                            const startOfFollowing = moment(data[i + 1].start);
                            // Ignore overlapping
                            if (startOfFollowing.isAfter(endOfFirst)) {
                                const idleDuration = moment.duration(startOfFollowing.diff(endOfFirst)).asMilliseconds();
                                totalIdle += idleDuration;
                                idleActivities.push({
                                    start: endOfFirst.format(),
                                    end: startOfFollowing.format(),
                                    dur: idleDuration,
                                    id: i,
                                    description: 'Idle',
                                    project: 'CreatedIdleProject',
                                    tags: [],
                                    user: '',
                                });
                            }
                        }
                    }
                    this.setState({
                        loadingActivitiesError: '',
                        togglData: concat(data, idleActivities),
                        totalIdleTime: totalIdle,
                        totalTrackedTime: totalTracked,
                        loadingActivities: false,
                    });
                })
                .catch(() => {
                    this.setState({ loadingActivities: false, loadingActivitiesError: 'Failed to load data' });
                });
        }
    }

    renderTogglList() {
        const { classes } = this.props;
        const {
            togglData, showIdle, singleLine, loadingActivitiesError,
        } = this.state;

        if (isEmpty(togglData)) {
            if (!isEmpty(loadingActivitiesError)) {
                return (
                    <div className={classes.errorMessage}>
                        <Typography color="error" className={classes.errorMessage}>
                            {loadingActivitiesError}
                        </Typography>
                        <br />
                        <IconButton
                            className={classes.reloadIconButton}
                            color="primary"
                            onClick={() => this.getTogglReport()}
                            aria-label="reload toggl data"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </div>
                );
            }

            return (
                <Typography className={classes.errorMessage}>
                    No data found for this date
                </Typography>
            );
        }

        const timelineData = [];
        forEach(togglData, (toggl) => {
            if (!showIdle && toggl.project === 'CreatedIdleProject') {
                return;
            }
            timelineData.push([(singleLine ? 'Toggl' : toggl.description),
                toggl.description, new Date(toggl.start), new Date(toggl.end)]);
        });
        const columns = [
            { type: 'string', id: 'Toggl' },
            { type: 'string', id: 'Description' },
            { type: 'date', id: 'Start' },
            { type: 'date', id: 'End' },
        ];
        // eslint-disable-next-line max-len
        const fontName = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        return (
            <div>
                <Chart
                    width="100%"
                    height="500px"
                    chartType="Timeline"
                    loader={<div>Loading Chart</div>}
                    columns={columns}
                    rows={timelineData}
                    options={{
                        hAxis: {
                            format: 'HH:mm',
                        },
                        timeline: {
                            rowLabelStyle: { fontName },
                            barLabelStyle: { fontName },
                        },
                    }}
                    rootProps={{ 'data-testid': '1' }}
                />
            </div>
        );
    }

    render() {
        const { classes } = this.props;
        const {
            apiKey, loggingIn, loginError, loggedIn, workspaces, selectedWorkspace,
            totalTrackedTime, totalIdleTime, singleLine, selectedDate, showIdle, loadingActivities,
        } = this.state;
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
            const currentWorkspace = find(workspaces, { id: selectedWorkspace });

            if (isNil(currentWorkspace)) {
                content = (
                    <Typography color="error" variant="subtitle1">
                        No workspaces found
                    </Typography>
                );
            } else {
                let workspaceSelect = '';
                if (size(workspaces) > 1) {
                    // eslint-disable-next-line max-len
                    const workSpaceMenuItems = map(workspaces, (workspace) => <MenuItem key={workspace.id} value={workspace.id}>{workspace.name}</MenuItem>);
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
                );

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
                                    <Box display="flex" className={classes.statContainer}>
                                        <Box p={2} flex="auto">
                                            <p className={classes.statLabel}>Tracked time</p>
                                            <p className={classes.statValue}>{Toggl.toHourMinuteFormat(totalTrackedTime)}</p>
                                        </Box>
                                        <Divider light variant="middle" orientation="vertical" flexItem />
                                        <Box p={2} flex="auto">
                                            <p className={classes.statLabel}>Idle time</p>
                                            <p className={classes.statValue}>{Toggl.toHourMinuteFormat(totalIdleTime)}</p>
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
                                            <p className={classes.settingsLabel}>Group all together</p>
                                            <Switch
                                                checked={singleLine}
                                                onChange={this.handleSwitchChange}
                                                color="primary"
                                                name="singleLine"
                                            />
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            <p className={classes.settingsLabel}>Date</p>
                                            <IconButton className={classes.dateArrow} onClick={() => { this.handleDateArrowChange(-1); }}>
                                                <ArrowBackIosIcon />
                                            </IconButton>
                                            <DatePicker
                                                disableFuture
                                                name="selectedDate"
                                                value={selectedDate}
                                                onChange={this.handleDateChange}
                                                animateYearScrolling
                                            />
                                            <IconButton className={classes.dateArrow} onClick={() => { this.handleDateArrowChange(1); }}>
                                                <ArrowForwardIosIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item sm={3} xs={12}>
                                            <p className={classes.settingsLabel}>Create idle category</p>
                                            <Switch
                                                checked={showIdle}
                                                onChange={this.handleSwitchChange}
                                                color="primary"
                                                name="showIdle"
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>
                                <Divider light />
                                <div className={classes.timelineContainer}>
                                    {loadingActivities
                                        ? <LinearProgress />
                                        : this.renderTogglList()}
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
}

export default withStyles(useStyles)(Toggl);
