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
		this.config = config

		this.updateStatus(InstanceStatus.Disconnected)

		this.instanceState = {}
		this.debugToLogger = true


		this.psn_host = this.config.psn_host
		this.psn_port = this.config.psn_port
		this.readingWheels = false

		// how many groups to get labels for
		this.howManyTrackers = constants.NUM_TRACKERS



		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets


		this.client = dgram.createSocket('udp4');
		this.decoder = new Decoder()

		this.client.on('listening', () => {
			this.client.addMembership(this.psn_host);
		});
		this.client.on('message', (buffer) => {
			this.decoder.decode(buffer);
		});
		this.client.bind(this.psn_port, '0.0.0.0');

		setInterval(() => {
			if (this.decoder.system_name) {
				console.log(`System Name: ${this.decoder.system_name}`);
			}
			if (Object.keys(this.decoder.trackers).length > 0) {
				console.log(`Tracker Count: ${Object.keys(this.decoder.trackers).length}`);
			}

			Object.entries(this.decoder.trackers).forEach(([trackerId, tracker]) => {
				const trackerName = decoder.trackers[trackerId]?.name;
				console.log(`Tracker - id: ${trackerId} | name: ${trackerName || ''}`);
				if (tracker.pos) {
					console.log(`\tpos: ${tracker.pos.x}, ${tracker.pos.x}, ${tracker.pos.x}`);
				}

				if (tracker.speed) {
					console.log(`\tspeed: ${tracker.speed.x}, ${tracker.speed.y}, ${tracker.speed.z}`);
				}

				if (tracker.ori) {
					console.log(`\tori: ${tracker.ori.x}, ${tracker.ori.y}, ${tracker.ori.z}`);
				}

				if (tracker.status) {
					console.log(`\tstatus: ${tracker.status.validity}`);
				}

				if (tracker.accel) {
					console.log(`\taccel: ${tracker.accel.x}, ${tracker.accel.y}, ${tracker.accel.z}`);
				}

				if (tracker.trgtpos) {
					console.log(`\ttrgtpos: ${tracker.trgtpos.x}, ${tracker.trgtpos.y}, ${tracker.trgtpos.z}`);
				}

				if (tracker.timestamp) {
					console.log(`\ttimestamp: ${tracker.timestamp}`);
				}
			});
		}, 1000);

		this.startReconnectTimer()
	}


	// When module gets deleted
	async destroy() {
		// Clear the reconnect timer if it exists.
		if (this.reconnectTimer !== undefined) {
			clearInterval(this.reconnectTimer)
			delete this.reconnectTimer
		}

		// Close the socket.
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		let currentHost = this.config.host
		let currentUserId = this.config.user_id
		let currentUseSlip = this.config.use_slip

		this.config = config

		if (currentHost !== this.config.host || currentUserId !== this.config.user_id
			|| currentUseSlip !== this.config.use_slip) {
			this.eos_port = this.config.use_slip ? constants.EOS_PORT_SLIP : constants.EOS_PORT
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
	 * Sets the connection state of this module to the Eos console.
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
	 * Watches for disconnects and reconnects to the console.
	 */
	startReconnectTimer() {
		if (this.reconnectTimer !== undefined) {
			// Timer is already running.
			return
		}

		this.reconnectTimer = setInterval(() => {
			if (!this.oscSocket || !this.oscSocket.socket) {
				// Socket not valid
				return
			}

			if (this.oscSocket.socket.readyState === 'open') {
				// Already connected. Nothing to do.
				return
			}

			// Re-open the TCP socket
			this.oscSocket.socket.connect(this.eos_port, this.config.host)
		}, 5000)
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

}

runEntrypoint(ModuleInstance, UpgradeScripts)
