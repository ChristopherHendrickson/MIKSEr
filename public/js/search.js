const input = document.querySelector('input')
const resultsPanel = document.querySelector('.resultsPanel')


document.querySelector('input').addEventListener('keyup', (e)=>{
    console.log(input.value)
    const query = input.value


    

    setTimeout(async () => {
        await fetch(`/search/${query}`)
        .then(results=>results.json())
        .then((results)=>{
            resultsPanel.innerHTML=''
            if (results) {
                results.forEach((song)=>{
                    line = document.createElement('p')
                    line.innerText = `${song.track} - ${song.artist}`
                    resultsPanel.appendChild(line)
                })
            }
        })
    }, 0);
})

