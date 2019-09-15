const actual = document.querySelector('.ytp-time-current')
const total = document.querySelector('.ytp-time-duration')

const estilo = document.createElement('style')
estilo.innerHTML = `
ytd-compact-video-renderer.selected {
  outline: 2px solid red;
}
.shift-next-item {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 18px;
  color: red;
}
div.shift-next-number {
  font-size: 28px;
}
`
document.querySelector('body').appendChild(estilo)

/* 
 * Playlist. Array. Looks like this:
 * ['https://www.youtube.com/watch?v=gW165h1-AZE', 'https://www.youtube.com/watch?v=Es7IKbFoDHc']]
 */
let numero = 0
let playlist = []
function addToPĺaylist(num, title, link) {
  playlist.push({num, title, link})
  const numDiv = document.createElement('div')
  numDiv.classList.add('shift-next-item')
  numDiv.classList.add('shift-next-number')
  numDiv.innerText = num
  return numDiv
}

// Show a red box on all the videos when shift is pressed, if user clicks on a video while pressing shift
// this will add that video to the playlist and put a order number on it.
function keydown(ev) {
  if (ev.shiftKey) {
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
    document.querySelectorAll('ytd-compact-video-renderer').forEach((video) => {
      video.classList.remove('selected')
      video.onclick = (ev) => true
    })
    document.querySelectorAll('.shift-next-item').forEach((number) => {
      number.classList.remove('shift-next-number')
    })
  }
}

window.addEventListener('keydown', keydown)
window.addEventListener('keyup', keyup)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.length > 0){
      playlist = request
      numero = playlist[playlist.length - 1].num
    }
    console.log(playlist)
  });

const timeout = () => {
  if (actual.innerText === total.innerText) {
    chrome.runtime.sendMessage(playlist, () => {});
    window.location = playlist[0].link
  } else {
    setTimeout(() => { timeout() }, 1500)
  }
}
if (actual) timeout()