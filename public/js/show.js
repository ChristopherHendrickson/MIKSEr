const controller = ()=>{
    const searchBar = document.querySelector('.searchBar')
    const resultsPanel = document.querySelector('.resultsPanel')
    const guessDisplays = document.querySelectorAll('.guessDisplay')
    const guessButton = document.querySelector('.guessButton')
    const skipButton = document.querySelector('.skipButton')
    const trackPanel = document.querySelector('.trackPanel')
    const iframePanel = document.querySelector('.iframePanel')
    const iframeSecs = document.querySelectorAll('.iframeSec')
    const playButtons = document.querySelectorAll('.playButton')
    const nextButtons = document.querySelectorAll('.nextButton')
    const databaseId = document.querySelector('.databaseIdDelivery').innerHTML
    const searchPanel = document.querySelector('.searchPanel')
    let currentTrackIndex = 0
    let playlist
    let guessCount = 0
    const listOfAudioPreviews = []
    const warpFastRate = 2.8
    const warpSlowRate = 0.3
    const volume = 0.8

    
    class Aud {
        static instances = []
        constructor(url,warp,id) {
            this.audioObject = new Audio(url)
            this.audioObject.volume = volume
            this.warp=warp
            this.id=id
            console.log(warp)
            this.audioObject.playbackRate = warp=="Fast" ? warpFastRate : warp=="Slow" ? warpSlowRate : 1
            console.log(this.audioObject.playbackRate)
            Aud.instances.push(this)
        }
    }


    class Track {
        constructor(track) {
            this.track = track
            this.selected = false
            this.display = `${track.track} - ${track.artist}`
            this.addToDOM()
            

            
        }
        addToDOM() {
            if (!document.getElementById(this.track._id)) {
                const trackSection = document.createElement('section')
                // trackSection.setAttribute('id',this.track._id)
                trackSection.innerHTML = this.display
                resultsPanel.appendChild(trackSection)

                trackSection.addEventListener('click', ()=>{
                    searchBar.value=this.track.display
                    guessButton.dataset.submittable="true"
                    guessButton.classList.toggle('submittable',true)
                    resultsPanel.innerHTML=""
                
                })
            }
        }
    }

    const audControl = () => {
        console.log('controller is connected')
        const currentTrackPreview = listOfAudioPreviews[currentTrackIndex]
        const audio = currentTrackPreview.audioObject
        console.log(audio.playbackRate)
        const trackPlayButton = document.getElementById(currentTrackPreview.id)
        if (audio.paused) {
            if (currentTrackPreview.warp==='Snippet') {
                trackPlayButton.classList.toggle('paused',false)
                console.log('got to the play')
                console.log('guess count:',guessCount)
                audio.play()
                
                setTimeout(() => {
                    console.log('timeout happened')
                    audio.pause()
                    audio.currentTime=0
                    trackPlayButton.classList.toggle('paused',true)

                }, 2**(guessCount)*1000);
            } else {
                trackPlayButton.classList.toggle('paused',false)
                audio.play()
                console.log(audio.duration/audio.playbackRate)
                setTimeout(() => {
                    console.log('timeout happened')
                    if (audio.paused) {
                        trackPlayButton.classList.toggle('paused',true)
                    }
                }, 100+(audio.duration-audio.currentTime)*1000/audio.playbackRate);
            }
        } else {
            trackPlayButton.classList.toggle('paused',true)
            audio.pause()
        }
    }
    
    
    const getPlaylist = async id => {
        await fetch(`/database/${id}`)
            .then(p=>p.json())
            .then(p=>playlist=p)
            .then((playlist)=>{
                playlist.tracks.forEach((track)=>{
                    const trackPlayButton = document.getElementById(track.id)
                    console.log(track.preview)
                    listOfAudioPreviews.push(new Aud(track.preview,playlist.warp,track.id))
                    trackPlayButton.addEventListener('click',audControl)

                })
            })
    }

    

    getPlaylist(databaseId)


    searchBar.addEventListener('keyup', (e)=>{
        const query = searchBar.value
        guessButton.dataset.submittable="false"
        guessButton.classList.toggle('submittable',false)
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
                if (searchBar.value==='') {
                    resultsPanel.innerHTML=''
                }   
            })
        }, 0);
    })

    const roundEnd = () => {
        nextButtons.forEach((e)=> {
            e.classList.remove('hide')
        })
        playButtons.forEach((e)=> {
            e.classList.add('hide')
        })
        searchPanel.classList.add('hide')
        iframeSecs.forEach((e)=>{
            e.classList.remove('dropped')
        })
        Aud.instances.forEach((aud)=>{
            aud.audioObject.pause()
        })
    }
    const roundStart = () => {
        iframeSecs.forEach((e)=>{
            e.classList.add('dropped')
        })
        nextButtons.forEach((e)=> {
            e.classList.add('hide')
        })
        playButtons.forEach((e)=> {
            e.classList.remove('hide')
        })
        searchPanel.classList.remove('hide')
        iframeSecs[currentTrackIndex-1].remove()


    }
    
    const skip = () => {
        const track = playlist.tracks[currentTrackIndex]
        const disp = guessDisplays[currentTrackIndex*5+guessCount]
        disp.innerHTML = 'Skipped'
        searchBar.value=''
        disp.classList.add('incorrect')
        guessCount+=1
        if (guessCount>=5) {
            roundEnd()
        }
    }

    skipButton.addEventListener('click',skip)

    guessButton.addEventListener('click',(e)=>{
        //iterate over 
        if (guessButton.dataset.submittable==="true" && playlist) { //ensure playlist fetch has completed 
            const userGuess = searchBar.value
            const disp = guessDisplays[currentTrackIndex*5+guessCount]
            const track = playlist.tracks[currentTrackIndex]
            disp.innerHTML = userGuess
            guessCount+=1
            if (userGuess===track.display) { //CORRECT ANSWER
                searchBar.value=''
                roundEnd()
                resultsPanel.innerHTML=''
                disp.classList.add('correct')
                
                
            } else { //INCORRECT ANSWER
                searchBar.value=''
                disp.classList.add('incorrect')
                if (guessCount>=5) {
                    roundEnd()
                }
            }
            // updateScores()
            
            console.log(guessCount)
            if (currentTrackIndex+1>=playlist.length) {
                showSummary()
            }

        } else {
            alert('Unknown Song')
        }
    })

    nextButtons.forEach((e)=>{
        e.addEventListener('click', () => {
            trackPanel.style.translate=`${-(currentTrackIndex+1)*100}vw`
            // iframePanel.style.translate=`${-(currentTrackIndex+1)*100}vw`
            const track = playlist.tracks[currentTrackIndex]
            console.log(track)
            currentTrackIndex+=1
            guessCount=0
            setTimeout(roundStart,100)
        })
    })
    

    


}
window.onload=controller