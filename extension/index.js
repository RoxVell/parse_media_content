let mediaGlobal = {};

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { message: 'parse' });
});

chrome.runtime.onMessage.addListener(request => {
  if (request.message === 'parse') {
    mediaGlobal = request.media;
    initTabs();
  }
});

let currentTab = null;
let tabContent = document.querySelector('ul.tabs-content');

function createTab(category, title) {
  let tab = document.createElement('li');
  tab.classList.add('tabs__item');
  tab.category = category;
  tab.innerText = capitalize(title);
  tab.onclick = (event) => changeSurface(event.target);
  return tab;
}

const otherRenderFunction = Symbol();
const getMessage = chrome.i18n.getMessage;

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
            ${image.width ? `<li>${getMessage('size')}: ${image.width}x${image.height}</li>` : ""}
            ${image.type  ? `<li>${getMessage('format')}: ${image.type}</li>` : ""}
          </ul>
        </div>
      </li>
    `
  },
  'videos': (video) => {
    return `
      <li>
        <a target="_blank" href="${video.src}">
          <span
            class="tabs-content__icon"
            style="background-image: url('${video.poster ? video.poster : "./assets/video.png"}')"
          ></span>
        </a>
        <div>
          <p class="tabs-content__title">${video.type || "Unknown"}</p>
          <ul class="tabs-content__description">
            ${video.duration ? `<li>${getMessage('duration')}: ${video.duration}</li>` : ""}
          </ul>
        </div>
      </li>
    `
  },
  'music': (music) => {
    return `
      <li>
        <a target="_blank" href="${music.src}">
          <span
            class="tabs-content__icon"
            style="background-image: url('./assets/music.png')"
          ></span>
        </a>
        <div>
          <p class="tabs-content__title">${music.type || "Unknown"}</p>
          <ul class="tabs-content__description">
            
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
  let innerHTML = '';
  let renderFunction = renderRules[category] || renderRules[otherRenderFunction];

  for (let item of mediaGlobal[category]) {
    innerHTML += renderFunction(item);
  }

  parent.innerHTML = innerHTML;
}

function changeSurface(tab) {
  let category = tab.category;
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
    const tabContainer = document.querySelector('ul.tabs-header');
    const tabs = [];

    Object.entries(data.parseFormats)
      .forEach(([category, data]) => {
        let tab = createTab(category, data.title);
        tabs.push(tab);
        tabContainer.appendChild(tab);
      })
  
    currentTab = tabs[0];
    changeSurface(tabs[0]);
  });
}




