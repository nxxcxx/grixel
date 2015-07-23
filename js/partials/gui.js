'use strict';

var gui, gui_display, gui_settings;

function initGui() {

	// gui_settings.add( Object, property, min, max, step ).name( 'name' );

	gui = new dat.GUI();
	gui.width = 300;

	gui_display = gui.addFolder( 'Display' );
		gui_display.autoListen = false;

	gui_settings = gui.addFolder( 'Settings' );

		gui_settings.addColor( SCENE_SETTINGS, 'bgColor' ).name( 'Background' );
		gui_settings.add( CAMERA, 'fov', 25, 120, 1 ).name( 'FOV' );

	gui_display.open();
	gui_settings.open();

	gui_settings.__controllers.forEach( ( controller ) => {
		controller.onChange( updateSettings );
	} );

}

function updateSettings() {

	CAMERA.updateProjectionMatrix();
	RENDERER.setClearColor( SCENE_SETTINGS.bgColor , 1.0 );

}

function updateGuiDisplay() {

	gui_display.__controllers.forEach( ( controller ) => {
		controller.updateDisplay();
	} );

}
