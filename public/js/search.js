const input = document.querySelector('input')
const resultsPanel = document.querySelector('.resultsPanel')
 

document.querySelector('input').addEventListener('keyup', (e)=>{
    console.log(e)
    console.log(input.value)
    setTimeout(async () => {
        await fetch(`/search/${input.value}`)
        .then(results=>results.json())
        .then((results)=>{
            console.log(results)
            resultsPanel.innerHTML=''
            if (results) {
                results.forEach((song)=>{
                    line = document.createElement('p')
                    line.innerText = `${song.track} - ${song.artist}`
                    resultsPanel.appendChild(line)
                })
            }
        })
    }, 0); //

})