document.addEventListener("DOMContentLoaded", () => {
  const crearBtn = document.getElementById("crearBtn")
  const numeroInput = document.getElementById("numero")
  const grupoInput = document.getElementById("grupo")
  const codigoPais = document.getElementById("codigoPais")
  const buscarPais = document.getElementById("buscarPais")
  const server = "http://188.40.64.114:5163"

  const paises = [
    { code: "93", flag: "🇦🇫", name: "Afganistán" },
    { code: "355", flag: "🇦🇱", name: "Albania" },
    { code: "49", flag: "🇩🇪", name: "Alemania" },
    { code: "376", flag: "🇦🇩", name: "Andorra" },
    { code: "244", flag: "🇦🇴", name: "Angola" },
    { code: "54", flag: "🇦🇷", name: "Argentina" },
    { code: "374", flag: "🇦🇲", name: "Armenia" },
    { code: "61", flag: "🇦🇺", name: "Australia" },
    { code: "43", flag: "🇦🇹", name: "Austria" },
    { code: "32", flag: "🇧🇪", name: "Bélgica" },
    { code: "591", flag: "🇧🇴", name: "Bolivia" },
    { code: "55", flag: "🇧🇷", name: "Brasil" },
    { code: "56", flag: "🇨🇱", name: "Chile" },
    { code: "57", flag: "🇨🇴", name: "Colombia" },
    { code: "506", flag: "🇨🇷", name: "Costa Rica" },
    { code: "53", flag: "🇨🇺", name: "Cuba" },
    { code: "45", flag: "🇩🇰", name: "Dinamarca" },
    { code: "1", flag: "🇩🇴", name: "República Dominicana" },
    { code: "593", flag: "🇪🇨", name: "Ecuador" },
    { code: "503", flag: "🇸🇻", name: "El Salvador" },
    { code: "34", flag: "🇪🇸", name: "España" },
    { code: "1", flag: "🇺🇸", name: "Estados Unidos" },
    { code: "33", flag: "🇫🇷", name: "Francia" },
    { code: "44", flag: "🇬🇧", name: "Reino Unido" },
    { code: "30", flag: "🇬🇷", name: "Grecia" },
    { code: "502", flag: "🇬🇹", name: "Guatemala" },
    { code: "504", flag: "🇭🇳", name: "Honduras" },
    { code: "91", flag: "🇮🇳", name: "India" },
    { code: "62", flag: "🇮🇩", name: "Indonesia" },
    { code: "39", flag: "🇮🇹", name: "Italia" },
    { code: "81", flag: "🇯🇵", name: "Japón" },
    { code: "52", flag: "🇲🇽", name: "México" },
    { code: "505", flag: "🇳🇮", name: "Nicaragua" },
    { code: "507", flag: "🇵🇦", name: "Panamá" },
    { code: "595", flag: "🇵🇾", name: "Paraguay" },
    { code: "51", flag: "🇵🇪", name: "Perú" },
    { code: "351", flag: "🇵🇹", name: "Portugal" },
    { code: "420", flag: "🇨🇿", name: "República Checa" },
    { code: "40", flag: "🇷🇴", name: "Rumanía" },
    { code: "7", flag: "🇷🇺", name: "Rusia" },
    { code: "46", flag: "🇸🇪", name: "Suecia" },
    { code: "41", flag: "🇨🇭", name: "Suiza" },
    { code: "66", flag: "🇹🇭", name: "Tailandia" },
    { code: "90", flag: "🇹🇷", name: "Turquía" },
    { code: "598", flag: "🇺🇾", name: "Uruguay" },
    { code: "58", flag: "🇻🇪", name: "Venezuela" },
    { code: "84", flag: "🇻🇳", name: "Vietnam" }
  ]

  function renderPaises(filtro = "") {
    codigoPais.innerHTML = ""
    paises
      .filter(p => p.name.toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(p => {
        const option = document.createElement("option")
        option.value = p.code
        option.textContent = `${p.flag} +${p.code} ${p.name}`
        codigoPais.appendChild(option)
      })
  }

  renderPaises()

  buscarPais.addEventListener("input", (e) => {
    renderPaises(e.target.value)
  })

  function validarCampos() {
    crearBtn.disabled = numeroInput.value.trim() === "" || grupoInput.value.trim() === ""
  }

  numeroInput.addEventListener("input", () => {
    numeroInput.value = numeroInput.value.replace(/\D/g, "")
    validarCampos()
  })

  grupoInput.addEventListener("input", validarCampos)

  async function crearAccion() {
    let numero = numeroInput.value.trim()
    const prefijo = codigoPais.value
    const grupo = grupoInput.value.trim()

    if (numero === "" || grupo === "") {
      alert("Por favor, complete todos los campos.")
      return
    }

    // Limpiar + y prefijo duplicado
    if (numero.startsWith("+" + prefijo)) {
      numero = numero.slice(prefijo.length + 1)
    } else if (numero.startsWith(prefijo)) {
      numero = numero.slice(prefijo.length)
    }

    const data = {
      numeroCompleto: `${prefijo}${numero}`,
      grupo,
      pais: codigoPais.options[codigoPais.selectedIndex].text
    }

    try {
      // 1. Validar número en WhatsApp
      const responseNum = await fetch(`${server}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const resultNum = await responseNum.json()
      if (!responseNum.ok) throw new Error(resultNum.error || `Error: ${responseNum.status}`)
      alert(resultNum.message || "Número validado correctamente")

      // 2. Unirse al grupo
      const responseJoin = await fetch(`${server}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupLink: grupo })
      })
      const resultJoin = await responseJoin.json()
      if (!responseJoin.ok) throw new Error(resultJoin.error || `Error: ${responseJoin.status}`)
      alert(resultJoin.message || "Bot unido al grupo con éxito")
    } catch (error) {
      alert(`Error al enviar: ${error.message}`)
    }
  }

  crearBtn.addEventListener("click", crearAccion)

  numeroInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !crearBtn.disabled) {
      crearAccion()
    }
  })
})
