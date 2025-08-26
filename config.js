const { Regex } = require('@companion-module/base')
const { PSN_IP, PSN_PORT, NUM_TRACKERS } = require('./constants')

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
			id: 'psn_host',
			label: 'Multicast Address:',
			default: PSN_IP,
			width: 4,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'psn_port',
			label: 'Port:',
			default: PSN_PORT,
			min: 4,
			max: 65535,
			required: true,
		},
		{
			type: 'textinput',
			id: 'variables',
			label: `Variables to expose, tracker range (e.g. "1-5,34,100-130")`,
			width: 12,
			default: '0',
			regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
		},
	]
}

module.exports = {
	getConfigFields,
}
