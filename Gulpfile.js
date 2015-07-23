var argv = require( 'minimist' )( process.argv.slice( 2 ) );
var browserSync = require( 'browser-sync' ).create();
var gulp = require( 'gulp' );
var $ = require( 'gulp-load-plugins' )();
var config = require( './gulp.config' );


gulp.task( 'build:partials', function () {

	cleanBuildFolder();

	return gulp
		.src( config.partialsSrc )
		.pipe( $.plumber( { errorHandler: onError } ) )
		.pipe( $.cached( 'partials' ) )
		.pipe( $.debug( { title: 'partials:cached' } ) )
		.pipe( $.if( config.jshint, $.jshint() ) )
		.pipe( $.if( config.jshint, $.jshint.reporter( 'jshint-stylish' ) ) )
		.pipe( $.sourcemaps.init() )
		.pipe( $.if( config.babel, $.babel() ) )
		.pipe( $.if( config.uglify, $.uglify() ) )
		.pipe( $.wrap( '//source: <%= file.relative %>\n<%= contents %>' ) )
		.pipe( $.remember( 'partials' ) )
		.pipe( $.debug( { title: 'partials:remembered' } ) )
		.pipe( $.concatUtil( 'app.js', { process: removeUseStrict } ) )
		.pipe( $.concatUtil.header('"use strict"\n') )
		.pipe( $.sourcemaps.write( '.' ) )
		.pipe( gulp.dest( config.partialsDest ) );

} );

gulp.task( 'build:vendor', function () {

	return gulp
		.src( config.vendorSrc )
		.pipe( $.uglify() )
		.pipe( $.concat( 'vendor.min.js', { newLine: ';\n' } ) )
		.pipe( gulp.dest( config.vendorDest ) );

} );

gulp.task( 'serve', [ 'build:partials' ], function () {

	initBrowserSync();
	initWatchTask();

} );

gulp.task( 'reload', [ 'build:partials' ], function () {

	browserSync.reload();

} );

function initWatchTask() {

	gulp
		.watch( config.watch, [ 'reload' ] )
		.on( 'change', function ( event ) {
			if ( event.type === 'deleted' ) {
				delete $.cached.caches[ 'partials' ][ event.path ];
				$.remember.forget( 'partials', event.path );
			}
		});

}

function initBrowserSync() {

	browserSync.init( {

		server: {
			baseDir: '.',
			index: 'index.html'
		},

		ui: false,
		open: false,
		reloadOnRestart: true

	} );

}

function cleanBuildFolder() {
	gulp
		.src( config.partialsDest, { read: false } )
		.pipe( $.debug( { title: 'clean' } ) )
		.pipe( $.rimraf() );
}

function removeUseStrict( src ) {

	return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');

}

function onError( err ) {

	$.util.log( $.util.colors.red( err ) );
	$.util.beep();

}
