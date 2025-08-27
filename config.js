const { Regex } = require('@companion-module/base')
const { PSN_IP, PSN_PORT, PSN_SPEED, NUM_TRACKERS } = require('./constants')

function getConfigFields(id) {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This module will connect to a PosiStageNet (PSN) tracking server.',
		},
		{
			type: 'textinput',
			id: 'psnHost',
			label: 'Multicast Address:',
			default: PSN_IP,
			width: 4,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'psnPort',
			label: 'Port:',
			default: PSN_PORT,
			width: 4,
			min: 0,
			max: 65535,
			required: true,
		},

		{
			type: 'number',
			id: 'refreshRate',
			label: 'Refreshrate (Hz):',
			default: PSN_SPEED,
			width: 4,
			min: 1,
			max: 60,
			required: true,
		},
		{
			type: 'number',
			id: 'decimals',
			label: 'Decimals:',
			default: 2,
			min: 0,
			max: 4,
			width: 4,

			required: true,
		},
		{
			type: 'textinput',
			id: 'variables',
			label: `Show specific tracker or tracker range (e.g. "1-5,34,100-130")`,
			width: 12,
			default: '0-100',
			regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
		},

		/*
		{
			type: 'checkbox',
			id: 'use_pos',
			label: 'Show Position',
			default: true,
			required: true,
		},
		{
			type: 'checkbox',
			id: 'use_speed',
			label: 'Show Speed',
			default: true,
			required: true,
		},
		{
			type: 'checkbox',
			id: 'use_ori',
			label: 'Show Orientation',
			default: true,
			required: true,
		},

		{
			type: 'checkbox',
			id: 'use_accel',
			label: 'Show Acceleration',
			default: true,
			required: true,
		},
		{
			type: 'checkbox',
			id: 'use_trgtpos',
			label: 'Show Targetposition',
			default: true,
			required: true,
		},
		*/

	]
}

module.exports = {
	getConfigFields,
}
