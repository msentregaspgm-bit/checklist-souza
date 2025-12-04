// versão simplificada e otimizada
const SCRIPT_URL="YOUR_JSONP_URL";
const API_CHECKLIST="https://script.google.com/macros/s/YOUR_API_EXEC/exec";

let maquinas=[];

function carregarMaquinas(){
  const s=document.createElement("script");
  s.src=SCRIPT_URL+"?callback=callbackMaquinas";
  document.body.appendChild(s);
}

function callbackMaquinas(data){
  maquinas=data;
  const tipos=[...new Set(data.map(m=>m.tipo))];
  const sel=document.getElementById("tipoMaquina");
  sel.innerHTML="<option value=''>Selecione</option>";
  tipos.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;o.text=t;sel.add(o);
  });
}

function filtrarMaquinas(){
  const tipo=document.getElementById("tipoMaquina").value;
  const sel=document.getElementById("maquina");
  sel.innerHTML="";
  maquinas.filter(m=>m.tipo===tipo).forEach(m=>{
    const o=document.createElement("option");
    o.value=m.nome;o.text=m.nome+" ("+m.placa+")";sel.add(o);
  });
}

function iniciarChecklist(){
  const tipoMaquina=document.getElementById("tipoMaquina").value;
  const lista=checklistsPorTipo[tipoMaquina];
  if(!lista){ alert("Checklist não encontrado."); return; }
  document.getElementById("login").style.display="none";
  document.getElementById("checklist").style.display="block";
  const cont=document.getElementById("itensContainer");
  cont.innerHTML="";
  lista.forEach(sec=>{
    const h=document.createElement("h3");h.textContent=sec.categoria;cont.appendChild(h);
    sec.itens.forEach(item=>{
      cont.innerHTML+=`
        <div class='item'>
          <p>${item}</p>
          <label><input type='radio' name='${item}' value='OK'> OK</label>
          <label><input type='radio' name='${item}' value='N/C'> N/C</label>
          <textarea id='obs_${item}' placeholder='Observações'></textarea>
        </div>`;
    });
  });
}

async function enviar(){
  const tipo=document.getElementById("tipo").value;
  const itens=[];
  const tipoM=document.getElementById("tipoMaquina").value;
  checklistsPorTipo[tipoM].forEach(sec=>{
    sec.itens.forEach(item=>{
      itens.push({
        nome:item,
        status:document.querySelector(`input[name='${item}']:checked`)?.value||"",
        observacao:document.getElementById(`obs_${item}`).value
      });
    });
  });

  const dados={
    operador:document.getElementById("operador").value,
    maquina:document.getElementById("maquina").value,
    tipo,
    items:itens
  };

  await fetch(API_CHECKLIST,{method:"POST",body:JSON.stringify(dados)});
  alert("Enviado!");
}

window.onload=carregarMaquinas;
