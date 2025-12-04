import checklistsPorTipo from "./checklists.js";

// Seu Apps Script que FUNCIONA
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";

const API_CHECKLIST = "/api/checklist";

let maquinas = [];
let operador, maquina, tipo, ctx;

// ===================== NORMALIZADOR =====================
// Transforma valores em padronizados (remove espaços, acentos e baixa tudo)
function norm(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// =========================================================
// CARREGAR MÁQUINAS DO APPS SCRIPT VIA JSONP
// =========================================================
function carregarMaquinas() {
  const script = document.createElement("script");
  const callbackName = "callbackMaquinas";

  window[callbackName] = function (data) {

    console.log("RAW DATA:", data); // 🔥 IMPORTANTE

    maquinas = data.map(m => {
      return {
        tipoOriginal: m.tipo,
        tipo: norm(m.tipo),
        nome: m.nome,
        placa: m.placa
      };
    });

    console.log("TIPOS NORMALIZADOS:", maquinas);

    // TIPOS ÚNICOS PÓS NORMALIZAÇÃO
    const tipos = [...new Set(maquinas.map(m => m.tipoOriginal))];

    const tipoSelect = document.getElementById("tipoMaquina");
    tipoSelect.innerHTML = "<option value=''>Selecione o tipo de máquina</option>";

    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.text = t;
      tipoSelect.add(opt);
    });
  };

  script.src = SCRIPT_URL + "?callback=" + callbackName + "&_=" + Date.now();
  document.body.appendChild(script);
}

// =========================================================
// FILTRAR MÁQUINAS
// =========================================================
function filtrarMaquinas() {
  const tipoSelOriginal = document.getElementById("tipoMaquina").value;
  const tipoSel = norm(tipoSelOriginal);

  const selectMaq = document.getElementById("maquina");
  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";

  const filtradas = maquinas.filter(m => norm(m.tipoOriginal) === tipoSel);

  filtradas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.nome;
    opt.text = `${m.nome} (${m.placa})`;
    selectMaq.add(opt);
  });
}

// =========================================================
// INICIAR CHECKLIST
// =========================================================
function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;

  const tipoSelecionadoOriginal = document.getElementById("tipoMaquina").value;
  const tipoNormalizado = norm(tipoSelecionadoOriginal);

  // LOG MUITO IMPORTANTE
  console.log("TIPO SELECIONADO ORIGINAL:", tipoSelecionadoOriginal);
  console.log("TIPO NORMALIZADO:", tipoNormalizado);
  console.log("CHECKLISTS DISPONÍVEIS:", Object.keys(checklistsPorTipo));

  // TENTAMOS ACHAR O TIPO NORMALIZADO DENTRO DO CHECKLIST
  const chaveChecklist = Object.keys(checklistsPorTipo).find(key => norm(key) === tipoNormalizado);

  if (!chaveChecklist) {
    alert("Checklist não encontrado para esse tipo de máquina!");
    console.error("TIPO QUE VEIO:", tipoSelecionadoOriginal);
    console.error("NORMALIZADO:", tipoNormalizado);
    console.error("CHECKLISTS DISPONÍVEIS:", Object.keys(checklistsPorTipo));
    return;
  }

  const checklist = checklistsPorTipo[chaveChecklist];

  document.getElementById("login").style.display = "none";
  document.getElementById("checklist").style.display = "block";
  document.getElementById("tituloChecklist").innerText =
    `Checklist de ${tipo} - ${maquina}`;

  const container = document.getElementById("itensContainer");
  container.innerHTML = "";

  checklist.forEach(sec => {
    const cat = document.createElement("h3");
    cat.innerText = sec.categoria;
    container.appendChild(cat);

    sec.itens.forEach(item => {
      const id = item.replace(/[^a-z0-9]/gi, "_");
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <p>${item}</p>
        <label><input type='radio' name='${id}' value='OK'> OK</label>
        <label><input type='radio' name='${id}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${id}'></textarea>
      `;
      container.appendChild(div);
    });
  });

  // assinatura
  const canvas = document.getElementById("assinatura");
  ctx = canvas.getContext("2d");

  let desenhando = false;
  canvas.addEventListener("mousedown", e => {
    desenhando = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener("mousemove", e => {
    if (desenhando) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });
  canvas.addEventListener("mouseup", () => (desenhando = false));
}

function limparAssinatura() {
  const canvas = document.getElementById("assinatura");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function enviar() {
  const tipoSel = document.getElementById("tipoMaquina").value;
  const tipoNormalizado = norm(tipoSel);
  const chaveChecklist = Object.keys(checklistsPorTipo).find(key => norm(key) === tipoNormalizado);
  const checklist = checklistsPorTipo[chaveChecklist];

  const items = [];
  checklist.forEach(sec => {
    sec.itens.forEach(item => {
      const id = item.replace(/[^a-z0-9]/gi, "_");
      items.push({
        nome: item,
        status: document.querySelector(`input[name='${id}']:checked`)?.value || "",
        observacao: document.getElementById(`obs_${id}`).value || ""
      });
    });
  });

  const assinatura = document.getElementById("assinatura").toDataURL();
  const dados = { operador, maquina, tipo, assinatura, items };

  const res = await fetch(API_CHECKLIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  if (res.ok) alert("Checklist enviado com sucesso!");
  else alert("Erro ao enviar checklist!");
}

window.onload = carregarMaquinas;

window.filtrarMaquinas = filtrarMaquinas;
window.iniciarChecklist = iniciarChecklist;
window.limparAssinatura = limparAssinatura;
window.enviar = enviar;
