let list = document.querySelector('.panel')

let renderItems = (items) => {
  
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg.message === 'parseResults') {
    renderItems(msg.results)
  }
});

let gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true })

gettingActiveTab.then(tabs => {
  browser.tabs.sendMessage(tabs[0].id, { message: 'parsePage' })
})

browser.tabs.executeScript(null, { file: "./content_scripts/index.js" })