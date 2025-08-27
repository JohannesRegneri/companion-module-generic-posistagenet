const ParseVariableConfig = function (self) {
	self.variable_status = []
	for (let i = 0; i < self.trackers.length; i++) {
		self.variable_status[i] = false
	}

	if (!self.config.variables) {
		// no variables to enable
		return
	}

	let parts = self.config.variables.split(',')
	parts.forEach(part => {
		//console.log(part)
		if (!part.includes('-')) {
			self.variable_status[parseInt(part)] = true
		} else {
			// some range <start>-<stop>
			let p = part.split('-')
			for (let i = Number(p[0]); i < Number(p[1]) + 1; i++) {
				self.variable_status[i] = true
			}
		}
	})
}

const GetVariableDefinitions = function (self) {
	ParseVariableConfig(self);

	let variableDefinitions = [
		{ variableId: 'system_name', name: 'The name of the PSN server' },
		{ variableId: 'system_tracker_count', name: 'The number of trackers' },
	];


	for (let i = 0; i < self.trackers.length; i++) {
		if (self.variable_status[i]) {
			variableDefinitions.push(
				{ variableId: `tracker_${i}_name`, name: `Tracker-${i}: Name` },

				{ variableId: `tracker_${i}_pos_x`, name: `Tracker-${i}: X-Position (meter)` },
				{ variableId: `tracker_${i}_pos_y`, name: `Tracker-${i}: Y-Position (meter)` },
				{ variableId: `tracker_${i}_pos_z`, name: `Tracker-${i}: Z-Position (meter)` },

				{ variableId: `tracker_${i}_speed_x`, name: `Tracker-${i}: X-Speed (m/s)` },
				{ variableId: `tracker_${i}_speed_y`, name: `Tracker-${i}: Y-Speed (m/s)` },
				{ variableId: `tracker_${i}_speed_z`, name: `Tracker-${i}: Z-Speed (m/s)` },

				{ variableId: `tracker_${i}_ori_x`, name: `Tracker-${i}: X-Orientation` },
				{ variableId: `tracker_${i}_ori_y`, name: `Tracker-${i}: Y-Orientation` },
				{ variableId: `tracker_${i}_ori_z`, name: `Tracker-${i}: Z-Orientation` },

				{ variableId: `tracker_${i}_accel_x`, name: `Tracker-${i}: X-Acceleration (m/s^2)` },
				{ variableId: `tracker_${i}_accel_y`, name: `Tracker-${i}: Y-Acceleration (m/s^2)` },
				{ variableId: `tracker_${i}_accel_z`, name: `Tracker-${i}: Z-Acceleration (m/s^2)` },

				{ variableId: `tracker_${i}_trgtpos_x`, name: `Tracker-${i}: X-Targetposition (meter)` },
				{ variableId: `tracker_${i}_trgtpos_y`, name: `Tracker-${i}: Y-Targetposition (meter)` },
				{ variableId: `tracker_${i}_trgtpos_z`, name: `Tracker-${i}: Z-Targetposition (meter)` },

				{ variableId: `tracker_${i}_timestamp`, name: `Elapsed ms since PSN server start and computing of Tracker` },

				{ variableId: `tracker_${i}_status`, name: `Tracker-${i}: Validity` },
			);
		}
	}
	return variableDefinitions;
}




const UpdateVariableDefinitions = function (self) {
	let variableDefinitions = GetVariableDefinitions(self)

	self.setVariableDefinitions(variableDefinitions)

	const variableValues = {}
	// Initialize the default values for the variables
	for (let i = 0; i < variableDefinitions.length; i++) {
		variableValues[variableDefinitions[i].variableId] = ''
	}
	self.setVariableValues(variableValues)
}

module.exports = { GetVariableDefinitions, UpdateVariableDefinitions }
