// ==UserScript==
// @name Youtube hide related suggestion at end time
// @namespace hoothin
// @version 0.1
// @description Hide the picture of related suggestion which occlude the video at the end on youtube.
// @author hoothin
// @homepageURL https://github.com/hoothin/
// @supportURL https://github.com/hoothin/
// @license MIT
// @grant GM_addStyle
// @run-at document-start
// @include http://youtube.com/*
// @include https://youtube.com/*
// @include http://*.youtube.com/*
// @include https://*.youtube.com/*
// ==/UserScript==

(function () {
    let css = `
 .ytp-endscreen-content{
  visibility:hidden;
 }
 .ytp-endscreen-content:hover{
  visibility:hidden;
 }
 .ytp-ce-element{
  opacity: 0.1!important;
 }
 .ytp-ce-element:hover{
  opacity: 1!important;
 }
`;
    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(css);
    } else {
        let styleNode = document.createElement("style");
        styleNode.appendChild(document.createTextNode(css));
        (document.querySelector("head") || document.documentElement).appendChild(styleNode);
    }
})();
