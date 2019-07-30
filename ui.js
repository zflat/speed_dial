var cols  = null  // Number of grid columns
var links = null  // List of links on the page
var curr  = null  // Index of focused element in list of links
var link_codes = null; // List of key codes that correspond to link access keys

var updateCurrent = function () {
  var curr_el = document.activeElement
  for(var i=0; i<links.length; i++) {
    if(links[i] == curr_el) {
      return curr = i
    }
  }
  return curr = 0
}

var focusLink = function (ind, e) {
  if(e) {
    e.preventDefault();
  }
  ind = ind%links.length
  if(ind < 0) {
    ind = links.length + ind
  }
  if(links[ind]) {
    links[ind].focus()
  }
  return links[ind];
}

document.addEventListener("keydown", function(e) {
  // Watch for the arrow key and then change the current element accordingly
  switch (e.keyCode) {
  case 37: // left -- decrement one place
    focusLink(curr-1, e)
    break;
  case 38: // up -- stay within the current column
    var first_row = curr < cols
    var incomplete_col = curr < links.length % cols
    var account_for_first_row = 0;
    if(first_row) {
      account_for_first_row = incomplete_col
        ? (cols - (links.length % cols))
        : -(links.length % cols);
    }
    focusLink((curr-cols) + account_for_first_row, e)
    break;
  case 39: // right -- increment one place
    focusLink((curr === null) ? 0 : curr+1, e)
    break;
  case 40: //down -- stay within the current column
    var last_row = curr+cols >= links.length
    focusLink(last_row ? curr % cols : curr+cols, e)
    break;
  }
  if(e.shiftKey) {
    var link = link_codes[e.keyCode]
    if(link && link.el) {
      window.location.href = link.el.getAttribute('href')
    }
  }

  // Runs after the event callback finishes
  setTimeout(updateCurrent, 0)
})

var keyCodeKeys = {
  // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  'a': '65', 'b': '66', 'c': '67', 'd': '68',
  'e': '69', 'f': '70', 'g': '71', 'h': '72',
  'i': '73', 'j': '74', 'k': '75', 'l': '76',
  'm': '77', 'n': '78', 'o': '79', 'p': '80',
  'q': '81', 'r': '82', 's': '83', 't': '84',
  'u': '85', 'v': '86', 'w': '87', 'x': '88',
  'y': '89', 'z': '90',
}

var accessKeyLinks = function(links) {
  var codes = {}
  for(var i=0; i<links.length; i++) {
    var accessKey = links[i].getAttribute('accessKey')
    if(accessKey) {
      codes[keyCodeKeys[accessKey]] = {
        'key': accessKey,
        'el': links[i]
      }
    }
  }
  return codes
}

// Get the number of columns based on page render
var setColsCount = function() {
  var wrapper = document.getElementsByClassName("wrapper")
  var style = wrapper.length ? getComputedStyle(wrapper[0]) : null
  cols = style ? style.gridTemplateColumns.split(' ').length : 1
}
var initContent = function() {
  links = document.getElementsByTagName('a') // may need to be more specific if other links are added
  link_codes = accessKeyLinks(links)
  setColsCount();
  focusLink(updateCurrent())
  // Initialize with the first link focused
  // NOTE: suggest keyboard shortcut [Focus Page, Alt+F6]
  focusLink(updateCurrent())
}
var onGridChanged = function (mutationsList, observer) {
  for(let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      initContent();
    }
  }
}
var gridObserver = new MutationObserver(onGridChanged);
gridObserver.observe(document.getElementsByTagName('body')[0], {childList: true, subtree: true});

document.addEventListener('DOMContentLoaded', function(e) {
  initContent()
})


