
const GetVariableDefinitions = function(self) {



	let variableDefinitions = [
		{ variableId: 'cue_active_list',			name: 'The active cue list number' },
		{ variableId: 'cue_active_num',				name: 'The active cue number' },
		{ variableId: 'cue_active_label',			name: 'The active cue label' },
		{ variableId: 'cue_active_duration',		name: 'The active cue duration in seconds' },
		{ variableId: 'cue_active_intensity',		name: 'The active cue intensity percent' },

		{ variableId: 'cue_pending_list',			name: 'The pending cue list number' },
		{ variableId: 'cue_pending_num',			name: 'The pending cue number' },
		{ variableId: 'cue_pending_label',			name: 'The pending cue label' },
		{ variableId: 'cue_pending_duration',		name: 'The pending cue duration in seconds' },

		{ variableId: 'cue_previous_list',			name: 'The previous cue list number' },
		{ variableId: 'cue_previous_num',			name: 'The previous cue number' },
		{ variableId: 'cue_previous_label',			name: 'The previous cue label' },
		{ variableId: 'cue_previous_duration',		name: 'The previous cue duration in seconds' },

		{ variableId: 'cmd',						name: 'The current command line output for the user ' },
		{ variableId: 'cmd_content',				name: 'The current command line content for the user ' },
		{ variableId: 'show_name',					name: 'The name of the show' },

		{ variableId: 'selected_chan',				name: 'Current selected channels' },
		{ variableId: 'hue',					    name: 'Current hue value' },
		{ variableId: 'saturation',					name: 'Current saturation value' },

		{ variableId: 'macro_fired',				name: 'ID of fired macro' },
		{ variableId: 'last_macro',					name: 'Last of fired macro' },
		
		{ variableId: 'patch_active_id',			name: 'ID of the selected channel' },
		{ variableId: 'patch_uid',					name: 'OSC UID' },
		{ variableId: 'patch_label',				name: 'label' },
		{ variableId: 'patch_fix_manuf',			name: 'fixture manufacturer' },
		{ variableId: 'patch_fix_model',			name: 'fixture model' },
		{ variableId: 'patch_dmx_address',			name: 'address' },
		{ variableId: 'patch_dmx_portoffset',		name: 'adress port/offset' },
		{ variableId: 'patch_dmx_address_intens',	name: 'address of intensity parameter' },
		{ variableId: 'patch_current_level',		name: 'current level' },
		{ variableId: 'patch_osc_gel',				name: 'OSC gel' },
		{ variableId: 'patch_text_1',				name: 'text 1' },
		{ variableId: 'patch_text_2',				name: 'text 2' },
		{ variableId: 'patch_text_3',				name: 'text 3' },
		{ variableId: 'patch_text_4',				name: 'text 4' },
		{ variableId: 'patch_text_5',				name: 'text 5' },
		{ variableId: 'patch_text_6',				name: 'text 6' },
		{ variableId: 'patch_text_7',				name: 'text 7' },
		{ variableId: 'patch_text_8',				name: 'text 8' },
		{ variableId: 'patch_text_9',				name: 'text 9' },
		{ variableId: 'patch_text_10',				name: 'text 10' },
		{ variableId: 'patch_part_count',			name: 'part count' },
		{ variableId: 'patch_notes',				name: 'notes' },


	]



	// Encoder Wheels grouped by categories... Up to ${wheelsPerCategory} wheels per category, 7 categories, 0-6
	for ( let i=0; i<=6; i++ ) {
		variableDefinitions.push({ variableId: `cat${i}_wheel_count`, name: `Count of encoders in category ${i}`})

		for ( let j=1; j <= self.wheelsPerCategory; j++ ) {
			variableDefinitions.push({ variableId: `cat${i}_wheel_${j}_label`, name: `Encoders category ${i} Wheel ${j} Label`})
			variableDefinitions.push({ variableId: `cat${i}_wheel_${j}_stringval`, name: `Encoders category ${i} Wheel ${j} String Value`})
			variableDefinitions.push({ variableId: `cat${i}_wheel_${j}_floatval`, name: `Encoders category ${i} Wheel ${j} Float Value`})
			variableDefinitions.push({ variableId: `cat${i}_wheel_${j}_oscname`, name: `Encoders category ${i} Wheel ${j} param name`})
		}
	}

	return variableDefinitions;
}

const UpdateVariableDefinitions = function(self) {
	let variableDefinitions = GetVariableDefinitions(self)

	self.setVariableDefinitions( variableDefinitions )

	const variableValues = {}
	// Initialize the default values for the variables
	for (let i = 0; i < variableDefinitions.length; i++) {
		variableValues[variableDefinitions[i].variableId] = ''
	}
	self.setVariableValues(variableValues)
}

module.exports = { GetVariableDefinitions, UpdateVariableDefinitions }
