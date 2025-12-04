import checklistsPorTipo from "./checklists.js";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzW8O42NFSodM3lndtKoHl8kH7KC3BqeVz8zJhYuO4GEON0RVOKc6EjYVCkE5qLh-89/exec";

const API_CHECKLIST = SCRIPT_URL;

let maquinas = [];
let operador, maquina, tipo, ctx;

// =============== CARREGAR MÁQUINAS ===============
function carregarMaquinas() {
  const script = document.createElement("script");
  const callbackName = "callbackMaquinas";

  window[callbackName] = function (data) {

    console.log("DATA RECEBIDO DA PLANILHA:", data);

    // 🔍 DETECTAR COLUNAS AUTOMATICAMENTE
    maquinas = data.map(row => ({
      tipo:
        row.tipo ||
        row.Tipo ||
        row.TIPO ||
        row[0] || "",

      nome:
        row.nome ||
        row.Nome ||
        row.NOME ||
        row[1] || "",

      placa:
        row.placa ||
        row.Placa ||
        row.PLACA ||
        row[2] || ""
    }));

    // 🔥 Remover header (caso a primeira linha seja títulos)
    if (maquinas[0].tipo === "tipo" || maquinas[0].tipo === "Tipo") {
      maquinas.shift();
    }

    // 🔥 FILTRAR ENTRADAS VAZIAS
    maquinas = maquinas.filter(m => m.tipo && m.nome);

    // ===== Preencher tipos =====
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

  script.src = SCRIPT_URL + "?callback=" + callbackName;
  document.body.appendChild(script);
}

// =============== FILTRAR MÁQUINAS ===============
function filtrarMaquinas() {
  const tipoSel = document.getElementById("tipoMaquina").value;
  const selectMaq = document.getElementById("maquina");

  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";

  maquinas
    .filter(m => m.tipo === tipoSel)
    .forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.nome;
      opt.text = m.placa ? `${m.nome} (${m.placa})` : m.nome;
      selectMaq.add(opt);
    });
}

// =============== INICIAR CHECKLIST ===============
function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;
  const tipoSelecionado = document.getElementById("tipoMaquina").value;

  if (!operador || !maquina || !tipoSelecionado)
    return alert("Preencha todos os campos!");

  const checklist = checklistsPorTipo[tipoSelecionado];

  if (!checklist) return alert("Checklist não encontrado para este tipo.");

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

  iniciarAssinatura();
}

// =============== ASSINATURA ===============
function iniciarAssinatura() {
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

// =============== ENVIAR CHECKLIST ===============
async function enviar() {
  const tipoSelecionado = document.getElementById("tipoMaquina").value;
  const checklistOriginal = checklistsPorTipo[tipoSelecionado];

  const items = [];

  checklistOriginal.forEach(sec => {
    sec.itens.forEach(item => {
      items.push({
        nome: item,
        status: document.querySelector(`input[name='${item}']:checked`)
          ?.value || "",
        observacao: document.getElementById(`obs_${item}`).value
      });
    });
  });

  const assinatura = document.getElementById("assinatura").toDataURL();

  const dados = { operador, maquina, tipo, items, assinatura };

  const res = await fetch(API_CHECKLIST, {
    method: "POST",
    body: JSON.stringify(dados)
  });

  if (res.ok) alert("Checklist enviado com sucesso!");
  else alert("Erro ao enviar o checklist!");
}

// =============== INICIAR CARREGAMENTO ===============
window.onload = carregarMaquinas;
