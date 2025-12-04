// script.js - versão robusta que detecta vários formatos de retorno JSONP
// IMPORTANTE: carregue checklists.js antes deste arquivo no index.html
// SCRIPT_URL deve ser o seu endpoint JSONP que retorna dados das máquinas
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";

const API_CHECKLIST = "/api/checklist";

let maquinas = [];
let operador, maquina, tipo, ctx;

// Util utilitária: transforma array de arrays (values) em array de objetos usando header
function rowsToObjects(values) {
  if (!values || values.length === 0) return [];
  const header = values[0].map(h => (h || "").toString().trim());
  const rows = values.slice(1);
  return rows.map(r => {
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = r[i] !== undefined ? r[i] : "";
    }
    return obj;
  });
}

// NORMALIZA uma entrada para o formato { tipo, nome, placa }
function normalizeEntry(entry) {
  if (!entry) return null;

  // já é do formato desejado
  if (entry.tipo || entry.Tipo || entry.TIPO || entry.type) {
    return {
      tipo: entry.tipo || entry.Tipo || entry.TIPO || entry.type || entry.TipoMaquina || entry["Tipo Máquina"] || "",
      nome: entry.nome || entry.Nome || entry.NOME || entry.name || entry.NomeMaquina || entry["Nome Máquina"] || "",
      placa: entry.placa || entry.Placa || entry.PLACA || entry.plate || entry.placa_veiculo || ""
    };
  }

  // se for array-like (ex: [tipo, nome, placa])
  if (Array.isArray(entry)) {
    return {
      tipo: entry[0] || "",
      nome: entry[1] || "",
      placa: entry[2] || ""
    };
  }

  // tentar pegar chaves comuns
  const keys = Object.keys(entry);
  // se tiver colunas "col1", "col2" (caso de feed parseado), pegar primeiros 3 valores
  if (keys.length > 0) {
    const values = keys.map(k => entry[k]);
    return {
      tipo: entry.tipo || entry.Tipo || entry[ keys.find(k => /tipo/i.test(k)) ] || values[0] || "",
      nome: entry.nome || entry.Nome || entry[ keys.find(k => /nome|name/i.test(k)) ] || values[1] || "",
      placa: entry.placa || entry.Placa || entry[ keys.find(k => /placa|plate/i.test(k)) ] || values[2] || ""
    };
  }

  return null;
}

// FUNÇÃO QUE RECEBE OS DADOS DO JSONP
window.callbackMaquinas = function (data) {
  console.log("callbackMaquinas => raw data:", data);

  let parsed = [];

  // Caso 1: já é um array de objetos [{tipo,nome,placa}, ...]
  if (Array.isArray(data)) {
    parsed = data;
    console.log("Detected: Array of objects.");
  } else if (data && data.values && Array.isArray(data.values)) {
    // Caso 2: objeto com .values (ex: some APIs)
    parsed = rowsToObjects(data.values);
    console.log("Detected: object with .values (converted rowsToObjects).");
  } else if (data && data.feed && data.feed.entry) {
    // Caso 3: feed de cells (Google Sheets old feed) -> montar linhas
    console.log("Detected: feed.entry from Google feed. Parsing...");
    const entries = data.feed.entry;
    // convert feed entries to map of cell -> value
    const cells = entries.map(e => {
      return {
        r: parseInt(e.gs$cell.row, 10),
        c: parseInt(e.gs$cell.col, 10),
        v: e.gs$cell.$t
      };
    });
    // find max col/row
    const maxRow = Math.max(...cells.map(c => c.r));
    const maxCol = Math.max(...cells.map(c => c.c));
    const table = Array.from({ length: maxRow }, () => Array.from({ length: maxCol }, () => ""));
    cells.forEach(c => {
      table[c.r - 1][c.c - 1] = c.v;
    });
    parsed = rowsToObjects(table);
    console.log("feed parsed to rows:", parsed);
  } else if (data && data.values && data.values.length && Array.isArray(data.values[0])) {
    parsed = rowsToObjects(data.values);
    console.log("Detected: nested values array.");
  } else if (data && data.result && Array.isArray(data.result)) {
    parsed = data.result;
    console.log("Detected: data.result array.");
  } else if (typeof data === "object") {
    // tentativa genérica: transformar objeto em array de 1 elemento
    parsed = [data];
    console.log("Detected: single object wrapped into array.");
  } else {
    console.warn("Formato não reconhecido dos dados. data:", data);
  }

  // Normalizar cada entrada
  const normalized = parsed
    .map(normalizeEntry)
    .filter(Boolean)
    .map(m => ({
      tipo: (m.tipo || "").toString().trim(),
      nome: (m.nome || "").toString().trim(),
      placa: (m.placa || "").toString().trim()
    }));

  console.log("Normalized machines:", normalized);

  // Filtrar entradas vazias
  maquinas = normalized.filter(m => m.tipo && m.nome);

  // Se nada foi encontrado, avisar
  if (!maquinas || maquinas.length === 0) {
    console.warn("Nenhuma máquina válida encontrada após parse. Confira o retorno do Apps Script.");
    alert("Não foram encontradas máquinas válidas — veja o Console (F12) para detalhes.");
    return;
  }

  // preencher tipos únicos
  const tipos = [...new Set(maquinas.map(m => m.tipo))];
  const tipoSelect = document.getElementById("tipoMaquina");
  tipoSelect.innerHTML = "<option value=''>Selecione o tipo de máquina</option>";
  tipos.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.text = t;
    tipoSelect.add(opt);
  });

  console.log("Tipos carregados:", tipos);
};

