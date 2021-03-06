/**
 * Copyright (C) 2013, Oliver Salzburg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Created: 2013-09-25 18:19
 *
 * @author Oliver Salzburg
 * @copyright Copyright (C) 2013, Oliver Salzburg
 * @license http://opensource.org/licenses/mit-license.php MIT License
 */

var SeKbdButtonLoader = {
  init: function() {
    var appcontent = document.getElementById( "appcontent" );
    if( appcontent ) {
      appcontent.addEventListener( "DOMContentLoaded", SeKbdButtonLoader.onPageLoad, true );
    }
  },

  onLoad: function( event ) {
    window.removeEventListener( "load", SeKbdButtonLoader.onLoad, false );
    SeKbdButtonLoader.init();
  },

  onUnLoad: function() {
    window.removeEventListener( "unload", SeKbdButtonLoader.onUnLoad, false );
    window.document.getElementById( "appcontent" ).removeEventListener( "DOMContentLoaded",
                                                                        SeKbdButtonLoader.onPageLoad, false );
  },

  onPageLoad: function( event ) {
    var unsafeWin = event.target.defaultView;
    if( unsafeWin.wrappedJSObject ) unsafeWin = unsafeWin.wrappedJSObject;

    var unsafeLoc = new XPCNativeWrapper( unsafeWin, "location" ).location;
    var href = new XPCNativeWrapper( unsafeLoc, "href" ).href;

    var targetSites = [
      "@ant-sites-string-list@"
    ];

    targetSites.forEach( function( site ) {
      site = site.replace( "*", ".*?" );
      var siteRegexp = new RegExp( site );
      if( siteRegexp.test( href ) ) {
        setTimeout( function() {
          SeKbdButtonLoader.injectScript( "se-kbd-button-script",
                                          "chrome://se-kbd-button-0cd782a3-e906-4cd9-9107-ce5e030debd4/content/se-kbd-button.js" );
        }, 100 );
      }
    } );
  },

  injectScript: function( id, src ) {
    var scriptTag = content.document.getElementById( id );
    if( !scriptTag ) {
      scriptTag = content.document.createElement( "script" );
      scriptTag.id = id;
      scriptTag.type = "text/javascript";
      scriptTag.src = src;

      var head = content.document.getElementsByTagName( "head" )[0];
      head.appendChild( scriptTag );
    }
  }
};

window.addEventListener( "load", SeKbdButtonLoader.onLoad, false );
window.addEventListener( "unload", SeKbdButtonLoader.onUnLoad, false );