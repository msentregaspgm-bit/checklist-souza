const API_CHECKLIST = "/api/checklist";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHPCOhlA55vbvak_KqdIEZtSBqRtvBC1l1kTY5vjN1tGm36arLV9GcJrfnzpwNS5-m/exec";

let operador, maquina, tipo, ctx;
const checklist = [
  {categoria:"Motor", itens:["Nível do óleo do motor","Nível do óleo hidráulico","Nível de arrefecimento"]},
  {categoria:"Estrutura Física", itens:["Porcas das rodas","Mangueiras (vazamentos)","Lataria","Vidros e retrovisores"]},
  {categoria:"Sinalização", itens:["Faróis","Lanternas","Pisca","Buzina"]},
  {categoria:"Itens Gerais", itens:["Freio de estacionamento","Extintor de incêndio","Caixa de ferramentas"]}
];

function carregarMaquinas() {
  const script = document.createElement("script");
  const callbackName = "callbackMaquinas";

  window[callbackName] = function (data) {
    const sel = document.getElementById("maquina");
    sel.innerHTML = "<option value=''>Selecione a máquina</option>";
    data.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.nome;
      opt.text = `${m.nome} (${m.placa})`;
      sel.add(opt);
    });
  };

  const url = SCRIPT_URL + "?callback=" + callbackName;
  script.src = url;
  document.body.appendChild(script);
}

function iniciarChecklist() {
  operador = document.getElementById("operador").value;
  maquina = document.getElementById("maquina").value;
  tipo = document.getElementById("tipo").value;
  if (!operador || !maquina) return alert("Preencha todos os campos!");

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
      div.innerHTML = `
        <p>${item}</p>
        <label><input type='radio' name='${item}' value='OK'> OK</label>
        <label><input type='radio' name='${item}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${item}'></textarea>
      `;
      container.appendChild(div);
    });
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
  checklist.forEach(sec => {
    sec.itens.forEach(item => {
      const status = document.querySelector(`input[name='${item}']:checked`)?.value || "";
      const obs = document.getElementById(`obs_${item}`).value;
      items.push({ nome: item, status, observacao: obs });
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
