const searchBar = document.querySelector('.searchBar')
const resultsPanel = document.querySelector('.resultsPanel')
const selectedPanel = document.querySelector('.selectedPanel')
const tracksPost = document.getElementById('tracksPost')
const selectedTracks = {}

class Track {
    constructor(track) {
        this.track=track
        this.id = `${track.track} - ${track.artist}`
        this.selected=false
        this.addToDOM()       
    }
    addToDOM() {
        if (!document.getElementById(this.id)) {
            const trackSection = document.createElement('section')
            trackSection.setAttribute('id',this.id)
            trackSection.innerHTML = this.id
            resultsPanel.appendChild(trackSection)

            trackSection.addEventListener('click', ()=>{
                const trackSection = document.getElementById(this.id)
                if (!this.selected) {
                    selectedPanel.appendChild(trackSection) //add track to the selected display
                    selectedTracks[this.id] = this.track //add track to the selected tracks object
                    this.selected=true
                } else {
                    trackSection.remove()
                    delete selectedTracks[this.id]
                }
                tracksPost.value=JSON.stringify(selectedTracks) //update the value of the form input to a JSON of the selected tracks object, that can be sent to the post controller
            })
        }
    }
}




searchBar.addEventListener('keyup', (e)=>{
    console.log(searchBar.value)
    const query = searchBar.value

    console.log()
    setTimeout(async () => {
        await fetch(`/search/${query}`)
        .then(results=>results.json())
        .then((results)=>{
            resultsPanel.innerHTML=''
            if (results) {
                results.forEach((song)=>{
                    new Track(song)               
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