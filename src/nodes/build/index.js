import { resolve } from 'path';
import { copydir, readdir } from 'sander';
import cleanup from '../../utils/cleanup';
import session from '../../session';
import GobbleError from '../../utils/GobbleError';

export default function ( node, options ) {
	var dest,
		gobbledir,
		promise,
		task,
		previousDetails;

	options = options || {};
	dest = options.dest;
	gobbledir = resolve( options.gobbledir || process.env.GOBBLE_TMP_DIR || '.gobble-build' );

	if ( !dest ) {
		throw new GobbleError({
			code: 'MISSING_DEST_DIR',
			task: 'build'
		});
	}

	// the return value is an EventEmitter...
	task = session.create({
		gobbledir: gobbledir
	});

	// that does double duty as a promise
	task.then = function () {
		return promise.then.apply( promise, arguments );
	};

	task.catch = function () {
		return promise.catch.apply( promise, arguments );
	};


	promise = cleanup( gobbledir ).then( function () {
		return readdir( dest ).then( function ( files ) {
			if ( files.length && !options.force ) {
				throw new GobbleError({
					message: 'destination folder (' + dest + ') is not empty',
					code: 'DIR_NOT_EMPTY',
					path: dest
				});
			}

			return cleanup( dest ).then( build );
		}, build );
	})
	.then( function () {
		task.emit( 'complete' );
		session.destroy();
	})
	.catch( function ( err ) {
		task.emit( 'error', err );
		session.destroy();
		throw err;
	});

	return task;

	function build () {
		task.emit( 'info', {
			code: 'BUILD_START'
		});

		node.on( 'info', function ( details ) {
			if ( details === previousDetails ) return;
			previousDetails = details;
			task.emit( 'info', details );
		});

		node.start(); // TODO this starts a file watcher! need to start without watching

		return node.ready().then( function ( inputdir ) {
			node.stop();
			return copydir( inputdir ).to( dest );
		});
	}
}
