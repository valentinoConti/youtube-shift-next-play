// Extension CSS
const estilo = document.createElement('style')
estilo.innerHTML = `
ytd-compact-video-renderer.selected {
  // outline: 2px solid red;
  background: linear-gradient(to right, rgba(248,80,50,0.75), rgba(231,56,39,0.4));
  border-radius: 3px;
}
.shift-next-item {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 18px;
  color: rgb(248,80,50);
}
div.shift-next-number {
  font-size: 28px;
  color: black
}

#head {
  position: relative;
}
.playlist-element {
  outline: 1px solid black;
  position: absolute;
  background: linear-gradient(to right, #f85032, #e73827);
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding-top: 2px;
  text-align: center;
  cursor: pointer;
  font-size: 15px;
  user-select: none;
}
`
// Variables
let numero = 0
let playlist = []
const initialText = '<div>QUICK PLAYLIST</div>'

// Playlist Element
const playlistElem = document.createElement('div')
playlistElem.classList.add('playlist-element')
playlistElem.innerHTML = initialText
playlistElem.onclick = () => {
  if (playlistElem.innerHTML === initialText) {
    playlist.forEach((vid) => {
      playlistElem.innerHTML += `
        <div>
          ${vid.num}) ${vid.title}
        </div>
      `
    })
    document.querySelector('#head').style.height = `${playlistElem.scrollHeight}px`
  }
}

// wait for the DOM to be ready and then start the extension
const loading = () => {
  if (document.querySelector('#head') && document.querySelector('.ytd-compact-video-renderer')) {
    startExtension()
  } else {
    const waiting = setTimeout(() => { loading() }, 500)
  }
}

chrome.runtime.onMessage.addListener(
  (request) => {
    if (request.length > 0){
      playlist = request
      numero = playlist[playlist.length - 1].num
    }
    console.log(playlist)
    loading()
  }
)

// Extension code
function startExtension () {
  // Youtube elements
  const actual = document.querySelector('.ytp-time-current')
  const total = document.querySelector('.ytp-time-duration')

  // Append CSS
  document.querySelector('body').appendChild(estilo)
  
  // Functions
  /*
   * Receives the information of a video, adds it to the playlist and
   * returns the div showing its playlist order to insert over the video.
   */
  function addToPĺaylist(num, title, link) {
    playlist.push({num, title, link})
    const numDiv = document.createElement('div')
    numDiv.classList.add('shift-next-item')
    numDiv.classList.add('shift-next-number')
    numDiv.innerText = num
    return numDiv
  }
  
  function showPlaylist(bool) {
    if (bool) document.querySelector('#head').appendChild(playlistElem);
    else if (document.querySelector('#head').contains(playlistElem)) {
      document.querySelector('#head').removeChild(playlistElem)
      playlistElem.innerHTML = initialText
      document.querySelector('#head').style.height = 'inherit'
    }
  }
  
  /*
   * Shows a red box on all the videos when shift is pressed, if user clicks on a video while
   * pressing shift this will add that video to the playlist and put a order number on it.
   */
  function keydown(ev) {
    if (ev.shiftKey) {
      if (playlist.length > 0) showPlaylist(true)
      document.querySelectorAll('ytd-compact-video-renderer').forEach((video) => {
        video.classList.add('selected')
        const link = video.querySelector('a#thumbnail').href
        const title = video.querySelector('#video-title').innerText
        video.onclick = (ev) => {
          ev.preventDefault()
          numero++
          const numeroDiv = addToPĺaylist(numero, title, link)
          video.appendChild(numeroDiv)
        }
      })
      document.querySelectorAll('.shift-next-item').forEach((number) => {
        number.classList.add('shift-next-number')
      })
    }
  }
  
  // Hides the red box and makes the playlist order numbers get small.
  function keyup(ev) {
    if (ev.key === 'Shift') {
      if (playlist.length > 0) showPlaylist(false)
      document.querySelectorAll('ytd-compact-video-renderer').forEach((video) => {
        video.classList.remove('selected')
        video.onclick = (ev) => true
      })
      document.querySelectorAll('.shift-next-item').forEach((number) => {
        number.classList.remove('shift-next-number')
      })
    }
  }
  
  // Event listeners
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  
  // Watch out for the actual video playing to end, send user to next playlist video.
  const timeout = () => {
    if (actual.innerText === total.innerText) {
      window.location = playlist[0].link
      chrome.runtime.sendMessage(playlist, () => {});
    } else {
      setTimeout(() => { timeout() }, 1500)
    }
  }
  timeout()
}