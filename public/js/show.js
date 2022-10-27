import cleanInput from "./cleanInput.js"
const controller = ()=>{
    console.log('controller active')
    const searchBar = document.querySelector('.searchBar')
    const resultsPanel = document.querySelector('.resultsPanel')
    const guessDisplays = document.querySelectorAll('.guessDisplay')
    const summaryDisplays = document.querySelectorAll('.summaryDisplay')
    const guessButton = document.querySelector('.guessButton')
    const skipButton = document.querySelector('.skipButton')
    const exitButton = document.querySelector('.exitButton')
    const playAgainButton = document.querySelector('.playAgainButton')
    const trackPanel = document.querySelector('.trackPanel')
    const iframePanel = document.querySelector('.iframePanel')
    const iframeSecs = document.querySelectorAll('.iframeSec')
    const playButtons = document.querySelectorAll('.playButton')
    const nextButtons = document.querySelectorAll('.nextButton')
    const summaryButton = document.querySelector('.summaryButton')
    const searchPanel = document.querySelector('.searchPanel')
    let currentTrackIndex = 0
    let playlist
    let guessCount = 0
    const listOfAudioPreviews = []
    const warpFastRate = 5
    const warpSlowRate = 0.2
    const volume = 0.8
    const scores=[]
    
    class Aud {
        static instances = []
        constructor(url,warp,id) {
            this.audioObject = new Audio(url)
            this.audioObject.volume = volume
            this.warp=warp
            this.id=id
            this.audioObject.playbackRate = warp=="Fast" ? warpFastRate : warp=="Slow" ? warpSlowRate : 1
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
        const currentTrackPreview = listOfAudioPreviews[currentTrackIndex]
        const audio = currentTrackPreview.audioObject
        const trackPlayButton = document.getElementById(currentTrackPreview.id)
        if (audio.paused) { //this whole function could be done much better with clearing timeouts
            if (currentTrackPreview.warp==='Snippet') {
                trackPlayButton.classList.toggle('paused',false)
                audio.play()
                
                setTimeout(() => {
                    audio.pause()
                    audio.currentTime=0
                    trackPlayButton.classList.toggle('paused',true)

                }, 2**(guessCount)*1000); //1 second / 2 seconds / 4 seconds / 8 seconds / 16 seconds
            } else {
                audio.playbackRate = playlist.warp === 'Slow' ? warpSlowRate+((1-warpSlowRate)/4)*guessCount : warpFastRate-((warpFastRate-1)/4)*guessCount
                trackPlayButton.classList.toggle('paused',false)
                audio.play()
                setTimeout(() => {
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
    
    
    const getPlaylist = async () => {
        console.log('database ID: ', databaseId)
        if (databaseId) {
            await fetch(`/database/${databaseId}`)
                .then(p=>p.json())
                .then(p=>playlist=p)
                .then(()=>console.log('got playlist'))
        } else {
            playlist = JSON.parse(randomPlaylist)

        }
        createAudios(playlist)
    }

    const createAudios = (playlist) => {
        playlist.tracks.forEach((track)=>{
            const trackPlayButton = document.getElementById(track.id)
            listOfAudioPreviews.push(new Aud(track.preview,playlist.warp,track.id))
            trackPlayButton.addEventListener('click',audControl)
        })
    }
    
    getPlaylist()

    let timeoutId

    searchBar.addEventListener('keyup', (e)=>{
        let userInput = searchBar.value
        guessButton.dataset.submittable="false"
        guessButton.classList.toggle('submittable',false)
        clearTimeout(timeoutId)
        const query = cleanInput(userInput)
        if (query!='') {
            timeoutId = setTimeout(async () => {
                await fetch(`/search/${query}/0`)
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
            }, 100);
        } else {
            resultsPanel.innerHTML=''
        }
    })

    const roundEnd = (succeeded=true) => {
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
        summaryButton.classList.remove('hide')
        scores.push(succeeded ? guessCount : 'Failed')
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
        summaryButton.classList.add('hide')



    }
    
    const skip = () => {
        const disp = guessDisplays[currentTrackIndex*5+guessCount]
        disp.innerHTML = 'Skipped'
        searchBar.value=''
        disp.classList.add('incorrect')
        guessCount+=1
        guessButton.dataset.submittable="false"
        listOfAudioPreviews.forEach((e)=>{
            e.audioObject.currentTime=0
            e.audioObject.pause()
        })

        playButtons.forEach((e)=>{
            e.classList.toggle('paused',true)
        })


        if (guessCount>=5) {
            roundEnd(false)
        }
    }



    skipButton.addEventListener('click',skip)

    guessButton.addEventListener('click',(e)=>{

        if (guessButton.dataset.submittable==="true" && playlist) { //ensure playlist fetch has completed 
            guessButton.dataset.submittable="false"
            guessButton.classList.toggle('submittable',false)
            const userGuess = searchBar.value
            const disp = guessDisplays[currentTrackIndex*5+guessCount]
            const track = playlist.tracks[currentTrackIndex]
            disp.innerHTML = userGuess
            guessCount+=1
            if (userGuess===track.display) { //CORRECT ANSWER
                searchBar.value=''
                roundEnd(true)
                resultsPanel.innerHTML=''
                disp.classList.add('correct')
                
                
            } else { //INCORRECT ANSWER
                searchBar.value=''
                if (userGuess.slice(userGuess.lastIndexOf('-')+2)===track.display.slice(track.display.lastIndexOf('-')+2)) {
                    disp.classList.add('partiallyCorrect')
                } else {
                    disp.classList.add('incorrect')
                }
                if (guessCount>=5) {
                    roundEnd(false)
                }
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
            currentTrackIndex+=1
            guessCount=0
            setTimeout(roundStart,100)
        })
    })
    
    summaryButton.addEventListener('click', (e)=>{
        trackPanel.style.translate=`${-(currentTrackIndex+1)*100}vw`
        iframeSecs[currentTrackIndex].remove()
        summaryDisplays.forEach((e,i)=>{
            let d
            if (scores[i]==='Failed') {
                d = scores[i]
            } else {
                d = `Guesses: ${scores[i]}`
            }
            e.querySelector('.score').innerHTML = d
        })

    })

    
    exitButton.addEventListener('click', ()=>{
        window.location.href = "/playlists"
    })

    if (playAgainButton) { //playAgainbutton is only in the DOMS for random playlist
        playAgainButton.addEventListener('click', ()=>{
            window.location.href = `/playlists/random/${playlist.warp}`
        })
    }
    const hideSearch = (e) => {
        resultsPanel.innerHTML=''
    }

    window.addEventListener('click', hideSearch)


}
window.onload=controller
