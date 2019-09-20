'use strict';

window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

var getSystem = function (system) {
  var robj;
  try {
    robj = browser[system]
  } catch (e) {
    robj = null
  }
  try {
    if(!robj) {
      robj = chrome[system]
    }
  } catch (e) {
    robj = null
  }
  return robj;
}

var storage = getSystem('storage')

var createTargetImage = function(settings) {
  var tImg  = document.createElement('img');
  tImg.setAttribute('src', settings.src);
  if(settings.style) {
    tImg.setAttribute('style', settings.style);
  }
  if(settings.width) {
    tImg.setAttribute('width', settings.width + '%');
  }
  return tImg;
}

var createTargetA = function(settings) {
  var link = document.createElement('a');
  link.setAttribute('href', settings.href);
  link.setAttribute('class', 'box '+settings.class_str);
  if(settings.accesskey) {
    link.setAttribute('accesskey', settings.accesskey);
  }
  return link;
}

var createTargetText = function(str) {
  var tSpan = document.createElement('span');
  tSpan.appendChild(document.createTextNode(str));
  return tSpan;
}

var createTargetDiv = function(children) {
  var tDiv  = document.createElement('div');
  for(var i=0; i<children.length; i++) {
    tDiv.appendChild(children[i]);
  }
  return tDiv;
}



/**
 * Logo and caption tile (default)
 * <a href="" class="box" accesskey="">
 *   <div>
 *     <img width="75%" src="" style="" />
 *     <span></span>
 *   </div>
 * </a>
 *
 * Logo only tile
 * <a href="" class="box" accesskey="">
 *   <img width="90%" src="" style="" />
 * </a>
 *
 * Logo and inline text tile
 * <a href="" class="box" accesskey="">
 *   <img width="90%" src="" style="" />
 *   <span></span>
 * </a>
 *
 * Text only tile
 * <a href="" class="box" accesskey="">
 *   <span></span>
 * </a>
 **/
var createTarget =  function(settings) {
  var type     = settings.type || 'caption';
  var has_img  = ['caption', 'logo', 'pill'];
  var has_text = ['caption', 'text', 'pill'];
  var children = [];
  if(has_img.indexOf(type) >= 0) {
    children.push(createTargetImage(settings.img || {}));
  }
  if(has_text.indexOf(type) >= 0) {
    var text = settings.text || "";
    if (settings.link.accesskey) {
      text = text + ' [' + settings.link.accesskey + ']';
    }
    children.push(createTargetText(text));
  }
  if(type == 'caption') {
    children = [createTargetDiv(children)];
  }
  var tLink = createTargetA(Object.assign(
    settings.link, {
      'class_str' : type,
    }
  ));
  for(var i=0; i<children.length; i++) {
    tLink.appendChild(children[i]);
  }
  return tLink;
}

var createTargets = function (settings) {
  var targets = [];
  for(var i=0; i<settings.targets.length; i++) {
    targets.push(createTarget(settings.targets[i]));
  }
  return targets;
}


function onError (error) {
  console.error(`Error: ${error}`);
}
function onGotContent (res) {
  if(!res.speed_dial_content) {
    return;
  }

  var settings = res.speed_dial_content;
  var elBody = document.getElementsByTagName('body')[0];
  // if(settings.page && settings.page.style) {
  //   elBody.setAttribute('style', settings.page.style);
  // }
  if(settings.page && settings.page.bg_href) {
    document.styleSheets[0].insertRule(
      "body {background: url('"
        + settings.page.bg_href
        + "') no-repeat center center fixed; background-size: cover;}",
      0
    );
  }

  if(settings.page && settings.page.accent_primary && settings.page.accent_secondary) {
    drawFavicon(
      settings.page.accent_primary,
      settings.page.accent_secondary
    );
    document.styleSheets[0].insertRule(
      ".box:hover, .box:nth-child(even):hover {border-color: " + settings.page.hover_color + ";}",
      document.styleSheets[0].length-1
    );
    document.styleSheets[0].insertRule(
      ".box:hover span {color: " + settings.page.accent_secondary + ";}",
      document.styleSheets[0].length-1
    );
    document.styleSheets[0].insertRule(
      ".box:focus, .box:nth-child(even):focus {border-color: " + settings.page.accent_primary + ";}",
      document.styleSheets[0].length-1
    );
  }

  if(settings.targets && settings.targets.length) {
    var t = createTargets(settings);
    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');
    wrapper.setAttribute('style', 'grid-template-columns: repeat('+settings.cols.count+','+settings.cols.width+'px)');
    for(var i=0; i<t.length; i++) {
      wrapper.appendChild(t[i]);
    }
    elBody.appendChild(wrapper);

    // Add a small menu for the edit settings page
    var menu = document.createElement('div');
    menu.setAttribute('id', 'settings_menu');
    menu.innerHTML = '<a href="edit.html">&lt;settings /&gt;</a>';
    elBody.appendChild(menu);
  } else {
    // Show the empty state content
    var emptyStatte = document.createElement('div');
    emptyStatte.setAttribute('id', 'empty_state');
    emptyStatte.innerHTML = '<p>You do not have any links. Add links and edit other options on the <a href="edit.html">settings page</a>.</p>';
    elBody.appendChild(emptyStatte);
  }
}
function restoreContentSettings (e) {
  var gettingItem = storage.local.get('speed_dial_content', onGotContent);
  if(gettingItem) {
    gettingItem.then(onGotContent, onError);
  }
}

var drawFavicon = function(primary, secondary) {
  var iconEl = document.createElement('canvas')
  iconEl.setAttribute("width", 16)
  iconEl.setAttribute("height", 16)
  iconEl.style.opacity = '0.5';
  var hdc = iconEl.getContext('2d');
  hdc.rect(iconEl.width*0.24, iconEl.height*0.24, iconEl.width*0.5,  iconEl.height*0.5)
  var grd = hdc.createLinearGradient(0, 0, iconEl.width, iconEl.height)
  grd.addColorStop(0, primary)
  grd.addColorStop(1, secondary)
  hdc.fillStyle = grd
  hdc.fill()
  document.getElementById("favicon-rel").setAttribute("href", iconEl.toDataURL('image/png'))
}

document.addEventListener('DOMContentLoaded', function(e) {
  restoreContentSettings();
})

document.body.addEventListener('click', evt => {
  // Allow local file links
  // See https://github.com/tksugimoto/chrome-extension_open-local-file-link/blob/master/chrome-extension/background.js
  if (!evt.isTrusted) return;
  var target = evt.target;
  while (target && target.tagName !== 'A') {
    target = target.parentNode;
  }
  if (target) {
    var url = target.href;
    if (url.startsWith('file://')) {
      evt.preventDefault();
      try {
	getSystem('runtime').sendMessage({
	  method: 'openLocalFile',
	  localFileUrl: url,
	});
      } catch (e) {
        console.error(e)
      }
    }
  }
});
