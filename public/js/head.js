document.querySelector('.accbtn').addEventListener('click',()=>{
    document.getElementById('accdrop').classList.toggle("show")
})

window.addEventListener('click', (e) => {
    if (!e.target.matches('.accbtn')) {
      const dropdowns = document.getElementsByClassName('dropdown-content');
      for (let i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        openDropdown.classList.remove('show');
      }
    }
  })