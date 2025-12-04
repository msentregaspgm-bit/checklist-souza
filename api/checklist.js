// checklists.js - Checklists por tipo de máquina
const checklistsPorTipo = {
  "BAZUCA": [
    { categoria: "Motor / Sistema", itens: ["Nível de óleo do motor", "Vazamentos", "Filtro de ar", "Bateria"] },
    { categoria: "Estrutura", itens: ["Placas e suportes", "Parafusos", "Pintura/Corrosão"] },
    { categoria: "Segurança", itens: ["Extintor", "Sinalização", "Proteções"] }
  ],
  "CAMINHÃO": [
    { categoria: "Motor", itens: ["Nível do óleo", "Água do radiador", "Filtro de ar"] },
    { categoria: "Freios e Rodas", itens: ["Pastilhas/Discos", "Pneus (pressão)", "Porcas das rodas"] },
    { categoria: "Segurança/Documentos", itens: ["Extintor", "Triângulo", "Documentação"] }
  ],
  "CARREGADEIRA": [
    { categoria: "Motor", itens: ["Óleo do motor", "Filtro diesel", "Arrefecimento"] },
    { categoria: "Hidráulico", itens: ["Mangueiras", "Cilindros", "Nível óleo hidráulico"] },
    { categoria: "Estrutura", itens: ["Caçamba", "Pinos e articulação", "Esteios"] }
  ],
  "COLHEITADEIRA": [
    { categoria: "Motor/Transmissão", itens: ["Óleo motor", "Transmissão", "Correias"] },
    { categoria: "Sistema de Corte", itens: ["Lâminas", "Cadeias", "Tensionamento"] },
    { categoria: "Segurança", itens: ["Proteções", "Sinalização", "Iluminação"] }
  ],
  "DISTRIBUIDOR": [
    { categoria: "Motor", itens: ["Nível óleo", "Filtro", "Vazamentos"] },
    { categoria: "Distribuição", itens: ["Bicos", "Bombas", "Controle de vazão"] },
    { categoria: "Estrutura", itens: ["Hastes", "Suportes", "Acionamentos"] }
  ],
  "EMBOLSADORA": [
    { categoria: "Sistema Hidráulico", itens: ["Mangueiras", "Cilindros", "Vazamentos"] },
    { categoria: "Alimentação", itens: ["Esteiras", "Correias", "Sensores"] },
    { categoria: "Elétrica", itens: ["Painel", "Sensores", "Luzes"] }
  ],
  "EMPILHADEIRA": [
    { categoria: "Motor/Elétrico", itens: ["Bateria/charge", "Fusíveis", "Conexões"] },
    { categoria: "Hidráulico", itens: ["Cilindros", "Mangueiras", "Vazamentos"] },
    { categoria: "Segurança", itens: ["Forks", "Ganchos", "Freio estacionamento"] }
  ],
  "ESCAVADEIRA HIDRAULICA": [
    { categoria: "Motor", itens: ["Óleo motor", "Filtro ar", "Arrefecimento"] },
    { categoria: "Hidráulico", itens: ["Mangueiras", "Cilindros", "Vazamentos"] },
    { categoria: "Esteiras/Undercarriage", itens: ["Rolos", "Tensionamento", "Sapatas"] }
  ],
  "F4000": [
    { categoria: "Motor", itens: ["Nível óleo", "Radiador", "Filtro ar"] },
    { categoria: "Freios", itens: ["Pastilhas", "Fluido", "Mangueiras"] },
    { categoria: "Carroceria", itens: ["Caçamba", "Trincos", "Sinalização"] }
  ],
  "GRADE": [
    { categoria: "Estrutura", itens: ["Lâminas", "Parafusos", "Suportes"] },
    { categoria: "Acionamento", itens: ["Articulações", "Rolamentos", "Lubrificação"] }
  ],
  "GRAN": [
    { categoria: "Motor/Sistema", itens: ["Óleo", "Filtros", "Vazamentos"] },
    { categoria: "Operação", itens: ["Transmissão", "Correias", "Segurança"] }
  ],
  "NIVELADORA": [
    { categoria: "Motor/Transmissão", itens: ["Óleo", "Filtro", "Transmissão"] },
    { categoria: "Lâminas e Controle", itens: ["Lâminas", "Atuadores", "Nível"] }
  ],
  "PLANTADEIRA": [
    { categoria: "Semeamento", itens: ["Distribuição/semente", "Dosador", "Esteiras"] },
    { categoria: "Estrutura", itens: ["Linha de semeadura", "Suportes", "Parafusos"] }
  ],
  "PLATAFORMA": [
    { categoria: "Estrutura", itens: ["Pisos", "Grades", "Travas"] },
    { categoria: "Elevação", itens: ["Mecanismo", "Hidráulicos", "Controles"] }
  ],
  "PULVERIZADOR": [
    { categoria: "Bomba/Sistema", itens: ["Bomba", "Filtros", "Bicos"] },
    { categoria: "Tanque", itens: ["Limpeza", "Válvulas", "Níveis"] }
  ],
  "REBOKE": [
    { categoria: "Estrutura", itens: ["Engate", "Trincos", "Suportes"] },
    { categoria: "Rodas", itens: ["Pneus", "Rolamentos", "Porcas"] }
  ],
  "SUBSOLADOR": [
    { categoria: "Estrutura", itens: ["Garfos", "Parafusos", "Suportes"] },
    { categoria: "Acionamento", itens: ["Acoplamento", "Lubrificação", "Transmissão"] }
  ],
  "TMS": [
    { categoria: "Sistema", itens: ["Comunicação", "GPS", "Sensores"] },
    { categoria: "Energia", itens: ["Bateria", "Conexões", "Antena"] }
  ],
  "TRATOR": [
    { categoria: "Motor", itens: ["Nível do óleo do motor", "Filtro ar", "Arrefecimento"] },
    { categoria: "Transmissão", itens: ["Embreagem", "Marchas", "Eixos"] },
    { categoria: "Estrutura", itens: ["Pneus", "Retrovisores", "Banco"] }
  ]
};

// compatibilidade global para scripts que não usam modules
if (typeof window !== "undefined") {
  window.checklistsPorTipo = checklistsPorTipo;
}
export default checklistsPorTipo;
