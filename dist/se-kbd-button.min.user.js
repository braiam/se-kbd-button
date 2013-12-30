/*

// ==UserScript==
//
// @name           KBD Button for Stack Exchange sites
// @description    Adds a button for KBD syntax to the Stack Exchange editor
// @homepage       https://github.com/oliversalzburg/se-kbd-button
// @namespace      https://oliversalzburg.github.com/
// @author         Oliver Salzburg, oliversalzburg (https://github.com/oliversalzburg/)
// @license        MIT License (http://opensource.org/licenses/mit-license.php)
//
// @include http://stackoverflow.com/*
// @include http://meta.stackoverflow.com/*
// @include http://serverfault.com/*
// @include http://meta.serverfault.com/*
// @include http://superuser.com/*
// @include http://meta.superuser.com/*
// @include http://stackapps.com/*
// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://*.stackexchange.com/*
//
// @version       0.2.0
//
// ==/UserScript==
*/
var inject,__slice=Array.prototype.slice;
inject=function(){var a,c,b,d;a=2<=arguments.length?__slice.call(arguments,0,c=arguments.length-1):(c=0,[]);c=arguments[c++];d=document.createElement("script");d.innerHTML="Array.prototype.pop.call(document.getElementsByTagName('script')).innerText = JSON.stringify(function() {\n  try { return "+c.toString()+".apply(window, "+JSON.stringify(a)+"); }\n  catch(e) { return {isException: true, exception: e.toString()}; }\n}());";document.body.appendChild(d);"undefined"!=d.innerText&&(b=JSON.parse(d.innerText));
document.body.removeChild(d);if(null!=b&&b.isException)throw Error(b.exception);return b};function KbdButton(){}
KbdButton.prototype={installHotkey:function(){var a=$("<a accesskey='k' style='display:none; position:absolute;'>");$("body").append(a);$(document).on("keydown",function(a){if(a.altKey&&75==a.which){var b=$(document.activeElement).parents(".wmd-container").find("li.kbd-button");0<b.length&&(b.click(),a.preventDefault())}})},install:function(a){var c=$(a).parents(".postcell, .answercell, .post-form, .inline-post").find(".wmd-button:nth-child(6)");0==c.length&&(c=$(".review-content.editing-review-content").find(".wmd-button:nth-child(6)"));
if(0==c.length)setTimeout(function(d,a){d.install(a)},100,this,a);else{a=$("<li class='wmd-button kbd-button' title='Keyboard Key &lt;kbd&gt; Alt+K' style='left: 125px;'><span style='background-image:url(http://i.stack.imgur.com/GywH0.png) !important'></span></li>");a.hover(function(d){$("span",this).attr("style","background-image:url(http://i.stack.imgur.com/GywH0.png) !important; background-position:0 -20px")},function(d){$("span",this).attr("style","background-image:url(http://i.stack.imgur.com/GywH0.png) !important; background-position:0 0px")});
c.after(a);var b=c.nextAll("li");b.each(function(d,a){d!=b.length-1&&$(this).attr("style","left:"+25*(d+6)+"px")});a.click(function(){var a=$(this).parents(".wmd-container").children("textarea.wmd-input");if(null!=a&&0!=a.length){var a=a[0],c=a.selectionStart,b=a.selectionEnd,f=a.value,e=f.substring(c,b);e.match(/\S $/)&&(--b,e=f.substring(c,b));var g=f.substring(0,c),f=f.substring(b,f.length);e.match(/<kbd>[^<]+<\/kbd>/)?(e=e.substring(5,e.length-6),b-=11):(e="<kbd>"+e+"</kbd>",b+=11);a.value=g+
e+f;a.selectionStart=c;a.selectionEnd=b;$(a).focus();inject("StackExchange.MarkdownEditor.refreshAllPreviews")}})}}};
$(function(){var a=new KbdButton;$(".edit-post").on("click",function(){a.install(this)});$(document).on("mouseup",".reviewable-post .edit-post",function(c){1==c.which&&a.install(this)});$(document).on("click",".review-actions input[value='Edit'], .review-actions input[value='Improve']",function(){a.install(".editing-review-content .post-editor")});0<$("#post-editor").length?a.install($("#post-editor")):1==$(".post-editor").length&&a.install($(".post-editor"));a.installHotkey()});
