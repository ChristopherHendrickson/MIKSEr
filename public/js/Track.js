export default class Track {
    static selectedTracks = {}
    constructor(track,selected) {
        this.track=track
        this.display = `${track.track} - ${track.artist}`
        this.selected=selected
        this.addToDOM()       
    }
    addToDOM() {
        const tracksPost = document.getElementById('tracksPost')
        const resultsPanel = document.querySelector('.resultsPanel')


        if (!document.getElementById(this.display)) {
            const trackSection = document.createElement('section')
            trackSection.setAttribute('id',this.display)
            trackSection.innerHTML = this.display
            resultsPanel.appendChild(trackSection)
            if (this.selected) {
                this.selectTrack()
            }

            trackSection.addEventListener('click', ()=>{
                const trackSection = document.getElementById(this.display)
                console.log(trackSection)
                console.log(this.selected)
                if (!this.selected) {
                    this.selectTrack()
                    console.log('selected track')
                } else { //otherwsie click to remove it from the selected
                    trackSection.remove()
                    delete Track.selectedTracks[this.display]
                    console.log('removed track')

                }

                if (Object.keys(Track.selectedTracks).length===0) {
                    tracksPost.setAttribute('value',null); //will not let a form submit wihtout atleast one track, as trackspost value is a required field

                } else {
                    const n = JSON.stringify(Track.selectedTracks)
                    tracksPost.setAttribute('value',n)  //update the value of the form input to a JSON of the selected tracks object, that can be sent to the post controller
                }
                
            })
        }
    }
    selectTrack() {
        const trackSection = document.getElementById(this.display)
        const selectedPanel = document.querySelector('.selectedPanel')
        selectedPanel.appendChild(trackSection) //add track to the selected display
        Track.selectedTracks[this.display] = this.track //add track to the selected tracks object
        console.log(this.track)
        this.selected=true
    }
}

