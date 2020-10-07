const numeroTotalDeCadeiras = 40;
const numeroTotalDeCadeirasObrigatorias = 23;
const numeroTotalDeCadeirasEletivas = 7;
const numeroTotalDeCadeirasOptativas = 11;
// autenticação status/ quando um usuário logar ou sair o status muda e dispara os respectivos códigos
auth.onAuthStateChanged((user) => {
  if (user) {
    // assim que um usuário realiza o login com sucesso, imediatamente é buscado os dados dos semestres dele no DB
    console.log("usuário logou");

    /*
    db.collection("semestreUsuario")
      .where("uid", "==", user.uid)
      .get()
      .then((snapshot) => {
        mostrarCardSemestre(snapshot.docs);
      });
    */
    // db em tempo real
    db.collection("semestreUsuario")
      .where("uid", "==", user.uid)
      .onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
          if (change.type == "added" && cardSemestre) {
            mostrarCardSemestre(change.doc);
          } else if (change.type == "removed") {
          }
        });
      });
    // pegando os dados do usuário
    db.collection("usuario")
      .where("uid", "==", user.uid)
      .get()
      .then((snapshot) => {
        mostraNome(snapshot.docs);
        if (rowConclusao) {
          statusConclusaoTrilha(snapshot.docs);
        }
        //statusConclusaoCategoria(snapshot.docs);
      });
  } else {
    console.log("usuario saiu ", user);
  }
});
//
// pegar todas as cadeiras
let tudoCadeira;
db.collection("cadeira")
  .get()
  .then((snapshot) => {
    // condicional no db para chamar a função apenas na página que possuir uma div com esta classe
    // listaCadeira = document.querySelector(".lista-cadeira");
    tudoCadeira = todasAsCadeiras(snapshot.docs);
    if (listaCadeira) {
      mostrarCadeiras(snapshot.docs);
    }
    if (addSemestreForm) {
      mostrarOpcoes(snapshot.docs);
    }
  });

//let userData = db.collection("usuario").where("uid", "==", userAtual.uid).get();

