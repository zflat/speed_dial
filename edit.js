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

var createTile = function(settings, index) {
  var tDiv  = document.createElement('div');
  tDiv.setAttribute('class', 'target');

  var hDiv = document.createElement('div');
  hDiv.setAttribute('class', 'heading-area');

  var nSpan = document.createElement('span');
  nSpan.setAttribute('class', 'heading-count-closed');
  nSpan.appendChild(document.createTextNode((index+1)))
  // tDiv.appendChild(nSpan);
  hDiv.appendChild(nSpan);

  var tSpan = document.createElement('span');
  tSpan.setAttribute('class', '');
  tSpan.setAttribute('data-heading','');
  tSpan.appendChild(document.createTextNode(
    [settings.text, settings.link.href]
      .filter(function(x) { return x;})
      .join(' | ')
  ));
  // tDiv.appendChild(tSpan);
  hDiv.appendChild(tSpan);

  tDiv.appendChild(hDiv);
  return tDiv;
}

var formHandlers = {
  willHandleClick : function (el, index, settings) {
    return function(e) {
      var elForm = document.getElementById('tile_form');
      var currIndex = elForm.getAttribute('data-current-index');
      if(currIndex === "" || currIndex != index) {
        // select this tile
        formHandlers.populateForm(index, settings);
        formHandlers.showForm(index, el, elForm);
      } else {
        formHandlers.hideForm(e)
      }
    };
  },
  showForm: function(index, el, elForm) {
    // Reset the class to the previous (before hidden) value
    var elHeading = elForm.parentNode.querySelector("[data-heading]");
    var elHeadingCount = elForm.parentNode.querySelector(".heading-count-open");
    var strClass = ''
    if(elHeading) {
      // Restore the title if there was one previously
      strClass = elHeading.getAttribute('data-class') || '';
      elHeading.setAttribute('class', strClass);
      elHeading.setAttribute('data-class', '');
      elHeading.parentNode.setAttribute('class', 'heading-area')
    }
    if(elHeadingCount) {
      elHeadingCount.setAttribute('class', 'heading-count-closed');
    }

    // Now change the class to hide the title
    elHeading = el.querySelector("[data-heading]");
    if(elHeading) {
      strClass = elHeading.getAttribute('class') || '';
      elHeading.setAttribute('data-class', strClass);
      elHeading.setAttribute('class', strClass+' blank');
      elHeading.parentNode.setAttribute('class', 'heading-area-open')
    }

    // Move the form to the new parent node
    el.appendChild(elForm);
    elForm.setAttribute('data-current-index', index);

    elHeadingCount = elForm.parentNode.querySelector(".heading-count-closed");
    if(elHeadingCount) {
      elHeadingCount.setAttribute('class', 'heading-count-open');
    }
  },
  hideForm: function(e) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var elForm = document.getElementById('tile_form');
    elForm.reset();
    var el = elForm.parentNode

    // Reset the class to the previous (before hidden) value
    var elHeading = el.querySelector("[data-heading]");
    if(elHeading) {
      var strClass = elHeading.getAttribute('data-class') || '';
      elHeading.setAttribute('class', strClass);
      elHeading.setAttribute('data-class', '');
      elHeading.parentNode.setAttribute('class', 'heading-area');
    }
    var elHeadingCount = el.querySelector(".heading-count-open");
    if(elHeadingCount) {
      elHeadingCount.setAttribute('class', 'heading-count-closed');
    }

    var elParking = document.getElementById('tile_form_parking');
    elParking.appendChild(elForm);
    elForm.setAttribute('data-current-index', '');
    return false;
  },
  populateSettings: function(currIndex, settings) {
    settings = settings || {
      targets: []
    };
    var target = settings.targets[currIndex];
    target.text = document.getElementById('txtText').value;
    target.link = {
      href: document.getElementById('txtUrl').value,
      accesskey: document.getElementById('selAccessKey').value,
    };
    target.img.width = document.getElementById('txtImgWidth').value;
    target.img.style = document.getElementById('txtImgStyle').value;
    if(document.getElementById('imgTypeUpload').checked) {
      var clearedImg = !document.getElementById('txtImgUrl').value;
      var choseImg = !!document.getElementById('fileImgVal').value;
      if(clearedImg || choseImg) {
        target.img.src  = document.getElementById('fileImgVal').value;
        target.img.name = document.getElementById('txtImgUrl').value;
      }
    } else {
      target.img.src  = document.getElementById('txtImgUrl').value,
      target.img.name = '';
    }
    target.type = document.getElementById('selType').value
    return settings;
  },
  bgImgElems: function() {
    return {
      imgVal: document.getElementById('inputImgBgVal'),
      imgUrl: document.getElementById('txtImgBgUrl'),
      typeUpload: document.getElementById('imgBgTypeUpload'),
      typeUrl: document.getElementById('imgBgTypeUrl'),
      file: document.getElementById('fileImgBg'),
      btnFile: document.getElementById('btnFileImgBg'),
    }
  },
  tileImgElems: function() {
    return {
      imgVal: document.getElementById('inputImgVal'),
      imgUrl: document.getElementById('txtImgUrl'),
      typeUpload: document.getElementById('imgTypeUpload'),
      typeUrl: document.getElementById('imgTypeUrl'),
      file: document.getElementById('fileImg'),
      btnFile: document.getElementById('btnFileImg'),
    }
  },
  populateForm: function(index, settings) {
    var elForm = document.getElementById('tile_form');
    elForm.reset();
    var tile = settings.targets[index];
    document.getElementById('txtText').setAttribute('value', tile.text || "")
    if(tile.link) {
      document.getElementById('txtUrl').setAttribute('value', tile.link.href || "")
    }
    if(tile.img) {
      document.getElementById('txtImgStyle').setAttribute('value', tile.img.style || "")
      document.getElementById('txtImgWidth').setAttribute('value', tile.img.width || "")
    }
    formHandlers.updateAccesskeys(
      tile.link.accesskey,
      settingsHandlers.accesskeys(index, settings)
    );
    formHandlers.updateTileType(tile.type);
    formHandlers.updateImg(tile.img, formHandlers.tileImgElems());
  },
  populateOptionsForm: function(settings) {
    var elForm = document.getElementById('form__general_settings')
    document.getElementById('txtNCols').value = settings.cols.count;
    document.getElementById('txtColWidth').value = settings.cols.width;
    document.getElementById('txtColor1').value = settings.page.accent_primary;
    document.getElementById('txtColor2').value = settings.page.accent_secondary;
    document.getElementById('txtColorHover').value = settings.page.hover_color;
    formHandlers.updateImg({
      src: settings.page.bg_href || '',
      name: settings.page.bg_name || '',
    }, formHandlers.bgImgElems());
    // settings.page.style
  },
  saveOptions: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var elForm = document.getElementById('form__general_settings')
    var settingsStr = window.localStorage.getItem('settings') || "{}";
    var settings = JSON.parse(settingsStr);
    settings.cols.count = document.getElementById('txtNCols').value;
    settings.cols.width = document.getElementById('txtColWidth').value;
    settings.page.accent_primary = document.getElementById('txtColor1').value;
    settings.page.accent_secondary = document.getElementById('txtColor2').value;
    settings.page.hover_color = document.getElementById('txtColorHover').value;
    if(document.getElementById('imgBgTypeUpload').checked) {
      var clearedImg = !document.getElementById('txtImgBgUrl').value;
      var choseImg = !!document.getElementById('fileImgBgVal').value;
      if(clearedImg || choseImg) {
        settings.page.bg_href = document.getElementById('fileImgBgVal').value;
        settings.page.bg_name = document.getElementById('txtImgBgUrl').value;
      }
    } else {
      settings.page.bg_href = document.getElementById('txtImgBgUrl').value,
      settings.page.bg_name = '';
    }

    settingsHandlers.save(settings);
    document.getElementById('uiOptionsSaved').setAttribute('class', 'm-fadeIn');
    window.setTimeout(function() {
      document.getElementById('uiOptionsSaved').setAttribute('class', 'm-fadeOut');
    }, 2000);
  },
  insertTile: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var settingsStr = window.localStorage.getItem('settings') || "{}";
    var settings = JSON.parse(settingsStr);
    settings.targets.push({
      text: '',
      link: {
        href: '',
        accesskey: '',
      },
      img: {
        src: '',
        style: '',
        name: '',
        width: '90',
      },
      type: 'caption',
    });
      document
      .getElementById('tile_form')
      .setAttribute('data-current-index', settings.targets.length-1);
    settingsHandlers.save(settings);
  },
  removeTile: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var elForm = document.getElementById('tile_form');
    var currIndex = elForm.getAttribute('data-current-index');
    var settingsStr = window.localStorage.getItem('settings') || "{}";
    var settings = JSON.parse(settingsStr);
    settings.targets.splice(currIndex, 1);
    settingsHandlers.save(settings);
  },
  willSwapTile: function(n) {
    return function(e) {
      e.preventDefault();
      e.stopPropagation();
      var elForm = document.getElementById('tile_form');
      var currIndex = elForm.getAttribute('data-current-index');
      var newIndex = Number.parseInt(currIndex) + n;
      var settingsStr = window.localStorage.getItem('settings') || "{}";
      var settings = JSON.parse(settingsStr);
      if(newIndex < 0 || newIndex >= settings.targets.length) {
        return;
      };
      var swap = settings.targets[newIndex];
      settings.targets[newIndex] = settings.targets[currIndex];
      settings.targets[currIndex] = swap;
      // Update the DOM current index value so that then new location is opened after update
      elForm.setAttribute('data-current-index', newIndex);
      settingsHandlers.save(settings);
    }
  },
  saveTile: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var elForm = document.getElementById('tile_form');
    var currIndex = elForm.getAttribute('data-current-index');
    if(!currIndex) {
      return false;
    }
    var settingsStr = window.localStorage.getItem('settings') || "{}";
    var settings = formHandlers.populateSettings(currIndex, JSON.parse(settingsStr));
    settingsHandlers.save(settings);
    document.getElementById('uiTileSaved').setAttribute('class', 'm-fadeIn');
    window.setTimeout(function() {
      document.getElementById('uiTileSaved').setAttribute('class', 'm-fadeOut');
    }, 2000);
    return true;
  },
  _imgWillOnload: function (el, reader) {
    return function(e) {
      el.value = reader.result
    }
  },
  imgWillFileEncode: function (elVal, elName) {
    var reader = new window.FileReader();
    reader.onload = formHandlers._imgWillOnload(elVal, reader);
    return function(e) {
      var files = e.target.files;
      var file = files[0];
      if(file) {
        reader.readAsDataURL(file);
        elName.value = file.name
      } else {
        elVal.value = '';
      }
    }
  },
  updateAccesskeys: function(current, available) {
    var elOpts = document.getElementById('selAccessKey');
    while (elOpts.firstChild) {
      elOpts.removeChild(elOpts.firstChild);
    }
    var optNone = document.createElement('option');
    optNone.value = "";
    optNone.appendChild(document.createTextNode('None'));
    elOpts.appendChild(optNone);
    for(var i=0; i<available.length; i++) {
      var k = available[i];
      var elK = document.createElement('option');
      elK.setAttribute('value', k)
      if(k === current) {
        elK.setAttribute('selected', true);
      }
      elK.appendChild(document.createTextNode(k.toUpperCase()));
      elOpts.appendChild(elK);
    }
  },
  updateTileType: function(type) {
    var current = null;
    var optsType = document.getElementById('selType').children;
    for(var i=0; i<optsType.length; i++) {
      if(optsType[i].getAttribute('value') == type) {
        optsType[i].setAttribute('selected', true);
        current = optsType[i];
      } else {
        optsType[i].removeAttribute('selected');
      }
    }
    return current;
  },
  isDataImg: function(src) {
    return src && src.indexOf('data') === 0;
  },
  updateImg: function(img, elems) {
    img = img || {
      src: '',
      name: '',
    }
    var hasData = formHandlers.isDataImg(img.src);
    var hasUrl  = !hasData && img.src.length > 0;
    elems.imgVal.value = '';
    formHandlers.toggleImgFile(hasData, img, elems);
  },
  toggleImgFile: function(file_enabled, img, elems) {
    img = img || {
      src: '',
      name: '',
    };
    var elUrl = elems.imgUrl;
    elems.typeUpload.checked = false;
    elems.typeUrl.checked = false;
    elUrl.value = '';
    elUrl.removeAttribute('disabled');
    if(file_enabled) {
      elems.typeUpload.checked = true;
      elems.btnFile.setAttribute('class', '');
      elUrl.setAttribute('disabled', 'disabled');
      elUrl.value = img.name || '';
    } else {
      elems.typeUrl.checked = true;
      elems.btnFile.setAttribute('class', 'blank');
      elUrl.value = img.src;
    }
  },
  willToggleImgFile: function(elOn, elOff, elemsCb) {
    elOn.onchange  = formHandlers.willEnableImgUrl(elemsCb);
    elOff.onchange = formHandlers.willEnableImgFile(elemsCb);
  },
  willEnableImgFile: function(elemsCb) {
    return function(e) {
      var elems = elemsCb();
      formHandlers.toggleImgFile(
        true,
        {name: formHandlers.swapImgVal(elems.imgVal, elems.imgUrl)},
        elems
      );
    }
  },
  willEnableImgUrl: function(elemsCb) {
    return function(e) {
      var elems = elemsCb();
      formHandlers.toggleImgFile(
        false,
        {src: formHandlers.swapImgVal(elems.imgVal, elems.imgUrl)},
        elems
      );
    }
  },
  swapImgVal: function(elImgVal, elImgUrl) {
    var prevVal = elImgVal.value
    elImgVal.value = elImgUrl.value
    return prevVal;
  }
};

