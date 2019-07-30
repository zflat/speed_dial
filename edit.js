window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();
var getStorage = function () {
  var sobj
  try {
    sobj = browser.storage
  } catch (e) {
    sobj = null
  }
  try {
    if(!sobj) {
      sobj = chrome.storage
    }
  } catch (e) {
    sobj = null
  }
  return sobj
}
var storage = getStorage()

var reader = new FileReader();
reader.onload = function(e) {
    document.getElementById('file-encoded').value = reader.result;
}
var fileEncoderHandler = function(e) {
    var files = e.target.files;
    var file = files[0];
    if(file) {
        reader.readAsDataURL(file);
    } else {
        document.getElementById('file-encoded').value = '';
    }
}

var settingsChangeHandler = function (e) {
  var str = e.target.value
  // Check if it is valid JSON
  var obj = null;
  try {
    obj = JSON.parse(str)
  } catch (e) {
    return;
  }

  // Save the settings
  storage.local.set({
    speed_dial_content: obj
  });
}


function onError (error) {
  console.error(`Error: ${error}`);
}
function onGotSettings (res) {
  if(!res.speed_dial_content) {
    return;
  }
  document.getElementById("edit-settings").value = JSON.stringify(res.speed_dial_content, null, 2)
}
function restoreContentSettings (e) {
  var gettingItem = storage.local.get('speed_dial_content', onGotSettings);
  if(gettingItem) {
    gettingItem.then(onGotContent, onError);
  }
}

document.addEventListener('DOMContentLoaded',function() {
  restoreContentSettings()
  document.getElementById("file-img").onchange=fileEncoderHandler;
  document.getElementById("edit-settings").oninput=settingsChangeHandler;
},false);
