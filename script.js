// script.js - robusto, carrega máquinas via JSONP e usa checklistsPorTipo
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";
const API_CHECKLIST = "/api/checklist"; // ou seu endpoint Apps Script publicado

let maquinas = [];
let operador, maquina, tipo, ctx;

function norm(str){ return (str||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase(); }

function carregarMaquinas(){
  const s = document.createElement('script');
  s.src = SCRIPT_URL + '?callback=callbackMaquinas&_=' + Date.now();
  s.onerror = ()=>{ console.error('Erro ao carregar JSONP'); alert('Erro ao carregar máquinas (veja Console)'); };
  document.body.appendChild(s);
}

window.callbackMaquinas = function(data){
  console.log('callbackMaquinas raw:', data);
  if(!Array.isArray(data)){
    // tentar converter se vier em formato {values: [...]}
    if(data && data.values && Array.isArray(data.values)){
      const header = data.values[0] || [];
      const rows = data.values.slice(1);
      data = rows.map(r=>{ const obj={}; header.forEach((h,i)=>obj[h]=r[i]); return obj; });
    } else {
      alert('Formato de retorno inesperado. Veja o Console (F12).');
      return;
    }
  }
  maquinas = data.map(m=>({
    tipoOriginal: m.tipo || m.Tipo || m['Tipo'] || "",
    tipoNorm: norm(m.tipo || m.Tipo || m['Tipo'] || ""),
    nome: m.nome || m.Nome || m['Nome'] || m.nome_maquina || "",
    placa: m.placa || m.Placa || m['Placa'] || ""
  })).filter(x=>x.tipoOriginal && x.nome);

  const tipos = [...new Set(maquinas.map(m=>m.tipoOriginal))];
  const tipoSelect = document.getElementById('tipoMaquina');
  tipoSelect.innerHTML = '<option value="">Selecione o tipo de máquina</option>';
  tipos.forEach(t=>{ const o=document.createElement('option'); o.value=t; o.text=t; tipoSelect.add(o); });

  console.log('Máquinas carregadas:', maquinas);
  console.log('Checklists disponíveis:', Object.keys(window.checklistsPorTipo || {}));
};

function filtrarMaquinas(){
  const tipoSel = document.getElementById('tipoMaquina').value;
  const sel = document.getElementById('maquina');
  sel.innerHTML = '<option value="">Selecione a máquina</option>';
  maquinas.filter(m=>norm(m.tipoOriginal) === norm(tipoSel)).forEach(m=>{
    const o=document.createElement('option'); o.value=m.nome; o.text = m.placa ? `${m.nome} (${m.placa})` : m.nome; sel.add(o);
  });
}

function iniciarChecklist(){
  operador = document.getElementById('operador').value;
  maquina = document.getElementById('maquina').value;
  tipo = document.getElementById('tipo').value;
  const tipoOriginal = document.getElementById('tipoMaquina').value;
  if(!operador || !maquina || !tipoOriginal){ alert('Preencha todos os campos!'); return; }

  const keys = Object.keys(window.checklistsPorTipo || {});
  const matchKey = keys.find(k=>norm(k) === norm(tipoOriginal)) || keys.find(k=>norm(k).includes(norm(tipoOriginal))) || keys.find(k=>norm(tipoOriginal).includes(norm(k)));
  if(!matchKey){ alert('Checklist não encontrado para esse tipo de máquina! Veja o console.'); console.error('Tipo selecionado:', tipoOriginal, 'Chaves checklists:', keys); return; }

  const checklist = window.checklistsPorTipo[matchKey];

  document.getElementById('login').style.display = 'none';
  document.getElementById('checklist').style.display = 'block';
  document.getElementById('tituloChecklist').innerText = `Checklist de ${tipo} - ${maquina}`;

  const container = document.getElementById('itensContainer');
  container.innerHTML = '';
  checklist.forEach(sec=>{
    const cat = document.createElement('h3'); cat.innerText = sec.categoria; container.appendChild(cat);
    sec.itens.forEach(item=>{
      const safeId = item.replace(/[^a-z0-9]/gi,'_');
      const div = document.createElement('div'); div.className='item';
      div.innerHTML = `<p>${item}</p>
        <label><input type='radio' name='${safeId}' value='OK'> OK</label>
        <label><input type='radio' name='${safeId}' value='Não Conforme'> N/C</label><br>
        <textarea placeholder='Observações' id='obs_${safeId}'></textarea>`;
      container.appendChild(div);
    });
  });

  const canvas = document.getElementById('assinatura'); ctx = canvas.getContext('2d');
  let desenhando = false;
  canvas.addEventListener('mousedown', e=>{ desenhando=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
  canvas.addEventListener('mousemove', e=>{ if(desenhando){ ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }});
  canvas.addEventListener('mouseup', ()=> desenhando=false);
}

function limparAssinatura(){ const canvas = document.getElementById('assinatura'); ctx.clearRect(0,0,canvas.width,canvas.height); }

async function enviar(){
  const tipoOriginal = document.getElementById('tipoMaquina').value;
  const keys = Object.keys(window.checklistsPorTipo || {});
  const matchKey = keys.find(k=>norm(k) === norm(tipoOriginal)) || keys.find(k=>norm(k).includes(norm(tipoOriginal))) || keys.find(k=>norm(tipoOriginal).includes(norm(k)));
  const checklist = matchKey ? window.checklistsPorTipo[matchKey] : [];

  const items = [];
  checklist.forEach(sec=>sec.itens.forEach(item=>{
    const safeId = item.replace(/[^a-z0-9]/gi,'_');
    items.push({ nome:item, status: document.querySelector(`input[name='${safeId}']:checked`)?.value || '', observacao: document.getElementById(`obs_${safeId}`)?.value || '' });
  }));

  const assinatura = document.getElementById('assinatura').toDataURL();
  const dados = { operador, maquina, tipo, assinatura, items };

  const res = await fetch(API_CHECKLIST, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados) });
  if(res.ok) alert('Checklist enviado com sucesso!');
  else { console.error('Erro no envio', await res.text()); alert('Erro ao enviar checklist (veja Console)'); }
}

window.filtrarMaquinas = filtrarMaquinas;
window.iniciarChecklist = iniciarChecklist;
window.limparAssinatura = limparAssinatura;
window.enviar = enviar;
window.onload = carregarMaquinas;
