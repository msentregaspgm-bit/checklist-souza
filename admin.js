const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjE6OXjsifXH9VNtH_s4LEH3iyWWCFMuhZ9n4l4AYGeaQBQPLcyH-gQa7GGmCOyHC7/exec";

let dados = [];

function carregarDashboard() {
  const script = document.createElement("script");
  const callbackName = "callbackDashboard";
  window[callbackName] = function (data) {
    dados = data;
    gerarResumo();
    gerarTabela();
    gerarGrafico();
  };
  script.src = `${SCRIPT_URL}?view=dashboard&callback=${callbackName}`;
  document.body.appendChild(script);
}

function gerarResumo() {
  const cards = document.getElementById("cards");
  const total = dados.length;
  const comFalhas = dados.filter(d => d.itens.some(i => i.status === "Não Conforme")).length;

  cards.innerHTML = `
    <div class='card verde'>Total de Checklists: ${total}</div>
    <div class='card vermelho'>Com Falhas: ${comFalhas}</div>
  `;
}

function gerarTabela() {
  const tbody = document.querySelector("#tabela tbody");
  tbody.innerHTML = "";
  dados.forEach(d => {
    d.itens.forEach(i => {
      if (i.status === "Não Conforme") {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${d.dataHora}</td><td>${d.maquina}</td><td>${d.operador}</td><td>${i.nome}</td><td>${i.status}</td>`;
        tbody.appendChild(tr);
      }
    });
  });
}

function gerarGrafico() {
  const ctx = document.getElementById("graficoFalhas").getContext("2d");
  const maquinas = [...new Set(dados.map(d => d.maquina))];
  const falhas = maquinas.map(m => dados.filter(d => d.maquina === m && d.itens.some(i => i.status === "Não Conforme")).length);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: maquinas,
      datasets: [{
        label: "Checklists com Falhas",
        data: falhas,
        backgroundColor: "#66BB6A"
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

window.onload = carregarDashboard;
