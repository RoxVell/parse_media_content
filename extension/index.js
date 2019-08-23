let mediaGlobal = {}

chrome.browserAction.onClicked.addListener(function(tab) { alert('icon clicked')});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { message: 'parse' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.message === 'parse') {
    console.log('Данные получены');
    console.log(request.media);
    mediaGlobal = request.media;
    initTabs();
  }

});


let currentTab = null
let tabContent = document.querySelector('ul.tabs-content');

function createTab(title) {
  let tab = document.createElement('li');
  tab.classList.add('tabs__item');
  tab.innerText = capitalize(title);
  tab.onclick = function(event) {
    changeSurface(event.target);
  }
  return tab;
}

const otherRenderFunction = Symbol();

const renderRules = {
  'images': (image) => {
    return `
      <li>
        <a target="_blank" href="${image.src}">
          <span class="tabs-content__icon" style="background-image: url('${image.src}')"></span>
        </a>
        <div>
          <p class="tabs-content__title">${image.title || 'Unknown'}</p>
          <ul class="tabs-content__description">
            ${image.width ? `<li>Размер: ${image.width}x${image.height}</li>` : ""}
          </ul>
        </div>
      </li>
    `
  },
  'videos': (video) => {
    return `
      <li>
        <a target="_blank" href="${video.src}">
          <span class="tabs-content__icon" ${video.poster
            ? `style="background-image: url('${video.poster}')"`
            : ""
          }></span>
        </a>
        <div>
          <p class="tabs-content__title">${video.type || "Unknown"}</p>
          <ul class="tabs-content__description">
            ${video.duration ? `<li>Длительность: ${video.duration}</li>` : ""}
          </ul>
        </div>
      </li>
    `
  },
  [otherRenderFunction]: (item) => {
    return `
      <li>
        <a target="_blank" href="${item.src}">
          <span class="tabs-content__icon"></span>
        </a>
        <div>
          <p class="tabs-content__title">Something idk</p>
          <ul class="tabs-content__description">
            <li></li>
          </ul>
        </div>
      </li>
    `
  }
}

function renderCategory(category, parent) {
  let innerHTML = ''
  let renderFunction = renderRules[category] || renderRules[otherRenderFunction];

  for (let item of mediaGlobal[category]) {
    innerHTML += renderFunction(item);
  }

  parent.innerHTML = innerHTML;
}

function changeSurface(tab) {
  let category = tab.innerText.toLowerCase();

  renderCategory(category, tabContent);

  selectTab(tab);
}

function selectTab(tab) {
  currentTab.classList.remove('tabs__item-active');
  currentTab = tab;
  currentTab.classList.add('tabs__item-active');
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function initTabs() {
  chrome.storage.sync.get('parseFormats', function(data) {
    let formats = Object.keys(data.parseFormats);
  
    let tabs = formats.map(createTab);
  
    let tabContainer = document.querySelector('ul.tabs-header');
  
    for (let tab of tabs) {
      tabContainer.appendChild(tab);
    }
  
    console.log(tabs[0]);
  
    currentTab = tabs[0];
    changeSurface(tabs[0]);
  });
}




