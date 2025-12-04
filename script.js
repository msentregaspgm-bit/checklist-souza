// script.js - versão tolerante a diferenças entre "Tipo" da planilha e chaves de checklists
// Requisitos: carregar checklists.js antes deste script (checklistsPorTipo disponível globalmente)
// Use seu SCRIPT_URL JSONP aqui (o que você confirmou que funciona)

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";

const API_CHECKLIST = "/api/checklist";

let maquinas = [];
let operador, maquina, tipo, ctx;

// ---------- util: normalizar string (remove acento, espaços, puncts, lower) ----------
function norm(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ---------- util: levenshtein distance ----------
function levenshtein(a, b) {
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const matrix = Array.from({ length: al + 1 }, (_, i) => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[al][bl];
}

// ---------- tenta achar a melhor chave de checklist para um tipo vindo da planilha ----------
function matchChecklistKey(tipoOriginal) {
  const tipoN = norm(tipoOriginal);
  const keys = Object.keys(checklistsPorTipo || {});
  if (keys.length === 0) return null;

  // 1. igualdade exata (normalizada)
  for (const k of keys) {
    if (norm(k) === tipoN) return k;
  }

  // 2. startsWith / includes (normalizado)
  for (const k of keys) {
    const kN = norm(k);
    if (kN.startsWith(tipoN) || tipoN.startsWith(kN) || kN.includes(tipoN) || tipoN.includes(kN)) {
      return k;
    }
  }

  // 3. menor distancia de levenshtein (tolerância)
  let best = { key: null, dist: Infinity };
  for (const k of keys) {
    const d = levenshtein(tipoN, norm(k));
    if (d < best.dist) {
      best = { key: k, dist: d };
    }
  }
  // tolerância: aceitar se distância pequena relativa ao tamanho
  if (best.key && best.dist <= Math.max(2, Math.floor(tipoN.length * 0.25))) {
    return best.key;
  }

  // nada encontrado
  return null;
}

// ---------- JSONP callback (nome callbackMaquinas) ----------
window.callbackMaquinas = function (data) {
  console.log("callbackMaquinas => raw:", data);

  // data should be array of objects [{tipo, nome, placa}, ...]
  if (!Array.isArray(data)) {
    console.warn("Dados recebidos não são array. Conteúdo:", data);
    // tentar extrair 'values' ou 'feed' se necessário (fallback simples)
    if (data && data.values && Array.isArray(data.values)) {
      const header = data.values[0] || [];
      const rows = data.values.slice(1);
      data = rows.map(r => {
        const obj = {};
        for (let i = 0; i < header.length; i++) obj[header[i]] = r[i];
        return obj;
      });
      console.log("Converted values -> array of objects:", data);
    } else {
      alert("Formato inesperado do retorno das máquinas. Veja Console (F12).");
      return;
    }
  }

  // normalizar e guardar
  maquinas = data.map(m => ({
    tipoOriginal: m.tipo || m.Tipo || m.TipoMaquina || m["Tipo Máquina"] || m.type || "",
    nome: m.nome || m.Nome || m.name || m.NomeMaquina || m["Nome Máquina"] || "",
    placa: m.placa || m.Placa || m.plate || ""
  }));

  // remover entradas vazias
  maquinas = maquinas.filter(x => x.tipoOriginal && x.nome);

  // popular select tipoMaquina com os valores originais (legíveis)
  const tiposOriginais = [...new Set(maquinas.map(m => m.tipoOriginal))];
  const tipoSelect = document.getElementById("tipoMaquina");
  tipoSelect.innerHTML = "<option value=''>Selecione o tipo de máquina</option>";
  tiposOriginais.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.text = t;
    tipoSelect.add(opt);
  });

  console.log("Máquinas carregadas:", maquinas);
  console.log("Chaves disponíveis em checklists.js:", Object.keys(checklistsPorTipo || {}));

  // opcional: reportar tipos que não casam com nenhum checklist
  const unmatched = tiposOriginais.filter(t => !matchChecklistKey(t));
  if (unmatched.length > 0) {
    console.warn("Tipos sem checklist correspondente (verifique nomes no checklists.js):", unmatched);
  }
};

// ---------- carregar JSONP ----------
function carregarMaquinas() {
  const s = document.createElement("script");
  s.src = SCRIPT_URL + "?callback=callbackMaquinas&_=" + Date.now();
  s.onerror = () => {
    console.error("Erro ao carregar JSONP de máquinas.");
    alert("Erro ao buscar dados das máquinas. Veja Console (F12).");
  };
  document.body.appendChild(s);
}

// ---------- filtrar máquinas ----------
function filtrarMaquinas() {
  const tipoSel = document.getElementById("tipoMaquina").value;
  const selectMaq = document.getElementById("maquina");
  selectMaq.innerHTML = "<option value=''>Selecione a máquina</option>";
  maquinas
    .filter(m => norm(m.tipoOriginal) === norm(tipoSel))
    .forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.nome;
      opt.text = m.placa ? `${m.nome} (${m.placa})` : m.nome;
      selectMaq.add(opt);
    });
}

// ---------- iniciar checklist ----------
function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;
  const tipoSelecionadoOriginal = document.getElementById("tipoMaquina").value;

  if (!operador || !maquina || !tipoSelecionadoOriginal) return alert("Preencha todos os campos!");

  const matchedKey = matchChecklistKey(tipoSelecionadoOriginal);
  if (!matchedKey) {
    console.error("Nenhum checklist encontrado para o tipo:", tipoSelecionadoOriginal);
    console.error("Tipos disponíveis no checklists.js:", Object.keys(checklistsPorTipo || {}));
    alert("Checklist não encontrado para esse tipo de máquina — verifique nomes no checklists.js. Veja Console (F12) para detalhes.");
    return;
  }

  const checklist = checklistsPorTipo[matchedKey];

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
      const safeId = item.replace(/[^a-z0-9]/gi, "_");
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <p>${item}</p>
        <label><input type='radio' name='${safeId}' value='OK'> OK</label>
        <label><input type='radio' name='${safeId}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${safeId}'></textarea>
      `;
      container.appendChild(div);
    });
  });

  // iniciar assinatura
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
  const tipoSelecionadoOriginal = document.getElementById("tipoMaquina").value;
  const matchedKey = matchChecklistKey(tipoSelecionadoOriginal);
  const checklist = matchedKey ? checklistsPorTipo[matchedKey] : [];

  const items = [];
  checklist.forEach(sec => {
    sec.itens.forEach(item => {
      const safeId = item.replace(/[^a-z0-9]/gi, "_");
      items.push({
        nome: item,
        status: document.querySelector(`input[name='${safeId}']:checked`)?.value || "",
        observacao: document.getElementById(`obs_${safeId}`)?.value || ""
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
  else {
    console.error("Erro ao enviar checklist:", await res.text());
    alert("Erro ao enviar checklist! Veja Console (F12).");
  }
}

window.onload = carregarMaquinas;
window.filtrarMaquinas = filtrarMaquinas;
window.iniciarChecklist = iniciarChecklist;
window.limparAssinatura = limparAssinatura;
window.enviar = enviar;
