let parseFormats = ['mp4', 'jpg', 'png', 'mp3']

function parse(request, sender, sendResponse) {
  let body = document.body.innerHTML, results = []
  
  parseFormats.forEach(format => {
    let regExp = new RegExp(`(http|https):\/\/\\S*\.${format}`, 'gm')
    let res = body.match(regExp)
    
    if (res) results.push(...res)
  })

  sendResponse(results)
}

browser.runtime.onMessage.addListener(parse)