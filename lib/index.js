var getNode = require( './utils/getNode' ),
	config = require( './config' );

var gobble = function ( inputs, options ) {
	return getNode( inputs, options );
};

gobble.env = function ( env ) {
	if ( arguments.length ) {
		config.env = env;
	}

	return config.env;
};

gobble.cwd = function ( cwd ) {
	if ( arguments.length ) {
		config.cwd = cwd;
	}

	return config.cwd;
};

module.exports = gobble;
