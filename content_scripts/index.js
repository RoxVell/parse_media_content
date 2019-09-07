let mediaGlobal = {};

let getRegExpByFormats = (formats) =>
  new RegExp(`((?<host>http|https):)?\/\/\\S*?\.(?<format>${formats.join("|")})(\\?\\S*?(?=[">]))?`,"gm");

const decodeEntities = (link) => link.replace(/&amp;/gm, "&");

const getFromStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, function(data) {
      resolve(data);
    });
  });
};

function getDuration(seconds) {
  if (Number.isNaN(seconds)) return seconds;

  seconds = Math.round(seconds);
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  let secs = seconds - hours * 3600 - minutes * 60;

  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (secs < 10) secs = "0" + secs;

  if (hours === "00") return `${minutes}:${secs}`;

  return `${hours}:${minutes}:${secs}`;
}

function getVideosFromElements() {
  let documentVideos = new Map();

  for (let video of Array.from(document.querySelectorAll("video, source"))) {
    if (!video.currentSrc) continue;

    let instance = {
      src: decodeEntities(video.currentSrc),
      type: video.attributes.type ? video.attributes.type.value : null
    };

    if (video instanceof HTMLVideoElement) {
      instance["duration"] = getDuration(video.duration);
      instance["poster"] = video.poster;
    }

    documentVideos.set(instance.src, instance);
  }

  return documentVideos;
}

function getImagesFromElements() {
  let documentImages = new Map();

  Array.from(document.images).map((image) => {
    let instance = {
      src: image.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      title: image.alt
    };

    documentImages.set(image.src, instance);
  });

  return documentImages;
}

let parseMediaContent = async () => {
  const body = document.body.innerHTML;

  let media = {
    images: getImagesFromElements(),
    videos: getVideosFromElements()
  };

  const data = await getFromStorage("parseFormats");
  const formats = data.parseFormats;

  for (let category in formats) {
    if (!media[category]) media[category] = new Map();

    let categoryRegexp = getRegExpByFormats(formats[category].content);
    let results = [...body.matchAll(categoryRegexp)];

    for (let item of results) {
      let link = decodeEntities(Array.isArray(item) ? item[0] : item);
      if (!item.groups.host) link = 'http:' + link;

      if (media[category].has(link)) continue;

      media[category].set(link, {
        src: link,
        type: item.groups.format
      });
    }

    media[category].delete("");
  }

  chrome.runtime.sendMessage({ message: "parse", media: handleData(media) });

  return media;
};

function handleData(data) {
  for (let key in data) {
    let items = [];
    data[key].forEach((item) => items.push(item));
    data[key] = items;
  }
  return data;
}

chrome.runtime.onMessage.addListener(request => {
  if (request.message === "parse") {
    parseMediaContent();
  }
});
