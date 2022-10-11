const searchBar = document.querySelector('.searchBar')
const resultsPanel = document.querySelector('.resultsPanel')
const submitButton = document.getElementById('submitButton')
import Track from './Track.js';
console.log(searchBar)

searchBar.addEventListener('keyup', (e)=>{
    const query = searchBar.value
    console.log(query)
    if (query!='') {
        console.log('passed the if')
        setTimeout(async () => {
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
                //user can delete seach phrase before fetch completes. This deletes the results if they deleted they query
                if (searchBar.value==''){
                    console.log('clearing search results')
                    resultsPanel.innerHTML=''
                }   
            })
        }, 0); 
    } else {
        resultsPanel.innerHTML=''
    }
})

submitButton.addEventListener('click', (e)=>{
    if (Object.keys(Track.selectedTracks).length===0) {
        alert('Playlists need atleast one song')
    }
})