//
// ----------------------------------- FUNÇÕES DE USO -------------------------------------//
let rowConclusao = document.getElementById("row-conclusao");
if (rowConclusao) {
  function statusConclusaoTrilha(dados) {
    dados.forEach((doc) => {
      const usuario = doc.data();
      db.collection("semestreUsuario")
        .where("uid", "==", usuario.uid)
        .get()
        .then((snapshot) => {
          let statusCadeiraTrilhas = calcularStatusConclusaoTrilhas(
            snapshot.docs
          );
          renderBarraTrilhas(statusCadeiraTrilhas);
          let statusCadeiraCategoria = calcularStatusConclusaoCategoria(
            snapshot.docs
          );
          renderBarraCategoria(statusCadeiraCategoria);
          checaConquistas(snapshot.docs);
        });
    });
  }
}
function calcularStatusConclusaoTrilhas(dados) {
  let contSistemas = 0;
  let contDesign = 0;
  let contAudiovisual = 0;
  let contJogos = 0;
  dados.forEach((doc) => {
    let semestres = doc.data();
    for (let cadeira in semestres.semestre) {
      if (
        semestres.semestre[cadeira].status != "concluida" ||
        cadeira == "pendente"
      ) {
        continue;
      } else {
        if (semestres.semestre[cadeira].trilha == "sistemas") {
          contSistemas += 1;
        } else if (semestres.semestre[cadeira].trilha == "design") {
          contDesign += 1;
        } else if (semestres.semestre[cadeira].trilha == "audiovisual") {
          contAudiovisual += 1;
        } else if (semestres.semestre[cadeira].trilha == "jogos") {
          contJogos += 1;
        }
      }
    }
  });
  return [contSistemas, contDesign, contAudiovisual, contJogos];
}
function calcularStatusConclusaoCategoria(dados) {
  let contObrigatoria = 0;
  let contEletiva = 0;
  let contOptativa = 0;
  dados.forEach((doc) => {
    let semestres = doc.data();
    for (let cadeira in semestres.semestre) {
      if (
        semestres.semestre[cadeira].status != "concluida" ||
        cadeira == "pendente"
      ) {
        continue;
      } else {
        if (semestres.semestre[cadeira].categoria == "obrigatoria") {
          contObrigatoria += 1;
        } else if (semestres.semestre[cadeira].categoria == "eletiva") {
          contEletiva += 1;
        } else if (semestres.semestre[cadeira].categoria == "optativa") {
          contOptativa += 1;
        }
      }
    }
  });
  return [contObrigatoria, contEletiva, contOptativa];
}
function todasAsCadeiras(dados) {
  let documento = [];
  let chave;
  let conteudo;
  dados.forEach((doc) => {
    chave = doc.id;
    conteudo = doc.data();
    documento.push({ [chave]: conteudo });
  });
  console.log(documento);
  return documento;
}
function nomeCadeira(cad) {
  if (cad != "") {
    let valor;
    for (let x in tudoCadeira) {
      valor = tudoCadeira[x];
      if (valor[cad]) {
        return valor[cad].nome;
      } else {
        continue;
      }
    }
    return "Sem requisitos";
  }
}
// Retorna a classe de cor de acordo com a trilha
function temaTrilha(string) {
  let cor = "";
  switch (string) {
    case "sistemas":
      cor = "cor-sistemas";
      break;
    case "design":
      cor = "cor-design";
      break;
    case "audiovisual":
      cor = "cor-audiovisual";
      break;
    case "jogos":
      cor = "cor-jogos";
      break;
    default:
      cor = "bg-primary";
  }
  return cor;
}
function temaCategoria(string) {
  let cor = "";
  switch (string) {
    case "obrigatoria":
      cor = "cor-obrigatoria";
      break;
    case "obrigatória":
      cor = "cor-obrigatoria";
      break;
    case "eletiva":
      cor = "cor-eletiva";
      break;
    case "optativa":
      cor = "cor-optativa";
      break;
    default:
      cor = "bg-primary";
      break;
  }
  return cor;
}
function temaStatus(string) {
  let cor = "";
  switch (string) {
    case "pretendida":
      cor = "cor-pretendida";
      break;
    case "cursando":
      cor = "cor-cursando";
      break;
    case "concluida":
      cor = "cor-concluida";
      break;
    default:
      cor = "bg-primary";
  }
  return cor;
}

function iconeStatus(string) {
  let icone = `<i class="fas fa-question-circle"></i>`;
  if (
    (string != "" && string == "pretendida") ||
    string == "cursando" ||
    string == "concluida" ||
    string == "concluída"
  ) {
    icone = `<i class="fas fa-check-circle"></i>`;
  }
  return icone;
}
// -------- MODAL

// Modal atualizar status de uma cadeira
function gravarIdStatus(cadeiraId, semestreId) {
  document.getElementById("pretendida").value = cadeiraId;
  document.getElementById("cursando").value = cadeiraId;
  document.getElementById("concluida").value = cadeiraId;

  document.getElementById("pretendida").name = semestreId;
  document.getElementById("cursando").name = semestreId;
  document.getElementById("concluida").name = semestreId;
}

let modal = document.getElementById("modalStatus");
if (modal) {
  var updateStatus = function () {
    let id = this.name;
    let cadeira = this.value;
    let novoStatus = this.id;
    let documento;
    db.collection("semestreUsuario")
      .doc(id)
      .get()
      .then((doc) => {
        documento = doc.data();
        documento.semestre[cadeira].status = novoStatus;
        atualizarColecao("semestreUsuario", id, documento);
      });
  };
  document.getElementById("pretendida").onclick = updateStatus;
  document.getElementById("cursando").onclick = updateStatus;
  document.getElementById("concluida").onclick = updateStatus;
}

function atualizarColecao(nomeColecao, Docid, objetoAtualizado) {
  db.collection(nomeColecao)
    .doc(Docid)
    .update(objetoAtualizado)
    .then(() => {
      location.reload();
    });
}
if (document.getElementById("accordion")) {
  console.log("accordiion true");
  let valorTrilha;
  if (document.getElementById("trilha-sistemas-completa")) {
    valorTrilha = "sistemas";
    console.log(valorTrilha);
  } else if (document.getElementById("trilha-design-completa")) {
    valorTrilha = "design";
    console.log(valorTrilha);
  } else if (document.getElementById("trilha-audiovisual-completa")) {
    valorTrilha = "audiovisual";
    console.log(valorTrilha);
  } else if (document.getElementById("trilha-jogos-completa")) {
    valorTrilha = "jogos";
    console.log(valorTrilha);
  }

  db.collection("cadeira")
    .where("trilha", "==", valorTrilha)
    .get()
    .then((snapshot) => {
      renderAccordion(snapshot.docs);
    });
}