// CARREGA O JSONP
function carregarMaquinas() {
  const script = document.createElement("script");
  // acrescentar timestamp para evitar cache se quiser
  script.src = SCRIPT_URL + "?callback=callbackMaquinas&_=" + new Date().getTime();
  script.onerror = function (e) {
    console.error("Erro ao carregar o JSONP:", e);
    alert("Erro ao carregar dados das máquinas. Veja o Console (F12).");
  };
  document.body.appendChild(script);
}

// FILTRAR MÁQUINAS (preencher select de máquinas)
function filtrarMaquinas() {
  const tipoSel = document.getElementById("tipoMaquina").value;
  const selectMaq = document.getElementById("maquina");
  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";
  const filtradas = maquinas.filter(m => m.tipo === tipoSel);
  filtradas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.nome;
    opt.text = m.placa ? `${m.nome} (${m.placa})` : m.nome;
    selectMaq.add(opt);
  });
}

// iniciar checklist (usando checklists por tipo - checklists.js deve definir checklistsPorTipo global)
function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;
  const tipoSelecionado = document.getElementById("tipoMaquina").value;

  if (!operador || !maquina || !tipoSelecionado) return alert("Preencha todos os campos!");

  // obtém checklist do objeto global checklistsPorTipo
  const checklist = (typeof checklistsPorTipo !== "undefined") ? checklistsPorTipo[tipoSelecionado] : null;
  if (!checklist) return alert("Checklist não encontrado para esse tipo de máquina.");

  document.getElementById("login").style.display = "none";
  document.getElementById("checklist").style.display = "block";
  document.getElementById("tituloChecklist").innerText = `Checklist de ${tipo} - ${maquina}`;

  const container = document.getElementById("itensContainer");
  container.innerHTML = "";
  checklist.forEach(sec => {
    const cat = document.createElement("h3");
    cat.innerText = sec.categoria;
    container.appendChild(cat);
    sec.itens.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      // replace characters in id to avoid invalid ids
      const safeId = item.replace(/[^a-z0-9]/gi, '_');
      div.innerHTML = `
        <p>${item}</p>
        <label><input type='radio' name='${safeId}' value='OK'> OK</label>
        <label><input type='radio' name='${safeId}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${safeId}'></textarea>
      `;
      container.appendChild(div);
    });
  });

  // assinatura
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
  const tipoSelecionado = document.getElementById("tipoMaquina").value;
  const checklist = (typeof checklistsPorTipo !== "undefined") ? checklistsPorTipo[tipoSelecionado] : [];

  const items = [];
  checklist.forEach(sec => {
    sec.itens.forEach(item => {
      const safeId = item.replace(/[^a-z0-9]/gi, '_');
      items.push({
        nome: item,
        status: document.querySelector(`input[name='${safeId}']:checked`)?.value || "",
        observacao: document.getElementById(`obs_${safeId}`).value || ""
      });
    });
  });

  const assinatura = document.getElementById("assinatura").toDataURL();
  const dados = { operador, maquina, tipo, assinatura, items };

  // enviar para seu endpoint (ajuste se necessário)
  const res = await fetch(API_CHECKLIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  if (res.ok) alert("Checklist enviado com sucesso!");
  else {
    console.error("Erro ao enviar checklist:", await res.text());
    alert("Erro ao enviar checklist! Veja o Console (F12).");
  }
}

window.onload = carregarMaquinas;

// exportar algumas funções para uso inline no HTML, caso esteja chamando sem module
window.filtrarMaquinas = filtrarMaquinas;
window.iniciarChecklist = iniciarChecklist;
window.limparAssinatura = limparAssinatura;
window.enviar = enviar;
