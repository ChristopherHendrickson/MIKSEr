const searchBar = document.querySelector('.searchBar')
const resultsPanel = document.querySelector('.resultsPanel')
const submitButton = document.getElementById('submitButton')
import Track from './Track.js';
import cleanInput from "./cleanInput.js"

let timeoutId



searchBar.addEventListener('keyup', (e)=>{
    let userInput = searchBar.value
    clearInterval(timeoutId)
    const query = cleanInput(userInput)
    if (query!='') { 
        timeoutId = setTimeout(async () => {
            await fetch(`/search/${query}/0`)
            .then(results=>results.json())
            .then((results)=>{
                resultsPanel.innerHTML=''
                if (results) {
                    results.forEach((song)=>{
                        new Track(song,false)
                    })
                }
            })
            .then(()=>{
                if (searchBar.value==''){
                    resultsPanel.innerHTML=''
                }   
            })
        }, 100); 
    } else {
        resultsPanel.innerHTML=''
    }
})




submitButton.addEventListener('click', (e)=>{
    if (Object.keys(Track.selectedTracks).length===0) {
        alert('Playlists need atleast one song')
    }
})

const hideSearch = (e) => {
    console.log(e.target.parentElement)
    if (!e.target.parentElement?.classList.contains('selectedPanel') && e.target!=searchBar) {
        resultsPanel.innerHTML=''
    }
}

window.addEventListener('click', hideSearch)