// ------------------------------------ FIM FUNÇÕES DE USO ------------------------------------//
// ------------------------------------RENDERIZAÇÃO DOM ---------------------------------------//

// ----- Listar todas as cadeiras
const listaCadeira = document.querySelector(".lista-cadeira");
// acesso ao banco de dados

if (listaCadeira) {
  function mostrarCadeiras(dados) {
    let html = "";
    dados.forEach((doc) => {
      const cadeira = doc.data();

      // quanto ao retorno do id de uma cadeira, é necessário pegar diretamente do documento. (DOC)
      let card = `
      <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${cadeira.nome}</h5>
          <p class="card-text">${cadeira.descricao}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">${doc.id}</li> 
          <li class="list-group-item">${cadeira.cargaHoraria}</li>
          <li class="list-group-item">${cadeira.creditos}</li>
          <li class="list-group-item">${cadeira.trilha}</li>
        </ul>
        <div class="card-body">
          <a href="#" class="card-link">Card link</a>
          <a href="#" class="card-link">Another link</a>
        </div>
      </div>
    `;
      html += card;
    });
    listaCadeira.innerHTML = html;
  }
}

// -------------------- Barras de conclusão
const barraTrilhas = document.querySelector("#conclusao-trilha");
const barraTipo = document.querySelector("#conclusao-tipo");
function renderBarraTrilhas(array) {
  // ordem no array [sistemas, design, audiovisual, jogos]
  const taxaCorrecaoPorcentagem = 2.5;
  let barraSistemas = document.getElementById("progress-bar-sistemas");
  let valorSistemas = array[0] * taxaCorrecaoPorcentagem;

  let barraDesign = document.getElementById("progress-bar-design");
  let valorDesign = array[1] * taxaCorrecaoPorcentagem;

  let barraAudiovisual = document.getElementById("progress-bar-audiovisual");
  let valorAudiovisual = array[2] * taxaCorrecaoPorcentagem;

  let barraJogos = document.getElementById("progress-bar-jogos");
  let valorJogos = array[3] * taxaCorrecaoPorcentagem;

  barraSistemas.style.width = valorSistemas + "%";
  barraDesign.style.width = valorDesign + "%";
  barraAudiovisual.style.width = valorAudiovisual + "%";
  barraJogos.style.width = valorJogos + "%";
}

