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
		super(internal);
	}

	async init(config) {
		this.config = config;

		this.updateStatus(InstanceStatus.Disconnected);

		this.instanceState = {};
		this.debugToLogger = true;
		this.trackers = [];

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		await this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		//main 
		this.initPSN()
		this.listenPSN(1000 / this.config.refreshRate)
	}

	async destroy() {
		this.log('debug', 'destroy');
		this.terminate();
	}

	// Return config fields for web config
	getConfigFields() {
		return getConfigFields(this.id);
	}

	updateActions() {
		UpdateActions(this);
	}

	updateFeedbacks() {
		UpdateFeedbacks(this);
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this);
	}

	updatePresets() {

	}

	setInstanceStates(values, isVariable) {
		for (const [key, value] of Object.entries(values)) {
			this.instanceState[key] = value;
		}

		if (isVariable) {
			this.setVariableValues(values);
		}
	}

	terminate() {
		clearInterval(this.timer)
		delete this.timer;
		if (this.client) {
			this.client.close((error) => {
				if (error) {
					console.error('Error closing socket:', error);
				} 
			});
		}


		delete this.trackers;
		delete this.client;
	}

	/**
	 * Init PSN
	 *
	 */
	initPSN() {
		//reset
		this.terminate()
		this.log('debug', `initPSN with: ${JSON.stringify(this.config)}`);

		if (this.config.psnHost) {
			// create Socket
			this.client = dgram.createSocket('udp4');

			// create new PSN Package Decoder
			this.decoder = new Decoder();

			this.client.on('listening', () => {
				this.client.addMembership(this.config.psnHost);
			});

			this.client.on('message', (buffer) => {
				this.decoder.decode(buffer);
				//this.setPSNVariables();

			});

			this.client.bind(this.config.psnPort, '0.0.0.0');
			// init done
			this.updateStatus(InstanceStatus.Ok);

		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'something is missing')
		}
	}

	/**
	 * Refreshes the variables
	 *
	 * @param looptime
	 */
	listenPSN(looptime) {
		looptime = looptime.toFixed(0);
		this.log('debug', `listenPSN with: ${looptime}ms refreshtime`);
		this.timer = setInterval(() => {
			this.setPSNVariables();
		}, (looptime));
	}

	/**
	 * Set Variables
	 *
	 */
	setPSNVariables() {
		let updateDefs = {}
		if (this.decoder.system_name) {
			//console.log(`System Name: ${this.decoder.system_name}`);
			updateDefs['system_name'] = this.decoder.system_name;
		}

		if (Object.keys(this.decoder.trackers).length > 0) {
			//console.log(`Tracker Count: ${Object.keys(this.decoder.trackers).length}`);
			//console.debug(JSON.stringify(this.decoder.trackers, (_, v) => typeof v === 'bigint' ? v.toString() : v))
			this.trackers = Object.keys(this.decoder.trackers);
			updateDefs[`system_tracker_count`] = this.trackers.length;
			updateDefs[`system_tracker_ids`] = JSON.stringify(this.trackers);

			this.updateVariableDefinitions()
		}

		//TODO:
		//TODO Compare Trackerlist with existing Trackers and update new Variable List if ids and names change
		//console.debug(this.decoder.trackers)

		Object.entries(this.decoder.trackers).forEach(([trackerId, tracker]) => {
			if (tracker.tracker_name) {
				//console.log(`Tracker - id: ${trackerId} | name: ${tracker.tracker_name.tracker_name}`);
				updateDefs[`tracker_${trackerId}_name`] = tracker.tracker_name.tracker_name;
			}

			if (tracker.pos) {
				//console.log(`\tpos: ${tracker.pos.x}, ${tracker.pos.y}, ${tracker.pos.z}`);
				updateDefs[`tracker_${trackerId}_pos_x`] = tracker.pos.pos_x.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_pos_y`] = tracker.pos.pos_y.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_pos_z`] = tracker.pos.pos_z.toFixed(this.config.decimals);
			}

			if (tracker.speed) {
				//console.log(`\tspeed: ${tracker.speed.x}, ${tracker.speed.y}, ${tracker.speed.z}`);
				updateDefs[`tracker_${trackerId}_speed_x`] = tracker.speed.speed_x.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_speed_y`] = tracker.speed.speed_y.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_speed_z`] = tracker.speed.speed_z.toFixed(this.config.decimals);
			}

			if (tracker.ori) {
				//console.log(`\tori: ${tracker.ori.x}, ${tracker.ori.y}, ${tracker.ori.z}`);
				updateDefs[`tracker_${trackerId}_ori_x`] = tracker.ori.ori_x.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_ori_y`] = tracker.ori.ori_y.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_ori_z`] = tracker.ori.ori_z.toFixed(this.config.decimals);
			}

			if (tracker.status) {
				//console.log(`\tstatus: ${tracker.status.validity}`);
				updateDefs[`tracker_${trackerId}_status`] = tracker.status.validity;
			}

			if (tracker.accel) {
				//console.log(`\taccel: ${tracker.accel.x}, ${tracker.accel.y}, ${tracker.accel.z}`);
				updateDefs[`tracker_${trackerId}_accel_x`] = tracker.accel.accel_x.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_accel_y`] = tracker.accel.accel_y.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_accel_z`] = tracker.accel.accel_z.toFixed(this.config.decimals);
			}

			if (tracker.trgtpos) {
				//console.log(`\ttrgtpos: ${tracker.trgtpos.x}, ${tracker.trgtpos.y}, ${tracker.trgtpos.z}`);
				updateDefs[`tracker_${trackerId}_trgtpos_x`] = tracker.trgtpos.trgtpos_x.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_trgtpos_y`] = tracker.trgtpos.trgtpos_y.toFixed(this.config.decimals);
				updateDefs[`tracker_${trackerId}_trgtpos_z`] = tracker.trgtpos.trgtpos_z.toFixed(this.config.decimals);
			}

			if (tracker.timestamp) {
				//If this field is not present, you can simply use the packet timestamp as a fallback.
				//console.log(`\ttimestamp: ${tracker.timestamp.toString}`);
				updateDefs[`tracker_${trackerId}_timestamp`] = tracker.timestamp.tracker_timestamp.toString();
			} else {
				//console.log(`\ttimestamp: ${tracker.timestamp.toString}`);
				updateDefs[`tracker_${trackerId}_timestamp`] = this.decoder.lastDataPacketHeader.packet_timestamp.toString();
			}
			this.setInstanceStates(updateDefs, true)
		});
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
