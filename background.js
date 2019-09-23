'use strict';

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

getSystem('runtime').onMessage.addListener((message, sender) => {
  if (message.method === 'openLocalFile') {
    const localFileUrl = message.localFileUrl;
    const tab = sender.tab;
    openLocalFile(localFileUrl, tab);
  }
});

const openLocalFile = (localFileUrl, baseTab) => {
  var tabs = getSystem('tabs');
  tabs.create({
    url: localFileUrl,
    index: baseTab.index + 1,
  });
};