function renderBarraCategoria(array) {
  // ordem do arry [obrigatoria, elettiva, optativa]
  const taxaCorrecaoPorcentagemObrigatoria = 4.55;
  const taxaCorrecaoPorcentagemEletiva = 14.3;
  const taxaCorrecaoPorcentagemOptativa = 9.1;

  let barraObrigatoria = document.getElementById("progress-bar-obrigatorias");
  let valorObrigatoria = array[0] * taxaCorrecaoPorcentagemObrigatoria;

  let barraEletiva = document.getElementById("progress-bar-eletivas");
  let valorEletiva = array[1] * taxaCorrecaoPorcentagemEletiva;

  let barraOptativa = document.getElementById("progress-bar-optativas");
  let valorOptativa = array[2] * taxaCorrecaoPorcentagemOptativa;

  barraObrigatoria.style.width = valorObrigatoria + "%";
  barraEletiva.style.width = valorEletiva + "%";
  barraOptativa.style.width = valorOptativa + "%";
}
// -------------------- Cartão de semestres
const cardSemestre = document.querySelector("#semestres");
// PSEUDOCÓDIGO - para cada instância de dados na coleção semestreUsuário, crie um cartão com todas as cadeiras deste semestre
if (cardSemestre) {
  function mostrarCardSemestre(dados) {
    let html = "";
    let listaCadeiras = "";
    const semestre = dados.data();
    const id = dados.id.toString();

    let cardSuperior = `<div class="mx-2 mb-4" id="${semestre.semestreid}">
                            <div class="card shadow" style="width: 29rem;">
                              <div class="card-body d-flex justify-content-between">
                                <h4 class="card-title my-auto">${semestre.semestreid}</h4>
                                <button type="button" 
                                              class="btn btn-success add-semestre"
                                              data-toggle="modal"
                                              data-target="#modalAddSemestre">Adicionar semestre</button>
                              </div>
                              <ul class="list-group list-group-flush">`;

    let cardInferior = `</ul>
                            </div>
                        </div>`;

    for (cadeira in semestre.semestre) {
      if (cadeira == "pendente") {
        continue;
      }
      let nome = semestre.semestre[cadeira].nome;
      let cargaHoraria = semestre.semestre[cadeira].cargaHoraria;
      let trilha = semestre.semestre[cadeira].trilha;
      let categoria = semestre.semestre[cadeira].categoria;
      let corTrilha = temaTrilha(semestre.semestre[cadeira].trilha);
      let corCategoria = temaCategoria(semestre.semestre[cadeira].categoria);
      let status = iconeStatus(semestre.semestre[cadeira].status);
      let corStatus = temaStatus(semestre.semestre[cadeira].status);

      let cadeirasDoSemestre = `<li class="list-group-item">
                                    <div class="d-flex justify-content-between">
                                      <span class="nome-cadeira my-3 ml-2">${nome}</span>
                                      <button type="button" 
                                              class="btn status-cadeira ${corStatus}"
                                              data-toggle="modal"
                                              data-target="#modalStatus"
                                              id="${cadeira}" value=${id} onClick="gravarIdStatus(this.id, this.value)">${status}</button>
                                    </div>
                                    <div >
                                      <span class="info-cadeira">${cadeira}</span>
                                      <span class="info-cadeira">${cargaHoraria}hrs</span>
                                      <span class="info-cadeira info-cadeira-tipo ${corCategoria}">${categoria}</span>
                                      <span class="info-cadeira info-cadeira-trilha ${corTrilha}">${trilha}</span>
                                    </div>
                                  </li>`;

      listaCadeiras += cadeirasDoSemestre;
    }

    html += cardSuperior + listaCadeiras + cardInferior;

    cardSemestre.innerHTML += html;
  }
}
function renderAccordion(dados) {
  let html = "";
  let cont = 1;
  dados.forEach((doc) => {
    const cadeira = doc.data();
    let cadeiraRequisitos = nomeCadeira(cadeira.requisitos);
    let corCategoria = temaCategoria(cadeira.categoria);
    let corTrilha = temaTrilha(cadeira.trilha);
    let card = `<div class="card" id="${doc.id}">
                  <div class="card-header d-flex justify-content-between align-items-center"
                      id="heading${cont}">
                      <h5 class="mb-0">
                          <button class="btn btn-link collapsed" data-toggle="collapse"
                              data-target="#collapse${cont}" aria-expanded="false"
                              aria-controls="collapse${cont}">
                              <span class="mx-1">${cadeira.nome} </span> <i class="fas fa-plus"></i>
                          </button>
                      </h5>
                      <div>
                          <span class="info-cadeira">${doc.id}</span>
                          <span class="info-cadeira">${cadeira.cargaHoraria} horas</span>
                          <span
                              class="info-cadeira info-cadeira-tipo ${corCategoria}">${cadeira.categoria}</span>
                          <span
                              class="info-cadeira info-cadeira-trilha ${corTrilha}">${cadeira.trilha}</span>
                      </div>
                  </div>
                  <div id="collapse${cont}" class="collapse" aria-labelledby="heading${cont}"
                      data-parent="#accordion">
                      <div class="card-body d-flex align-items-center">
                          <span class="">requisitos: </span><span
                              class="info-cadeira">${cadeiraRequisitos}</span>
                      </div>

                      <div class="card-body">
                          ${cadeira.conteudo}
                      </div>
                  </div>
              </div>`;
    cont += 1;
    html += card;
  });
  document.getElementById("accordion").innerHTML = html;
}
// ------------ Renderizar conquistas
let consquistas = [
  {
    icone: "fas fa-trophy",
    id: "primeiro-semestre",
    nome: "entregou o game do primeiro semestre",
    requisito: "Concluir todas as cadeiras do primeiro semestre",
  },
  {
    icone: "fas fa-brain",
    id: "segundo-semestre",
    nome: "entegou seu projeto de Cognição e Tecnologias Digitais",
    requisito: "Concluir todas as cadeiras do segundo semestre",
  },
  {
    icone: "fas fa-sitemap",
    id: "terceiro-semestre",
    nome: "entegou seu priemiro grande projeto em Projeto I",
    requisito: "Concluir todas as cadeiras do terceiro semestre",
  },
  {
    icone: "fas fa-vial",
    id: "metodologia-pesquisa",
    nome: "entrengou seu primeiro artigo ciêntífico",
    requisito: "Concluir a cadeira Metodologia de Pesquisa Científica",
  },

  {
    icone: "fas fa-square-root-alt",
    id: "mami",
    nome: "não trancou MAMI",
    requisito: "Concluir a cadeira Matemática Aplicada A Multimídia",
  },
  {
    icone: "fas fa-film",
    id: "narrativas",
    nome: "entregou o curta de Narratívas Multimídias",
    requisito: "Concluir a cadeira Matemática Aplicada A Multimídia",
  },
  {
    icone: "fas fa-star",
    id: "cadeiras-basicas",
    nome: "concluiu as cadeiras básicas",
    requisito: "Concluir todas as 15 cadeiras do ciclo básico",
  },

  {
    icone: "fas fa-plus",
    id: "mais",
    nome: "nomeQQ",
    requisito: "Concluir uma cadeira fora da grade regular do SMD",
  },

  {
    icone: "fas fa-heartbeat",
    id: "metade",
    nome: "sobreviveu a metade do curso",
    requisito: "Concluir metade das cadeiras necessárias para concluir o curso",
  },
  {
    icone: "fas fa-database",
    id: "bd",
    nome: " é um mestre em banco de dados",
    requisito: "",
  },
  {
    icone: "fab fa-figma",
    id: "designFigma",
    nome: " encontrou seu melhor amigo o Figma",
    requisito: "Concluir três ou mais cadeiras da trilha Design",
  },
  {
    icone: "fas fa-stream",
    id: "tutoriais",
    nome: " ganhou maestria em tutoriais indianos",
    requisito: "Concluir três ou mais cadeiras da trilha Sistemas",
  },
  {
    icone: "fas fa-project-diagram",
    id: "sistemas-master",
    nome: "concluiu 10 cadeiras da trilha de sistemas",
    requisito: "Concluir dez ou mais cadeiras da trilha Sistemas",
  },
  {
    icone: "far fa-object-group",
    id: "design-master",
    nome: "concluiu 10 cadeiras da trilha de design",
    requisito: "Concluir três ou mais cadeiras da trilha Design",
  },
  {
    icone: "fas fa-play-circle",
    id: "audiovisual-master",
    nome: "concluiu 10 cadeiras da trilha de audiovisual",
    requisito: "Concluir três ou mais cadeiras da trilha Audiovisual",
  },
  {
    icone: "fas fa-gamepad",
    id: "jogos-master",
    nome: "concluiu 10 cadeiras da trilha de design",
    requisito: "Concluir três ou mais cadeiras da trilha Jogos",
  },
  {
    icone: "fas fa-battery-three-quarters",
    id: "3/4completo",
    nome: " está quase lá, falta pouco",
    requisito:
      "Concluir 3/4 das cadeiras necessárias para a conclusão do curso",
  },
  {
    icone: "fas fa-award",
    id: "tcc",
    nome: "entregou seu Trablho de Comclusão de Curso",
    requisito: "Concluir a cadeira Trabalho de Conclusão de Curso",
  },
];
if (document.getElementById("conquistas")) {
  renderConquistas(consquistas);
}
function renderConquistas(arrayDoc) {
  let html = "";
  for (let x in arrayDoc) {
    let requisito = arrayDoc[x].requisito;
    let div = `<div class="icone-conquista rounded-circle ml-3" id="conquista-${arrayDoc[x].id}" title="${requisito}">
                  <span><i class="${arrayDoc[x].icone}"></i></span>
               </div>`;
    html += div;
  }
  document.getElementById("conquistas").innerHTML = html;
}

