const API_URL = "http://127.0.0.1:8000"

async function crearCandidato(){

const nombre = document.getElementById("cand_nombre").value
const profile = document.getElementById("cand_profile").value

if (!text.trim()){
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


if (!text.trim()){
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

data.forEach(vacante => {

const p = document.createElement("p")

p.innerText = `Vacante: ${vacante.titulo}`

div.appendChild(p)

})

}