const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGpBIOFLqXlkWhfVECVOtv7sWMjHrvIkQekIzNrlP_9wBXo7QQup_21rADNAbTZV0/exec";
const API_CHECKLIST = "/api/checklist";

let maquinas = [];
let checklist = [];
let operador, maquina, tipo, tipoMaquina, ctx;

function carregarTiposMaquina() {
  const script = document.createElement("script");
  const callbackName = "callbackMaquinas";

  window[callbackName] = function (data) {
    maquinas = data;
    const tipos = [...new Set(data.map(m => m.tipo))];
    const tipoSelect = document.getElementById("tipoMaquina");
    tipoSelect.innerHTML = "<option value=''>Selecione o tipo de máquina</option>";
    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.text = t;
      tipoSelect.add(opt);
    });
  };

  script.src = `${SCRIPT_URL}?callback=${callbackName}`;
  document.body.appendChild(script);
}

function carregarMaquinas() {
  tipoMaquina = document.getElementById("tipoMaquina").value;
  const selectMaq = document.getElementById("maquina");
  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";

  const filtradas = maquinas.filter(m => m.tipo === tipoMaquina);
  filtradas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.nome;
    opt.text = `${m.nome} (${m.placa})`;
    selectMaq.add(opt);
  });
}

function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;
  tipoMaquina = document.getElementById("tipoMaquina").value;

  if (!operador || !maquina || !tipoMaquina) {
    alert("Preencha todos os campos antes de iniciar!");
    return;
  }

  carregarChecklist();
}

function carregarChecklist() {
  const script = document.createElement("script");
  const callbackName = "callbackChecklist";

  window[callbackName] = function (data) {
    checklist = data;
    montarChecklist();
  };

  script.src = `${SCRIPT_URL}?tipo=${encodeURIComponent(tipoMaquina)}&callback=${callbackName}`;
  document.body.appendChild(script);
}

function montarChecklist() {
  document.getElementById("login").style.display = "none";
  document.getElementById("checklist").style.display = "block";
  document.getElementById("tituloChecklist").innerText = `Checklist de ${tipo} - ${maquina}`;

  const container = document.getElementById("itensContainer");
  container.innerHTML = "";

  let categoriaAtual = "";
  checklist.forEach(item => {
    if (item.categoria !== categoriaAtual) {
      categoriaAtual = item.categoria;
      const h3 = document.createElement("h3");
      h3.innerText = categoriaAtual;
      container.appendChild(h3);
    }
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <p>${item.item}</p>
      <label><input type="radio" name="${item.item}" value="OK"> OK</label>
      <label><input type="radio" name="${item.item}" value="Não Conforme"> N/C</label><br>
      <textarea placeholder="Observações" id="obs_${item.item}"></textarea>
    `;
    container.appendChild(div);
  });

  const canvas = document.getElementById("assinatura");
  ctx = canvas.getContext("2d");
  let desenhando = false;
  canvas.addEventListener("mousedown", e => { desenhando = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
  canvas.addEventListener("mousemove", e => { if (desenhando) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
  canvas.addEventListener("mouseup", () => desenhando = false);
}

function limparAssinatura() {
  const canvas = document.getElementById("assinatura");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function enviar() {
  const items = [];
  checklist.forEach(i => {
    const status = document.querySelector(`input[name='${i.item}']:checked`)?.value || "";
    const obs = document.getElementById(`obs_${i.item}`).value;
    items.push({ nome: i.item, status, observacao: obs });
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

window.onload = carregarTiposMaquina;