function checaConquistas(dados) {
  let contSistemas = 0;
  let contDesign = 0;
  let contAudiovisual = 0;
  let contJogos = 0;
  let taxaConclusao = 0;

  dados.forEach((doc) => {
    const semestre = doc.data();
    for (let x in semestre.semestre) {
      if (semestre.semestre[x].status != "concluida") {
        continue;
      } else {
        taxaConclusao += 1;
        if (semestre.semestre[x].trilha == "sistemas") {
          contSistemas += 1;
        } else if (semestre.semestre[x].trilha == "design") {
          contDesign += 1;
        } else if (semestre.semestre[x].trilha == "audiovisual") {
          contAudiovisual += 1;
        } else if (semestre.semestre[x].trilha == "jogos") {
          contJogos += 1;
        }

        if (
          semestre.semestre[x].nome == "Introdução a sistema de midias digitais"
        ) {
          document.getElementById(
            "conquista-primeiro-semestre"
          ).style.backgroundColor = "#10ad61";
        }

        if (semestre.semestre[x].nome == "Cognição e Tecnologias Digitais") {
          document.getElementById(
            "conquista-segundo-semestre"
          ).style.backgroundColor = "#10ad61";
        }

        if (semestre.semestre[x].nome == "Cognição e Tecnologias Digitais") {
          document.getElementById(
            "conquista-terceiro-semestre"
          ).style.backgroundColor = "#10ad61";
        }

        if (semestre.semestre[x].nome == "Metodologia de Pesquisa Científica") {
          document.getElementById(
            "conquista-metodologia-pesquisa"
          ).style.backgroundColor = "#10ad61";
        }

        if (semestre.semestre[x].nome == "Matemática Aplicada a Multimídia 1") {
          document.getElementById("conquista-mami").style.backgroundColor =
            "#10ad61";
        }

        if (semestre.semestre[x].nome == "Narrativas Multimídia") {
          document.getElementById(
            "conquista-narrativas"
          ).style.backgroundColor = "#10ad61";
        }
        if (semestre.semestre[x].nome == "Trabalho de Conclusão de Curso") {
          document.getElementById("conquista-tcc").style.backgroundColor =
            "#10ad61";
        }
      }
    }
  });
  if (contSistemas >= 3 && contSistemas <= 9) {
    document.getElementById("conquista-tutoriais").style.backgroundColor =
      "#10ad61";
  }
  if (contDesign >= 3 && contDesign <= 9) {
    document.getElementById("conquista-designFigma").style.backgroundColor =
      "#10ad61";
  }

  if (contSistemas >= 10) {
    document.getElementById("sistemas-master").style.backgroundColor =
      "#10ad61";
  }
  if (contDesign >= 10) {
    document.getElementById("design-master").style.backgroundColor =
      "#10ad61";
  }

  if (contAudiovisual >= 10) {
    document.getElementById("audiovisual-master").style.backgroundColor =
      "#10ad61";
  }
  if (contJogos >= 10) {
    document.getElementById("jogos-master").style.backgroundColor =
      "#10ad61";
  }

  console.log(`contSistemas  = ${contSistemas}
  contDesign  = ${contDesign}
  contAudiovisual  = ${contAudiovisual}
  contJogos  = ${contJogos}`);
}

