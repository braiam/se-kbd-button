// ==UserScript==
//
// @name           Stack Exchange KBD Button
// @description    Adds a button for KBD syntax to the Stack Exchange editor
// @homepage       https://github.com/oliversalzburg/se-kbd-button
// @namespace      https://oliversalzburg.github.com/
// @author         Oliver Salzburg, oliversalzburg (https://github.com/oliversalzburg/)
// @license        MIT License (http://opensource.org/licenses/mit-license.php)
//
// @include        http://stackoverflow.com/*
// @include        http://serverfault.com/*
// @include        http://superuser.com/*
// @require        jquery-1.8.3.min.js
//
// @version        0.0.1
//
// ==/UserScript==

var $ = window.$.noConflict( true ); // Required for Opera and IE

function KbdButton() {
}

KbdButton.prototype = {
  install: function() {
    // Try to find the 6th button in the toolbar (code block)
    var targetButton = $( ".wmd-button:nth-child(6)" );
    // If we can't find it...
    if( 0 == targetButton.length ) {
      // ...try again in 100ms
      setTimeout( this.install, 100 );

    } else {
      // Create our KBD button
      var kbdToggle = $( "<li class='wmd-button' title='Keyboard Key' style='left: 125px;'><img src='http://i.stack.imgur.com/sXBE4.png' /></li>" );
      // Insert it after the code block button
      targetButton.after( kbdToggle );
      // Move all other buttons in the toolbar over by 25px
      targetButton.nextAll().each( function( index, elem ) {
        $( this ).attr( "style", "left:" + ( ( index + 6 ) * 25 ) + "px" );
      } );

      kbdToggle.click( function() {
        // Find the editor belonging to this button (in case there are multiple WMD instances)
        var editor = $( this ).parents( ".wmd-container" ).children( "textarea.wmd-input" );
        if( null == editor || 0 == editor.length ) return;

        // Grab first matched element only
        editor = editor[ 0 ];

        var selectionStart = editor.selectionStart;
        var selectionEnd = editor.selectionEnd;
        var currentText = editor.value;

        var newText =
          currentText.substring( 0, selectionStart )
            + "<kbd>"
            + currentText.substring( selectionStart, selectionEnd )
            + "</kbd>"
            + currentText.substring( selectionEnd, currentText.length );

        editor.value = newText;

        // Restore selection
        editor.selectionStart = selectionStart;
        editor.selectionEnd = selectionEnd;
      } );
    }
  }
}

$( function() {
  var kbdButton = new KbdButton();
  kbdButton.install();
} );