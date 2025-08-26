const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const dgram = require('dgram');
const { Decoder } = require('@jwetzell/posistagenet')

const { getConfigFields } = require('./config.js')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const constants = require('./constants')
const { GetVariableDefinitions, UpdateVariableDefinitions } = require('./variables')



class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {

		this.config = config;

		this.updateStatus(InstanceStatus.Disconnected);

		this.instanceState = {};
		this.debugToLogger = true;


		this.psnHost = this.config.psn_host;
		this.psnPort = this.config.psn_port;
		this.refreshRate = this.config.refresh_rate;
		this.decimals = this.config.decimals;

		this.howManyTrackers = 0;

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets


		this.client = dgram.createSocket('udp4');
		this.decoder = new Decoder()

		this.client.on('listening', () => {
			this.client.addMembership(this.psnHost);
		});
		this.client.on('message', (buffer) => {
			this.decoder.decode(buffer);
			//this.setPSNVariables();
		});
		this.client.bind(this.psnPort, '0.0.0.0');

		this.updateStatus(InstanceStatus.Ok)

		setInterval(() => {
			this.setPSNVariables();
		}, (1000/this.refreshRate));

	}


	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		let currentPsnHost = this.config.psn_host;
		let currentPsnPort = this.config.psn_port;
		let currentRefreshRate = this.config.refresh_rate;
		let currentDecimals = this.config.decimals;

		this.config = config

		if (currentPsnHost !==this.config.psn_host || currentPsnPort !== this.config.psn_port
			|| currentRefreshRate !== his.config.refresh_rate || currentDecimals !== this.config.decimals) {
			await this.init(config)
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return getConfigFields(this.id)
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {

	}

	/**
	 * Sets the connection state of this module
	 *
	 * @param isConnected
	 */
	setConnectionState(isConnected) {
		let currentState = this.instanceState['connected']

		this.updateStatus(isConnected ? InstanceStatus.Ok : InstanceStatus.Disconnected)
		this.setInstanceStates({ connected: isConnected })

		if (currentState !== isConnected) {
			// The connection state changed. Update the feedback.
			this.checkFeedbacks('connected')
		}
	}


	/**
	 * Updates the internal state of a variable within this module.
	 *
	 * Optionally updates the dynamic variable with its new value.
	 */
	setInstanceStates(values, isVariable) {
		for (const [key, value] of Object.entries(values)) {
			this.instanceState[key] = value
		}

		if (isVariable) {
			this.setVariableValues(values)
		}
	}





	/**
	 * Empties the state (variables/feedbacks) and requests the current state from the console.
	 */
	requestFullState() {
		this.emptyState()
	}

	/**
	 * Empties the state (variables/feedbacks).
	 */
	emptyState() {
		// Empty the state, but preserve the connected state.
		this.instanceState = {
			connected: this.instanceState['connected'],
		}

		//this.checkFeedbacks('macroisfired','pending_cue', 'active_cue', 'connected')
	}


	setPSNVariables() {

		let updateDefs = {}
		if (this.decoder.system_name) {
			//console.log(`System Name: ${this.decoder.system_name}`);
			updateDefs['system_name'] = this.decoder.system_name;


		}
		if (Object.keys(this.decoder.trackers).length > 0) {
			//console.log(`Tracker Count: ${Object.keys(this.decoder.trackers).length}`);
			//console.debug(JSON.stringify(this.decoder.trackers, (_, v) => typeof v === 'bigint' ? v.toString() : v))
			updateDefs[`system_tracker_count`] = Object.keys(this.decoder.trackers).length;

			//Update Defs to Generate variables
			this.howManyTrackers = Object.keys(this.decoder.trackers).length;
			this.updateVariableDefinitions()
		}


		//console.debug(this.decoder.tracker)

		Object.entries(this.decoder.trackers).forEach(([trackerId, tracker]) => {
			if (tracker.tracker_name) {
				//console.log(`Tracker - id: ${trackerId} | name: ${tracker.tracker_name.tracker_name}`);
				updateDefs[`tracker_${trackerId}_name`] = tracker.tracker_name.tracker_name;
			}

			if (tracker.pos) {
				//console.log(`\tpos: ${tracker.pos.x}, ${tracker.pos.y}, ${tracker.pos.z}`);
				updateDefs[`tracker_${trackerId}_pos_x`] = tracker.pos.pos_x.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_pos_y`] = tracker.pos.pos_y.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_pos_z`] = tracker.pos.pos_z.toFixed(this.decimals);
			}

			if (tracker.speed) {
				//console.log(`\tspeed: ${tracker.speed.x}, ${tracker.speed.y}, ${tracker.speed.z}`);
				updateDefs[`tracker_${trackerId}_speed_x`] = tracker.speed.x.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_speed_y`] = tracker.speed.y.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_speed_z`] = tracker.speed.z.toFixed(this.decimals);
			}

			if (tracker.ori) {
				//console.log(`\tori: ${tracker.ori.x}, ${tracker.ori.y}, ${tracker.ori.z}`);
				updateDefs[`tracker_${trackerId}_ori_x`] = tracker.ori.x.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_ori_y`] = tracker.ori.y.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_ori_z`] = tracker.ori.z.toFixed(this.decimals);
			}

			if (tracker.status) {
				//console.log(`\tstatus: ${tracker.status.validity}`);
				updateDefs[`tracker_${trackerId}_status`] = tracker.status.validity;
			}

			if (tracker.accel) {
				//console.log(`\taccel: ${tracker.accel.x}, ${tracker.accel.y}, ${tracker.accel.z}`);
				updateDefs[`tracker_${trackerId}_accel_x`] = tracker.accel.x.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_accel_y`] = tracker.accel.y.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_accel_z`] = tracker.accel.z.toFixed(this.decimals);
			}

			if (tracker.trgtpos) {
				//console.log(`\ttrgtpos: ${tracker.trgtpos.x}, ${tracker.trgtpos.y}, ${tracker.trgtpos.z}`);
				updateDefs[`tracker_${trackerId}_trgtpos_x`] = tracker.trgtpos.x.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_trgtpos_y`] = tracker.trgtpos.y.toFixed(this.decimals);
				updateDefs[`tracker_${trackerId}_trgtpos_z`] = tracker.trgtpos.z.toFixed(this.decimals);
			}

			if (tracker.timestamp) {
				//If this field is not present, you can simply use the packet timestamp as a fallback.
				//console.log(`\ttimestamp: ${tracker.timestamp.toString}`);
				updateDefs[`tracker_${trackerId}_timestamp`] = tracker.timestamp.tracker_timestamp.toString();
			} else{
				//console.log(`\ttimestamp: ${tracker.timestamp.toString}`);
				updateDefs[`tracker_${trackerId}_timestamp`] = this.decoder.lastDataPacketHeader.packet_timestamp.toString();
			}
			this.setInstanceStates(updateDefs, true)
		});
		//}, 1000);
	}

}

runEntrypoint(ModuleInstance, UpgradeScripts)
