// ==UserScript==
//
// @name           KBD Button for Stack Exchange sites
// @description    Adds a button for KBD syntax to the Stack Exchange editor
// @homepage       https://github.com/oliversalzburg/se-kbd-button
// @namespace      https://oliversalzburg.github.com/
// @author         Oliver Salzburg, oliversalzburg (https://github.com/oliversalzburg/)
// @license        MIT License (http://opensource.org/licenses/mit-license.php)
//
// @include       http://stackoverflow.com/*
// @include       http://meta.stackoverflow.com/*
// @include       http://serverfault.com/*
// @include       http://meta.serverfault.com/*
// @include       http://superuser.com/*
// @include       http://meta.superuser.com/*
// @include       http://stackapps.com/*
// @include       http://askubuntu.com/*
// @include       http://meta.askubuntu.com/*
// @include       http://*.stackexchange.com/*
// @require       jquery-1.8.3.min.js
//
// @version        0.1.4
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
  installHotkey: function() {
    // Install a single anchor in the body to catch our accessor.
    var accessor = $( "<a accesskey='k' style='display:none; position:absolute;'>" );
    $( "body" ).append( accessor );

    $( document ).on( "keydown", function( event ) {
      // If Alt+K was pressed...
      if( event.altKey && event.which == 75 ) {
        // ...find the parent KBD toggle button.
        var kbdToggle = $( document.activeElement ).parents( ".wmd-container" ).find( "li.kbd-button" );
        if( kbdToggle.length > 0 ) {
          kbdToggle.click();
          event.preventDefault();
        }
      }
    } );
  },

  install: function( target ) {
    // Try to find the 6th button in the toolbar (code block)
    var targetButton = $( target ).parents( ".postcell, .answercell, .post-form, .inline-post" ).find( ".wmd-button:nth-child(6)" );

    // If we can't find a button, do another check for editors in the review view
    if( 0 == targetButton.length ) {
      targetButton = $(".review-content.editing-review-content" ).find( ".wmd-button:nth-child(6)" );
    }

    // If we can't find it...
    if( 0 == targetButton.length ) {
      // ...try again in 100ms
      setTimeout( function( thisObj, targetObj ) {
        thisObj.install( targetObj );
      }, 100, this, target );

    } else {
      // Create our KBD button
      var kbdToggle = $( "<li class='wmd-button kbd-button' title='Keyboard Key &lt;kbd&gt; Alt+K' style='left: 125px;'><span style='background-image:url(http://i.stack.imgur.com/GywH0.png) !important'></span></li>" );
      // Add the mouse-over effect
      kbdToggle.hover(
        function(event){
          $( "span", this ).attr( "style", "background-image:url(http://i.stack.imgur.com/GywH0.png) !important; background-position:0 -20px" );
        },
        function(event){
          $( "span", this ).attr( "style", "background-image:url(http://i.stack.imgur.com/GywH0.png) !important; background-position:0 0px" );
        }
      );
      // Insert it after the code block button
      targetButton.after( kbdToggle );
      // Move all other buttons in the toolbar over by 25px
      var listItems = targetButton.nextAll( "li" );
      listItems.each( function( index, elem ) {
        // Leave the help button untouched
        if( index == listItems.length - 1 ) return;
        // Move all other items into the correct position
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
  // Attach to links that will load an editor in-place (like edit post links).
  $( ".edit-post" ).on( "click", function() {
    kbdButton.install( this );
  } );

  // Some review queue questions require us to bind to an earlier event.
  // The click event will never reach our listener, so we bind on 'mouseup'.
  $( document ).on( "mouseup", ".reviewable-post .edit-post", function( e ) {
    if( e.which != 1 ) return;

    kbdButton.install( this );
  } );

  // Attach to edit button in the review queue
  $( document ).on( "click", ".review-actions input[value='Edit'], .review-actions input[value='Improve']", function() {
    kbdButton.install( ".editing-review-content .post-editor" );
  } );

  // Is there already a "post editor" on the page?
  // This is usually the case with the "Your Answer" part on a question page or the "Ask a Question" page.
  if( 0 < $( "#post-editor" ).length ) {
    kbdButton.install( $( "#post-editor" ) );
  }

  // Install out hotkey hook.
  kbdButton.installHotkey();
} );