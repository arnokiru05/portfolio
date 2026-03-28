// Grab all sections that have an id attribute
const sections = document.querySelectorAll('section[id], header[id]')

// Grab all nav links
const navLinks = document.querySelectorAll('nav a')

// Every time the user scrolls, run this function
window.addEventListener('scroll', () => {

  // We'll store which section is currently visible
  let current = ''

  // Loop through every section
  sections.forEach(section => {

    // How far from the top of the page is this section?
    // Subtract 80px so it triggers just before we reach it
    const sectionTop = section.offsetTop - 80

    // If we've scrolled past this section's top, it's the current one
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id')
    }
  })

  // Now loop through nav links
  navLinks.forEach(link => {

    // Remove active class from all links first
    link.classList.remove('active')

    // Add active class only to the one matching current section
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active')
    }
  })
})

//contact form
const form = document.getElementById('contact-form')
const status = document.getElementById('form-status')

form.addEventListener("submit",(e)=>{
    //stop the page from reloading
    e.preventDefault()

    //read and clean the valus from each field
    const name=document.getElementById("fname").value.trim()
    const email=document.getElementById("femail").value.trim()
    const message=document.getElementById("fmessage").value.trim()

    //validate if all fields are filled
    if(!name||!email||!message){
        status.textContent="Please fill in all fields."
        status.style.color="#dc2626"
    }

    //simulate sending, disable btn while sending
    const btn=form.querySelector("button")
    btn.textContent="Sending"
    btn.disabled=true

    setTimeout(()=>{
        status.textContent="Message sent.I will get back to you soon."
        status.style.color="#d97706"
        form.reset()
        btn.textContent="Send message"
        btn.disabled=false
    }, 1500)
})

//github repos fetch
const GITHUB_USERNAME="arnokiru05"

async function fetchRepos(params) {
    const grid=document.getElementById("repos-grid")
    const loading=document.getElementById("repos-loading")

    try{
        //most recently updated
        const response=await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`)
            if(!response.ok)throw new Error("Failed to fetch repos")
            const repos=await response.json()
            loading.remove()
            repos.forEach(repo=>{
                //create a new div element
                const card=document.createElement("div")
                card.className="project-card"
                //fill with HTML using a template literal
                card.innerHTML=`
                    <div class="project-body" style="padding: 24px;">
                        <h3>${repo.name.replace(/-/g, ' ')}</h3>
                        <p>${repo.description || 'No description yet.'}</p>
                        <div class="tags">
                            ${repo.language ? `<span>${repo.language}</span>` : ''}
                            <span>★ ${repo.stargazers_count}</span>
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="project-link">
                         View on GitHub →
                        </a>
                    </div>
                `
                //add card to grid
                grid.appendChild(card)
            })
        } catch (err) {
            loading.textContent="Could not load repositories."
        }
    }

fetchRepos()
