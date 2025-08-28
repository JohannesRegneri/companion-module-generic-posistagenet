const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
    //TODO
    //Object.entries(self.trackers).forEach(([_, i]) => {

	self.setPresetDefinitions({
		pos: {
			type: 'button',
			category: 'Position',
			name: '',
			style: {
				text: '0 - $(PSN:tracker_0_name)\n$(PSN:tracker_0_pos_x)\n$(PSN:tracker_0_pos_y)\n$(PSN:tracker_0_pos_z)',
				size: '12',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
		
			],
			feedbacks: [
			],
		},
		
	})

	//})
}
