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

// Script injection from http://www.shesek.info/javascript/executing-code-in-the-webpage-context-from-chrome-extensions
var inject,
  __slice = Array.prototype.slice;

inject = function() {
  var args, fn, response, script, _i;
  args = 2 <= arguments.length ? __slice.call( arguments, 0, _i = arguments.length - 1 ) : (_i = 0, [
  ]), fn = arguments[_i++];
  script = document.createElement( 'script' );
  script.innerHTML = "Array.prototype.pop.call(document.getElementsByTagName('script')).innerText = JSON.stringify(function() {\n  try { return " + (fn.toString()) + ".apply(window, " + (JSON.stringify( args )) + "); }\n  catch(e) { return {isException: true, exception: e.toString()}; }\n}());";
  document.body.appendChild( script );
  if( "undefined" != script.innerText ) response = JSON.parse( script.innerText );
  document.body.removeChild( script );
  if( response != null ? response.isException : void 0 ) {
    throw new Error( response.exception );
  }
  return response;
};

function KbdButton() {
}

KbdButton.prototype = {
  install: function( target ) {

    // Try to find the 6th button in the toolbar (code block)
    var targetButton = $( target ).parents( ".postcell, .answercell, .post-form" ).find( ".wmd-button:nth-child(6)" );

    // If we can't find it...
    if( 0 == targetButton.length ) {
      // ...try again in 100ms
      setTimeout( function( thisObj, targetObj ) {
        thisObj.install( targetObj );
      }, 100, this, target );

    } else {
      // Create our KBD button
      var kbdToggle = $( "<li class='wmd-button kbd-button' title='Keyboard Key' style='left: 125px;'><img src='http://i.stack.imgur.com/sXBE4.png' /></li>" );
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
        var selectedText = currentText.substring( selectionStart, selectionEnd );

        if( selectedText.match( /\S $/ ) ) {
          --selectionEnd;
          selectedText = currentText.substring( selectionStart, selectionEnd );
        }

        var headText = currentText.substring( 0, selectionStart );
        var tailText = currentText.substring( selectionEnd, currentText.length );

        var newText = selectedText;

        // Are we already wrapped?
        if( newText.match( /<kbd>[^<]+<\/kbd>/ ) ) {
          newText = newText.substring( "<kbd>".length, newText.length - "</kbd>".length );
          selectionEnd -= "<kbd></kbd>".length;
        } else {
          newText = "<kbd>" + newText + "</kbd>";
          selectionEnd += "<kbd></kbd>".length;
        }

        var newText = headText + newText + tailText;

        editor.value = newText;

        // Restore selection
        editor.selectionStart = selectionStart;
        editor.selectionEnd = selectionEnd;

        // Put focus back on editor (for Firefox mostly)
        $( editor ).focus();

        inject( "StackExchange.MarkdownEditor.refreshAllPreviews" );

      } );
    }
  }
}

$( function() {
  var kbdButton = new KbdButton();
  if( 0 == $( ".edit-post" ).length ) {
    // Install the button on this page (if there is one)
    kbdButton.install( $( ".wmd-container" ) );
  }

  // Also attach to possible buttons that load in an editor
  $( ".edit-post" ).on( "click", function() {
    kbdButton.install( this );
  } )
} );