// ---- RENDERIZAR NOME
const indexNome = document.querySelector("#nome-usuario");
if (indexNome) {
  function mostraNome(dados) {
    dados.forEach((doc) => {
      const usuario = doc.data();
      indexNome.innerHTML = usuario.nome;
    });
  }
}
// ------ Render modal
function selectDoc(nomeColecao, docId) {
  db.collection(nomeColecao).doc(docId).get();
}

function procuraCadeiraEmArray(array, cadeira) {
  if (cadeira != "pendente") {
    for (let x in array) {
      let valor = array[x];
      if (valor[cadeira]) {
        return valor[cadeira];
      }
    }
  } else {
    return {
      cargaHoraria: "",
      creditos: "",
      nome: "",
      descricao: "",
      categoria: "",
      trilha: "",
      conteudo: "",
      status: "",
      requisitos: [],
    };
  }
}

function mostrarOpcoes(listaCadeiras) {
  let html = "";
  listaCadeiras.forEach((doc) => {
    const cadeira = doc.data();
    let opcao = `<option value="${doc.id}">${cadeira.nome}</option>`;
    html += opcao;
  });
  document.getElementById("cadeira-op-1").innerHTML = html;
  document.getElementById("cadeira-op-2").innerHTML = html;
  document.getElementById("cadeira-op-3").innerHTML = html;
  document.getElementById("cadeira-op-4").innerHTML = html;
  document.getElementById("cadeira-op-5").innerHTML = html;
  document.getElementById("cadeira-op-6").innerHTML = html;
}

