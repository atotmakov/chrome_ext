// The first element that matches (or null if none do):
var element = document.querySelector('[aria-label="ID Field"]');
// A list of matching elements (empty if none do):
var list = document.querySelectorAll('[aria-label="ID Field"]');

var text = '';
list.forEach( function(val) { text = text + val.innerHTML; });

const title = document.getElementById("tit");
title.innerHTML = `hello ${text} world`
