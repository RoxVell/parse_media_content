const parseFormats = {
  images: ['jpg', 'jpeg', 'png'],
  videos: ['mp4'],
  music: ['mp3']
}

let parseByPerformance = () => {
  if (!performance) return parseByRegexp()

  performance.getEntries().forEach(item => {
    if (item.initiatorType === 'img') {
      
    }
  })
    
}

let getRegExpByFormat = format => new RegExp(`(http|https):\/\/\\S*\.${format}`, 'gm')

let parseByRegexp = () => {
  let body = document.body.innerHTML, results = []
  
  parseFormats.forEach(format => {
    let regExp = getRegExpByFormat(format)
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