var settingsHandlers = {
  accesskeys: function (current_index, settings) {
    var available = [];
    for(var cc='a'.charCodeAt(0); cc<='a'.charCodeAt(0)+25; cc++) {
      available.push(String.fromCharCode(cc));
    }
    for(var i=0; i<settings.targets.length; i++) {
      if(current_index !=="" && i == current_index) {
        continue;
      }
      var k = settings.targets[i].link.accesskey;
      if(k) {
        available.splice(available.indexOf(k),1)
      }
    }
    return available;
  },
  downloadSettings: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var settingsStr = window.localStorage.getItem('settings') || "{}";
    var elA = document.getElementById('aDownload');
    elA.setAttribute('href', "data:application/octet,"+encodeURIComponent(settingsStr));
    elA.click();

    // Trigger a download
    // window.location.href = "data:application/octet,"+encodeURIComponent("{'style':'','links':''}");
  },
  uploadSettings: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var elFile = document.getElementById('fileSettings')
    elFile.click();
  },
  settingsReader: new FileReader(),
  _settingsWillOnload: function (reader) {
    return function(e) {
      var settings = {};
      try {
        settings = JSON.parse(reader.result)
      } catch (e) {
        return;
      }
      document.getElementById('tile_form').setAttribute('data-current-index', '');
      settingsHandlers.save(settings);
    }
  },
  willImportSettings: function() {
    var reader = settingsHandlers.settingsReader
    reader.onload = settingsHandlers._settingsWillOnload(reader);
    return function(e) {
      e.preventDefault();
      e.stopPropagation();
      var files = e.target.files;
      var file = files[0];
      if(file) {
        reader.readAsText(file);
      }
    }
  },
  save: function(settings) {
    var settingItem = storage.local.set(
      {speed_dial_content: settings},
      restoreContentSettings
    );
    if(settingItem) {
      settingItem.then(restoreContentSettings, onError);
    }
  }
};

