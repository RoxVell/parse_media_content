const parseFormats = {
  images: ['jpg', 'jpeg', 'png'],
  videos: ['mp4'],
  music: ['mp3']
}

function parse() {
  let body = document.body.innerHTML, results = []

  for (let format of Object.entries(parseFormats)) {
    
  }

  parseFormats.forEach(format => {
    let regExp = new RegExp(`(http|https):\/\/\\S*\.${format}`, 'gm')
    let res = body.match(regExp)
    
    if (res) results.push(...res)
  })

  return results
}

browser.runtime.onMessage.addListener(message => {
  if (message.message === 'parsePage') {
    let results = parse()

    let sending = browser.runtime.sendMessage({
      message: 'parseResults',
      results
    })
  }
})