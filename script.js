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

var focusLink = function (ind) {
  ind = ind%links.length
  if(ind < 0) {
    ind = links.length + ind
  }
  links[ind].focus()
}

document.addEventListener("keydown", function(e) {
  // Watch for the arrow key and then change the current element accordingly
  switch (e.keyCode) {
    case 37: // left
      focusLink(curr-1)
      break;
    case 38: // up
      focusLink(curr-cols)
      break;
    case 39: // right
      focusLink((curr === null) ? 0 : curr+1)
      break;
    case 40: //down
      focusLink(curr+cols)
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

document.addEventListener('DOMContentLoaded', function(e) {
  links = document.getElementsByTagName('a') // may need to be more specific if other links are added
  link_codes = accessKeyLinks(links)

  // Get the number of columns based on page render
  var wrapper = document.getElementsByClassName("wrapper")
  var style = wrapper.length ? getComputedStyle(wrapper[0]) : null
  cols = style ? style.gridTemplateColumns.split(' ').length : 1

  // Initialize with the first link focused
  focusLink(updateCurrent())
})

var drawFavicon = function() {
  var iconEl = document.createElement('canvas')
  iconEl.setAttribute("width", 16)
  iconEl.setAttribute("height", 16)
  iconEl.style.opacity = '0.5';
  var hdc = iconEl.getContext('2d');
  hdc.rect(iconEl.width*0.24, iconEl.height*0.24, iconEl.width*0.5,  iconEl.height*0.5)
  var grd = hdc.createLinearGradient(0, 0, iconEl.width, iconEl.height)
  grd.addColorStop(0, "#FFD19E")
  grd.addColorStop(1, "#6D3328")
  hdc.fillStyle = grd
  hdc.fill()
  document.getElementById("favicon-rel").setAttribute("href", iconEl.toDataURL('image/png'))
}

drawFavicon()