var redrawTiles = function(settings) {
  var tiles = [];
  var currIndex = document
      .getElementById('tile_form')
      .getAttribute('data-current-index');
  var elTile = null;

  formHandlers.hideForm();
  var elWrapper = document.getElementById("tiles_wrapper");
  // Remove all children
  while (elWrapper.firstChild) {
    elWrapper.removeChild(elWrapper.firstChild);
  }
  document.getElementById("subheader__links")
    .setAttribute('class', (settings.targets.length) ? '' : 'remove' );
  for(var i=0; i<settings.targets.length; i++) {
    var t = createTile(settings.targets[i], i);
    if(i === 0) {
      t.setAttribute('class', t.getAttribute('class') +' first');
    }
    if(i === settings.targets.length-1) {
      t.setAttribute('class', t.getAttribute('class') +' last');
    }
    var elHeading = t.querySelector("[data-heading]").parentNode;
    elHeading.onclick = formHandlers.willHandleClick(t, i, settings);
    elWrapper.appendChild(t);
    if(currIndex == i && currIndex !== "") {
      elTile = t;
    }
  }

  if(elTile) {
    var elForm = document.getElementById('tile_form');
    formHandlers.populateForm(currIndex, settings);
    formHandlers.showForm(currIndex, elTile, elForm);
  }
}


