import Track from "./Track.js";
const searchBar = document.querySelector('.searchBar')
const submitButton = document.getElementById('submitButton')
const resultsPanel = document.querySelector('.resultsPanel')
const databaseId = document.querySelector('.databaseIdDelivery').innerHTML

let playlist

const getPlaylist = async id => {
    await fetch(`/database/${id}`)
        .then(p=>p.json())
        .then(p=>playlist=p)

}


getPlaylist(databaseId) //build screen
    .then(()=>{
        playlist.tracks.forEach((song)=>{
            new Track(song,true)
        })
    })

searchBar.addEventListener('keyup', (e)=>{
    console.log(searchBar.value)
    const query = searchBar.value

    console.log('search bar activating')
    if (query!='') {
        setTimeout(async () => {
            await fetch(`/search/${query}/0`)
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

