const deleteButtons = document.querySelectorAll('.del')

deleteButtons.forEach((button)=>{
    console.log('adding listeners')
    button.addEventListener('click',(event)=>{
        const dropdown = document.getElementById(`confirm-${event.currentTarget.id}`)
        dropdown.classList.add("show")
        



    })
})


window.addEventListener('click', (e) => {
    if (!e.target.classList.contains('del')) {
      const dropdowns = document.getElementsByClassName('delete-dropdown');
      for (let i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        openDropdown.classList.remove('show');
      }
    }
  })