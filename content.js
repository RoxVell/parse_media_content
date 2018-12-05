let list = document.querySelector('.panel')

let createItem = (item) => {
  // li > a > img + span
  let panel = document.createElement('li')
  let link = document.createElement('a')
  let img = document.createElement('img')
  let title = document.createElement('span')

  // img.onerror = removeElement(this)

  link.href = item
  img.src = item
  img.classList.add('item-preview')
  title.innerText = item.slice(-3)

  link.appendChild(img)
  link.appendChild(title)
  panel.appendChild(link)
  list.appendChild(panel)
}

let updateBtn = document.querySelector('button.update')

updateBtn.addEventListener('click', () => {
  let gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true })

  browser.tabs.executeScript(null, { file: "/content_scripts/index.js" })

  gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { name: 'Anton' })
      .then(response => {
        console.log(response)
        removeAllChild(list)

        response.forEach(item => {
          createItem(item)
        })
      })
      .catch(onError)
  })
})

let removeAllChild = (node) => {
  while (node.firstChild) node.removeChild(node.firstChild)
}