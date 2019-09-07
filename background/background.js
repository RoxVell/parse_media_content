chrome.runtime.onInstalled.addListener(function() {
  const parseFormats = {
    images: {content: ['jpg', 'jpeg', 'png', 'svg']},
    videos: {content: ['mp4']},
    music:  {content: ['mp3', 'wav']},
    text:   {content: ['json', 'pdf', 'csv']}
  };

  for (let key in parseFormats) {
    parseFormats[key].title = chrome.i18n.getMessage(key)
  }

  chrome.storage.sync.set({ parseFormats });
});

chrome.tabs.onCreated.addListener(function (tab) {
  // Вызывается когда пользователь создаёт вкладку в браузере
  console.log(`Создана новая вкладка`);
  console.log(tab);
});

chrome.tabs.onActivated.addListener(function (tab) {
  // Вызывается когда пользователь переключает вкладки в браузере
  console.log(`Вкладка обновлена`);
  chrome.browserAction.setBadgeText({ text: "" });
})


chrome.runtime.onMessage.addListener(function(response, ...args) {
  if (response.message === 'parse') {
    let count = 0

    for (let key in response.media) {
      count += response.media[key].length
    }

    chrome.browserAction.setBadgeText({ text: String(count) });
  }
});