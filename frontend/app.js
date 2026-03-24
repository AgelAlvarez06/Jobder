const API_URL = "http://localhost:8000"

async function crearCandidato(){

const nombre = document.getElementById("cand_nombre").value
const profile = document.getElementById("cand_profile").value

if (!profile.trim()){
  alert("Escribe algo para buscar")
  return
}

const res = await fetch(`${API_URL}/candidatos/`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
nombre:nombre,
profile_text:profile
})
})

const data = await res.json()

alert("Candidato creado")
console.log(data)

}


async function crearVacante(){

const titulo = document.getElementById("vac_titulo").value
const texto = document.getElementById("vac_texto").value


if (!texto.trim()){
  alert("Escribe algo para buscar")
  return
}

const res = await fetch(`${API_URL}/vacantes/`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
titulo:titulo,
job_text:texto
})
})

const data = await res.json()

alert("Vacante creada")
console.log(data)

}



async function buscarVacantes(){

const text = document.getElementById("search_text").value
if (!text.trim()){
  alert("Escribe algo para buscar")
  return
}

const res = await fetch(`${API_URL}/recommendations/`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
text:text
})
})

const data = await res.json()

const div = document.getElementById("resultados")

div.innerHTML = ""

// Ordenar por score descendente
data.sort((a, b) => b.score - a.score)

// Mostrar todas las vacantes con su score
data.forEach((vacante, index) => {
  const container = document.createElement("div")
  container.className = "vacante-container"
  
  // Determinar el nivel de score
  let scoreClass = "score-low"
  if (vacante.score >= 70) scoreClass = "score-high"
  else if (vacante.score >= 50) scoreClass = "score-medium"
  
  const title = document.createElement("h4")
  title.className = "vacante-title"
  title.innerText = `${index + 1}. ${vacante.titulo}`
  
  const score = document.createElement("p")
  score.className = `vacante-score ${scoreClass}`
  score.innerText = `✓ Alineación: ${vacante.score}%`
  
  const description = document.createElement("p")
  description.className = "vacante-description"
  description.innerText = vacante.job_text
  
  container.appendChild(title)
  container.appendChild(score)
  container.appendChild(description)
  
  div.appendChild(container)
})

}