const addSemestreForm = document.querySelector("#add-semestre-form");
if (addSemestreForm) {
  addSemestreForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const semestreIdNovo = addSemestreForm["add-semestre"].value;
    if (semestreIdNovo == "") {
      document.getElementById("add-semestre-alerta").innerHTML =
        "Prencha o campo 'semestre' para continuar";
    } else {
      const primeiraCadeira =
        addSemestreForm["cadeira-1"].value != ""
          ? addSemestreForm["cadeira-1"].value
          : "pendente";
      const segundaCadeira =
        addSemestreForm["cadeira-2"].value != ""
          ? addSemestreForm["cadeira-2"].value
          : "pendente";
      const terceiraCadeira =
        addSemestreForm["cadeira-3"].value != ""
          ? addSemestreForm["cadeira-3"].value
          : "pendente";
      const quartaCadeira =
        addSemestreForm["cadeira-4"].value != ""
          ? addSemestreForm["cadeira-4"].value
          : "pendente";
      const quintaCadeira =
        addSemestreForm["cadeira-5"].value != ""
          ? addSemestreForm["cadeira-5"].value
          : "pendente";
      const sextaCadeira =
        addSemestreForm["cadeira-6"].value != ""
          ? addSemestreForm["cadeira-6"].value
          : "pendente";

      const statusPrimeira = addSemestreForm["cadeira-status-1"].value;
      const statusSegunda = addSemestreForm["cadeira-status-2"].value;
      const statusTerceira = addSemestreForm["cadeira-status-3"].value;
      const statusQuarta = addSemestreForm["cadeira-status-4"].value;
      const statusQuinta = addSemestreForm["cadeira-status-5"].value;
      const statusSexta = addSemestreForm["cadeira-status-6"].value;
      const user = auth.currentUser;
      // -------------------------
      const primeiraCaderiaData = [
        primeiraCadeira,
        procuraCadeiraEmArray(tudoCadeira, primeiraCadeira),
      ];
      primeiraCaderiaData[1].status = statusPrimeira;
      // -------------------------
      const segundaCaderiaData = [
        segundaCadeira,
        procuraCadeiraEmArray(tudoCadeira, segundaCadeira),
      ];
      segundaCaderiaData[1].status = statusSegunda;
      // -------------------------
      const terceiraCaderiaData = [
        terceiraCadeira,
        procuraCadeiraEmArray(tudoCadeira, terceiraCadeira),
      ];
      terceiraCaderiaData[1].status = statusTerceira;
      // -------------------------
      const quartaCaderiaData = [
        quartaCadeira,
        procuraCadeiraEmArray(tudoCadeira, quartaCadeira),
      ];
      quartaCaderiaData[1].status = statusQuarta;
      // -------------------------
      const quintaCaderiaData = [
        quintaCadeira,
        procuraCadeiraEmArray(tudoCadeira, quintaCadeira),
      ];
      quintaCaderiaData[1].status = statusQuinta;
      // -------------------------
      const sextaCaderiaData = [
        sextaCadeira,
        procuraCadeiraEmArray(tudoCadeira, sextaCadeira),
      ];
      sextaCaderiaData[1].status = statusSexta;
      // -------------------------

      const semestreCompleto = {
        uid: user.uid,
        semestreid: semestreIdNovo,
        semestre: {
          [primeiraCaderiaData[0]]: primeiraCaderiaData[1],
          [segundaCaderiaData[0]]: segundaCaderiaData[1],
          [terceiraCaderiaData[0]]: terceiraCaderiaData[1],
          [quartaCaderiaData[0]]: quartaCaderiaData[1],
          [quintaCaderiaData[0]]: quintaCaderiaData[1],
          [sextaCaderiaData[0]]: sextaCaderiaData[1],
        },
      };
      console.log(semestreCompleto);
      db.collection("semestreUsuario")
        .add(semestreCompleto)
        .then(() => {
          location.reload();
        });
    }
  });
}
// -------------------- Cards de semestre
// ---------------------------------------- FIM RENDERIZAÇÃO DOM ------------------------------//
// ------ ler ids de um array
// debugar depois
/*
  const lerIds = async (collection, arrayId) =>{
    const leitura = arrayId.map(id => collection.doc(id).get());
    const resultado = await Promise.all(leitura);
    return resultado.map(v => v.data());
  }
*/

