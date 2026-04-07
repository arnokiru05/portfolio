// Dark/Light mode
const themeToggle = document.getElementById('theme-toggle')

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const savedTheme = localStorage.getItem('theme') || getSystemTheme()
applyTheme(savedTheme)

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme')
  applyTheme(current === 'dark' ? 'light' : 'dark')
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    applyTheme(e.matches ? 'dark' : 'light')
  }
})

//Scroll reveal animations 
const revealElements = document.querySelectorAll(
  '.section, .project-card, .skill, .timeline-item, .contact-card'
)

revealElements.forEach(el => el.classList.add('reveal'))

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible')
      }, index * 60)
      revealObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.1 })

revealElements.forEach(el => revealObserver.observe(el))

//Typing animation on hero heading
const heroHeading = document.querySelector('header h1')
const headingText = heroHeading.textContent
heroHeading.textContent = ''

let charIndex = 0
const typeWriter = () => {
  if (charIndex < headingText.length) {
    heroHeading.textContent += headingText.charAt(charIndex)
    charIndex++
    setTimeout(typeWriter, 50)
  }
}

setTimeout(typeWriter, 400)

// Grab all sections that have an id attribute
const sections = document.querySelectorAll('section[id], header[id]')

// Grab all nav links
const navLinks = document.querySelectorAll('nav a')

//  Mobile menu toggle 
const menuToggle = document.querySelector('.menu-toggle')
const navMenu = document.querySelector('nav ul')

menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open')
  menuToggle.setAttribute('aria-expanded', isOpen)
})

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open')
    menuToggle.setAttribute('aria-expanded', false)
  })
})

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
const GITHUB_USERNAME = 'arnokiru05'

const fetchRepos = async () => {
  const grid = document.getElementById('repos-grid')
  const loading = document.getElementById('repos-loading')

  const cached = localStorage.getItem('githubRepos')
  const cacheTime = localStorage.getItem('githubReposTime')
  const oneHour = 60 * 60 * 1000

  if (cached && cacheTime && Date.now() - Number(cacheTime) < oneHour) {
    loading.remove()
    JSON.parse(cached).forEach((repo, index) => renderRepo(grid, repo, index))
    return
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`
    )

    if (!response.ok) throw new Error('Failed to fetch')

    const repos = await response.json()

    localStorage.setItem('githubRepos', JSON.stringify(repos))
    localStorage.setItem('githubReposTime', Date.now())

    loading.remove()
    repos.forEach((repo, index) => renderRepo(grid, repo, index))

  } catch (err) {
    loading.textContent = 'Could not load repositories — try again later.'
  }
}

//Render single repo card
const renderRepo = (grid, repo, index) => {
  const card = document.createElement('div')
  card.className = 'project-card reveal'

  card.innerHTML = `
    <div class="project-body" style="padding: 24px;">
      <h3>${repo.name.replace(/-/g, ' ')}</h3>
      <p>${repo.description || 'No description yet.'}</p>
      <div class="tags">
        ${repo.language ? `<span>${repo.language}</span>` : ''}
        <span>★ ${repo.stargazers_count}</span>
      </div>
      <a href="${repo.html_url}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="project-link">View on GitHub →</a>
    </div>
  `

  grid.appendChild(card)

  setTimeout(() => {
    revealObserver.observe(card)
  }, 50)
}

fetchRepos()

//animated stats counter
const stats= document.querySelectorAll(".stat-num")

const countUp=(element)=>{
  //get target numbet from text content
  const target=parseInt(element.textContent)//parseInt strips any non-numeric characters
  const duration=2000
  const stepTime=50
  const steps=duration/stepTime
  const increment=target/steps
  let current=0

  const timer=setInterval(()=>{
    current+=increment

    if(current>=target){
      element.textContent=target+(element.dataset.suffix || "")//use the suffix if it exists otherwise use an empty string
      clearInterval(timer)
    }else{element.textContent=Math.floor(current)+(element.dataset.suffix || "")}
  },stepTime)
}

//trigger counter when stats come into view
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      stats.forEach(stat=>countUp(stat))
      observer.disconnect()
    }
  })
},{threshold:0.5})

//observe the stats bar
const statsBar=document.querySelector(".stats-bar")
if (statsBar) observer.observe(statsBar)
