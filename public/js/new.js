const searchBar = document.querySelector('.searchBar')
const resultsPanel = document.querySelector('.resultsPanel')
// const selectedPanel = document.querySelector('.selectedPanel')
// const tracksPost = document.getElementById('tracksPost')
const submitButton = document.getElementById('submitButton')
import Track from './Track.js';


searchBar.addEventListener('keyup', (e)=>{
    console.log(searchBar.value)
    const query = searchBar.value

    console.log('search bar activating')
    setTimeout(async () => {
        await fetch(`/search/${query}`)
        .then(results=>results.json())
        .then((results)=>{
            console.log(results,'front end data')
            resultsPanel.innerHTML=''
            if (results) {
                results.forEach((song)=>{
                    new Track(song,false)        
                })
            }
        })
        .then(()=>{
            //user can delete seach phrase before fetch completes. This deletes the results if they deleted they query
            if (searchBar.value===''){
                resultsPanel.innerHTML=''
            }   
        })
    }, 0); //timeout is added 
})

submitButton.addEventListener('click', (e)=>{
    if (Object.keys(Track.selectedTracks).length===0) {
        alert('Playlists need atleast one song')
    }
})