function onError (error) {
  console.error(`Error: ${error}`);
}
function onGotSettings (res) {
  if(!res.speed_dial_content) {
    return;
  }
  window.localStorage.setItem('settings', JSON.stringify(res.speed_dial_content));
  redrawTiles(res.speed_dial_content);
  formHandlers.populateOptionsForm(res.speed_dial_content);
}
function restoreContentSettings (e) {
  var gettingItem = storage.local.get('speed_dial_content', onGotSettings);
  if(gettingItem) {
    gettingItem.then(onGotSettings, onError);
  }
}

document.addEventListener('DOMContentLoaded',function() {
  restoreContentSettings()
  document.getElementById("btnSaveGeneral").onclick = formHandlers.saveOptions;
  document.getElementById("btnSaveTile").onclick = formHandlers.saveTile;
  document.getElementById("btnCancelTile").onclick = formHandlers.hideForm;
  document.getElementById("fileImg").onchange = formHandlers.imgWillFileEncode(
    document.getElementById("fileImgVal"),
    document.getElementById("txtImgUrl")
  );
  formHandlers.willToggleImgFile(
    document.getElementById("imgTypeUrl"),
    document.getElementById("imgTypeUpload"),
    formHandlers.tileImgElems
  )
  document.getElementById("btnExport").onclick = settingsHandlers.downloadSettings;
  document.getElementById("btnImport").onclick = settingsHandlers.uploadSettings;
  document.getElementById("fileSettings").onchange = settingsHandlers.willImportSettings();
  document.getElementById("fileImgBg").onchange = formHandlers.imgWillFileEncode(
    document.getElementById("fileImgBgVal"),
    document.getElementById("txtImgBgUrl")
  );
  formHandlers.willToggleImgFile(
    document.getElementById("imgBgTypeUrl"),
    document.getElementById("imgBgTypeUpload"),
    formHandlers.bgImgElems
  )
  document.getElementById("btnAddTile").onclick = formHandlers.insertTile;
  document.getElementById("btnRemovelTile").onclick = formHandlers.removeTile;
  document.getElementById("btnMoveDown").onclick = formHandlers.willSwapTile(1);
  document.getElementById("btnMoveUp").onclick = formHandlers.willSwapTile(-1);
  document.getElementById("btnFileImgBg").onclick = function(e) {
    document.getElementById("fileImgBg").click();
  }
  document.getElementById("btnFileImg").onclick = function(e) {
    document.getElementById("fileImg").click();
  }
},false);