// ------------------------------------------- Cadastro / Login / Logout -----------------------------------------//
// ------------------- cadastrar-se
const signupForm = document.querySelector("#cadastre-se");
// checando se esse id existe na página
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    // isso previne que a página reinicie toda vez que um usuário tentar se cadastrar
    e.preventDefault();
    const email = signupForm["inputEmail"].value;
    const password = signupForm["inputPassword"].value;
    const confirmPassword = signupForm["inputPasswordConfirmation"].value;

    const nome = signupForm["inputNome"].value;
    const semestreIngresso = signupForm["inputSemestreIngresso"].value;

    // cadastrar usuario
    // o metodo usado (creatUserWithEmailAndPassword) é uma inicialização asíncrona, ou seja
    // ela roda em paralelo ao código principal, pois sua função é fazer uma busca na base de dados
    // o que pode demorar, então, para não diminuir o desempenho do código essa função gera uma 'promessa'
    // que nos permite usar a função then, que retornará uma credencial quando a promessa for cumprida.
    if (password === confirmPassword) {
      auth.createUserWithEmailAndPassword(email, password).then((cred) => {
        // cria na coleção semestreUsuario uma instância exclusiva na qual o usuário pode preencher suas cadeiras de cada semestre
        db.collection("semestreUsuario").add({
          uid: cred.user.uid,
          semestreid: semestreIngresso,
          semestre: {
            SMD0095: {
              nome: "Programação 1",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "sistemas",
              categoria: "obrigatória",
              descricao: "",
              conteudo: "",
              status: "cursando",
              requisitos: [],
            },
            SMD0094: {
              nome: "Introdução a sistema de midias digitais",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "basico",
              categoria: "obrigatória",
              descricao: "",
              conteudo: "",
              status: "cursando",
              requisitos: [],
            },
            SMD0091: {
              nome: "História do design",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "design",
              categoria: "obrigatória",
              descricao: "",
              conteudo: "",
              status: "cursando",
              requisitos: [],
            },
            SMD0089: {
              nome: "Desenho 1",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "audiovisual",
              categoria: "obrigatória",
              descricao: "",
              conteudo: "",
              status: "cursando",
              requisitos: [],
            },
            SMD0088: {
              nome: "Autoração multimídia 1",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "design",
              categoria: "obrigatória",
              descricao: "",
              conteudo: "",
              status: "cursando",
              requisitos: [],
            },
          },
        });

        db.collection("usuario").add({
          uid: cred.user.uid,
          nome: nome,
          semestreInicio: semestreIngresso,
        });
        // logar imediatamente apos a confimação de cadastro
        logar(email, password);
      });
    } else {
      document.getElementById("mensagemAlerta").innerHTML = "Senhas diferentes";
    }
  });
}

// ------------------------- login na conta
// variáveis necessárias para login por formulário
const loginForm = document.querySelector("#loginForm");
let emailLogin;
let senhaLogin;

// login por formulário
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // credenciais de login
    emailLogin = loginForm["inputEmail"].value;
    senhaLogin = loginForm["inputPassword"].value;

    logar(emailLogin, senhaLogin);
  });
}
// funcao de logar e redirecionar o site
function logar(email, senha) {
  auth.signInWithEmailAndPassword(email, senha).then((cred) => {
    document.location.href = "index.html";
  });
}

// ------------------ sair da conta
const sair = document.querySelector("#sair");
// checando se esse id existe na página
if (sair) {
  sair.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      document.location.href = "login.html";
    });
  });
}
