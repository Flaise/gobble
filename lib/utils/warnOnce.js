'use strict';

var util = require('util');



exports['default'] = warnOnce;
/*global console */
var alreadyWarned = {};
function warnOnce() {
	var warning = util.format.apply(null, arguments);

	if (!alreadyWarned[warning]) {
		console.log(warning);
		alreadyWarned[warning] = true;
	}
}