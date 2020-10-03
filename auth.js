// autenticação status/ quando um usuário logar ou sair o status muda e dispara os respectivos códigos
auth.onAuthStateChanged((user) => {
  if (user) {
    // assim que um usuário realiza o login com sucesso, imediatamente é buscado os dados dos semestres dele no DB
    console.log("usuário logou");

    db.collection("semestreUsuario")
      .where("uid", "==", user.uid)
      .get()
      .then((snapshot) => {
        console.log(snapshot.docs);
        mostrarCardSemestre(snapshot.docs);
      });

    // db em tempo real
    db.collection("semestreUsuario")
      .where("uid", "==", user.uid)
      .onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
          if (change.type == "added") {
            console.log(change.doc);
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
      });
  } else {
    console.log("usuario saiu ", user);
  }
});

// ----------------------------------- FUNÇÕES DE USO -------------------------------------//
function getCadeira(docSmestreUsuario) {}
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
function gravarId(id) {
  document.getElementById("btn-pretendida").value = id;
  document.getElementById("btn-cursando").value = id;
  document.getElementById("btn-concluida").value = id;

  console.log(document.getElementById("btn-pretendida").value);
  console.log(document.getElementById("btn-cursando").value);
  console.log(document.getElementById("btn-concluida").value);
}

let modal = document.getElementById("modalStatus");
if (modal) {
  var reply_click = function () {
    alert(
      "Button clicked, id = " +
        this.id +
        ", text " +
        this.innerHTML +
        " value =" +
        this.value
    );
  };
  document.getElementById("btn-pretendida").onclick = reply_click;
  document.getElementById("btn-cursando").onclick = reply_click;
  document.getElementById("btn-concluida").onclick = reply_click;
}
// ------------------------------------ FIM FUNÇÕES DE USO ------------------------------------//
// ------------------------------------RENDERIZAÇÃO DOM ---------------------------------------//
// ----- Listar todas as cadeiras
const listaCadeira = document.querySelector(".lista-cadeira");
// acesso ao banco de dados

db.collection("cadeira")
  .get()
  .then((snapshot) => {
    // condicional no db para chamar a função apenas na página que possuir uma div com esta classe
    // listaCadeira = document.querySelector(".lista-cadeira");
    if (listaCadeira) {
      mostrarCadeiras(snapshot.docs);
    }
  });

if (listaCadeira) {
  function mostrarCadeiras(dados) {
    let html = "";
    dados.forEach((doc) => {
      const cadeira = doc.data();
      console.log(cadeira);
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

// -------------------- Cartão de semestres
const cardSemestre = document.querySelector("#semestres");
// PSEUDOCÓDIGO - para cada instância de dados na coleção semestreUsuário, crie um cartão com todas as cadeiras deste semestre
if (cardSemestre) {
  function mostrarCardSemestre(dados) {
    let html = "";
    dados.forEach((doc) => {
      let listaCadeiras = "";
      const semestre = doc.data();

      let cardSuperior = `<div class="col-5 mx-2" id="${semestre.semestreid}">
                            <div class="card shadow" style="width: 29rem;">
                              <div class="card-body">
                                <h4 class="card-title">${semestre.semestreid}</h4>
                              </div>
                              <ul class="list-group list-group-flush">`;

      let cardInferior = `</ul>
                            </div>
                        </div>`;

      for (cadeira in semestre.semestre) {
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
                                              id="${cadeira}" onClick="gravarId(this.id)">${status}</button>
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
    });
    cardSemestre.innerHTML = html;
  }
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
function renderModal(doc) {}
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
              trilha: "null",
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
          contCadeirasSistemas: 0,
          contCadeirasDesign: 0,
          contCadeirasAudiovisual: 0,
          contCadeirasJogos: 0,
          contCadeirasObrigatorias: 0,
          contCadeirasEletivas: 0,
          contCadeirasOptativas: 0,
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
    console.log("usuário logado");
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
