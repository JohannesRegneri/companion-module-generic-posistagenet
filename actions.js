const { Regex } = require('@companion-module/base')

module.exports = function (self) {
	self.setActionDefinitions({
		custom_cmd: {
			name: 'Custom Command',
			options: [
				{
					id: 'before',
					type: 'dropdown',
					label: 'Before',
					default: 'clear',
					tooltip: 'Clear or keep any existing command.',
					choices: [
						{ id: 'clear', label: 'Clear command line' },
						{ id: 'keep', label: 'Keep command line' },
					],
				},
				{
					type: 'textinput',
					label: 'Command',
					tooltip: 'The command to run.',
					id: 'cmd',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'After',
					id: 'after',
					default: 'run',
					tooltip: 'Add the command to the command line or run it.',
					choices: [
						{ id: 'add', label: 'Add to command line' },
						{ id: 'run', label: 'Run this command' },
					],
				},
			],
			callback: async (event, context) => {
				const before = event.options.before === 'clear' ? 'newcmd' : 'cmd'
				const cmd = await context.parseVariablesInString(event.options.cmd || '')
				const after = event.options.after === 'add' ? '' : '#'

				self.sendOsc(`${before}`, [{ type: 's', value: `${cmd}${after}` }])
			},
		}
	})
}
