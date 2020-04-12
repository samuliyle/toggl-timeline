import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { sumBy } from "lodash";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = (theme) => ({
	root: {
		flexGrow: 1,
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
		this.state = {
			togglData: [],
			loading: true,
			totalTrackedTime: 0,
			totalIdleTime: 0,
			showIdle: false,
			singleLine: false,
		};
	}

	handleLineChange = (event) => {
		this.setState({ ...this.state, [event.target.name]: event.target.checked });
	};

	componentDidMount() {
		this.getTogglReport();
	}

	renderTogglList(togglData) {
		const te = togglData.map((toggl) => [(this.state.singleLine ? 'Toggl' : toggl.description), toggl.description, new Date(toggl.start), new Date(toggl.end)]);
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

		let contents = this.state.loading
			? <p><em>Loading...</em></p>
			: this.renderTogglList(this.state.togglData);

		return (
			<div className={classes.root}>
				<Grid container spacing={3}>
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
							{contents}
						</Paper>
					</Grid>
				</Grid>
			</div>
		);
	}

	async getTogglReport() {
		const response = await fetch('Toggl/GetDetailedReport');
		const data = await response.json();
		const sum = sumBy(data.data, 'dur');
		this.setState({ togglData: data.data, totalTrackedTime: sum, loading: false });
		console.log(data);
	}
}

export default withStyles(useStyles)(Toggl)
