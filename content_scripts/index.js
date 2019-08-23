let mediaGlobal = {}

let getRegExpByFormats = formats => 
  new RegExp(`((http|https):)?\/\/\\S*?\.(${formats.join('|')})(\\?\\S*?(?="))?`, 'gm');

const decodeEntities = (link) => link.replace(/&amp;/gm, '&');

const getFromStorage = (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('parseFormats', function(data) {
      resolve(data);
    });
  });
};

function getDuration(seconds) {
  if (Number.isNaN(seconds)) return seconds;

  seconds = Math.round(seconds);
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - (hours * 3600)) / 60);
  let secs = seconds - (hours * 3600) - (minutes * 60);

  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (secs < 10) secs = '0' + secs;
  
  if (hours === '00') return `${minutes}:${secs}`;

  return `${hours}:${minutes}:${secs}`;
};

let parseMediaContent = async () => {
  console.log('Парсинг начался');

  console.log(mediaGlobal);

  let body = document.body.innerHTML;
  let documentImages = Array.from(document.images).map(image => {
    let instance = {
      src: image.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      title: image.alt
    };
    return [image.src, instance];
  });
  let documentVideos = Array.from(document.querySelectorAll('video')).map(video => {
    let instance = {
      src: video.src,
      duration: getDuration(video.duration),
      poster: video.poster,
      type: video.attributes.type ? video.attributes.type.value : null
    };
    return [video.src, instance];
  });

  let media = {
    images: new Map(documentImages),
    videos: new Map(documentVideos)
  };

  let data = await getFromStorage('parseFormats');
  const formats = data.parseFormats;

  for (let category in formats) {
    if (!media[category]) media[category] = new Map();

    let categoryRegexp = getRegExpByFormats(formats[category]);
    let results = [...body.matchAll(categoryRegexp)];

    results
      .map(value => decodeEntities(Array.isArray(value) ? value[0] : value))
      .map(value => ({ src: value }))
      .forEach(item => {
        if (!media[category].has(item.src)) {
          media[category].set(item.src, item);
        } else {
          console.log(`Такая ссылка уже добавлена ${item.src}`);
        }
      });

    media[category].delete('');
  }

  chrome.runtime.sendMessage({ message: "parse", media: handleData(media) });

  return media;
};

// window.addEventListener('load', async() => {
//   mediaGlobal = await parseMediaContent();
//   console.log(mediaGlobal);
//   handleData(mediaGlobal);
// });

function handleData(data) {
  for (let key in data) {
    let items = [];
    data[key].forEach(item => items.push(item));
    data[key] = items;
  }
  return data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ?
  "from a content script:" + sender.tab.url :
  "from the extension");

  if (request.message === 'parse') {
    parseMediaContent();
  }

  sendResponse();
});
