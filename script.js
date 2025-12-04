import checklistsPorTipo from "./checklists.js";

// ESTE É O SEU SCRIPT_URL ORIGINAL (FUNCIONA)
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";

// BACKEND DO CHECKLIST (MANTIVE O SEU)
const API_CHECKLIST = "/api/checklist";

let maquinas = [];
let operador, maquina, tipo, ctx;

// =========================================================
// CARREGAR MÁQUINAS DO APPS SCRIPT VIA JSONP
// =========================================================
function carregarMaquinas() {
  const script = document.createElement("script");
  const callbackName = "callbackMaquinas";

  window[callbackName] = function (data) {
    maquinas = data;

    // TIPOS ÚNICOS (como no código original!)
    const tipos = [...new Set(maquinas.map(m => m.tipo))];

    const tipoSelect = document.getElementById("tipoMaquina");
    tipoSelect.innerHTML = "<option value=''>Selecione o tipo de máquina</option>";

    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.text = t;
      tipoSelect.add(opt);
    });
  };

  // JSONP
  script.src = SCRIPT_URL + "?callback=" + callbackName;
  document.body.appendChild(script);
}

// =========================================================
// FILTRAR MÁQUINAS DO TIPO ESCOLHIDO
// =========================================================
function filtrarMaquinas() {
  const tipoSel = document.getElementById("tipoMaquina").value;
  const selectMaq = document.getElementById("maquina");

  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";

  const filtradas = maquinas.filter(m => m.tipo === tipoSel);

  filtradas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.nome;
    opt.text = `${m.nome} (${m.placa})`;
    selectMaq.add(opt);
  });
}

// =========================================================
// INICIAR CHECKLIST (AGORA DINÂMICO POR TIPO)
// =========================================================
function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;

  const tipoMaquina = document.getElementById("tipoMaquina").value;

  if (!operador || !maquina) return alert("Preencha todos os campos!");

  // NOVO: checklist específico por tipo
  const checklist = checklistsPorTipo[tipoMaquina];

  if (!checklist) {
    return alert("Nenhum checklist definido para esse tipo de máquina!");
  }

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
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <p>${item}</p>
        <label><input type='radio' name='${item}' value='OK'> OK</label>
        <label><input type='radio' name='${item}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${item}'></textarea>
      `;
      container.appendChild(div);
    });
  });

  // ASSINATURA (igual ao seu originalmente)
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
  canvas.addEventListener("mouseup", () => desenhando = false);
}

function limparAssinatura() {
  const canvas = document.getElementById("assinatura");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// =========================================================
// ENVIAR CHECKLIST (MANTIDO O MESMO)
// =========================================================
async function enviar() {
  const tipoMaquina = document.getElementById("tipoMaquina").value;
  const checklist = checklistsPorTipo[tipoMaquina];

  const items = [];

  checklist.forEach(sec => {
    sec.itens.forEach(item => {
      items.push({
        nome: item,
        status: document.querySelector(`input[name='${item}']:checked`)?.value || "",
        observacao: document.getElementById(`obs_${item}`).value
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

// EXPORTAR SE PRECISAR EM OUTRO ARQUIVO
export { filtrarMaquinas, iniciarChecklist, limparAssinatura, enviar };
