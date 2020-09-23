// autenticação status/ quando um usuário logar ou sair o status muda e dispara os respectivos códigos
auth.onAuthStateChanged((user) => {
  if (user) {
    // assim que um usuário realiza o login com sucesso, imediatamente é buscado os dados dos semestres dele no DB
    console.log("usuário logou");
    db.collection("semestreUsuario")
      .where("uid", "==", user.uid)
      .get()
      .then((snapshot) => {
        mostrarCardSemestre(snapshot.docs);
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
    case "eletiva":
      cor = "cor-eletiva";
      break;
    case "optativa":
      cor = "cor-optativa";
      break;
    default:
      cor = "bg-primary";
  }
  return cor;
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

      let cardSuperior = `<div class="col-5 mx-2">
                            <div class="card shadow" style="width: 25rem;">
                              <div class="card-body">
                                <h4 class="card-title">Semestre</h4>
                              </div>
                              <ul class="list-group list-group-flush">`;

      let cardInferior = `</ul>
                              <div class="card-body">
                                  <a href="#" class="card-link">Card link</a>
                                  <a href="#" class="card-link">Another link</a>
                              </div>
                          </div>
                        </div>`;

      for (cadeira in semestre.semestre) {
        let cadeirasDoSemestre = `<li class="list-group-item">
                                    <div class="mb-4">
                                      <span class="nome-cadeira">${
                                        semestre.semestre[cadeira].nome
                                      }</span>
                                    </div>
                                    <div>
                                      <span class="info-cadeira">${cadeira}</span>
                                      <span class="info-cadeira">${
                                        semestre.semestre[cadeira].cargaHoraria
                                      }hrs</span>
                                      <span class="info-cadeira info-cadeira-tipo ${temaCategoria(
                                        semestre.semestre[cadeira].categoria
                                      )}">${
          semestre.semestre[cadeira].categoria
        }</span>
                                      <span class="info-cadeira info-cadeira-trilha ${temaTrilha(
                                        semestre.semestre[cadeira].trilha
                                      )}">${
          semestre.semestre[cadeira].trilha
        }</span>
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
    dados.forEach((doc)=>{
      const usuario =  doc.data();
      indexNome.innerHTML = usuario.nome;
    })

  }
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
              categoria: "obrigatoria",
              descricao: "",
              conteudo: "",
              status: "",
              requisitos: [],
            },
            SMD0094: {
              nome: "Introdução a sistema de midias digitais",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "null",
              categoria: "obrigatoria",
              descricao: "",
              conteudo: "",
              status: "",
              requisitos: [],
            },
            SMD0091: {
              nome: "História do design",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "design",
              categoria: "obrigatoria",
              descricao: "",
              conteudo: "",
              status: "",
              requisitos: [],
            },
            SMD0089: {
              nome: "Desenho 1",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "audiovisual",
              categoria: "obrigatoria",
              descricao: "",
              conteudo: "",
              status: "",
              requisitos: [],
            },
            SMD0088: {
              nome: "Autoração multimídia 1",
              cargaHoraria: 64,
              creditos: 4,
              trilha: "design",
              categoria: "obrigatoria",
              descricao: "",
              conteudo: "",
              status: "",
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
        });
        signupForm.reset();

        
        //document.location.href = 'index.html';
      });
    } else {
      document.getElementById("mensagemAlerta").innerHTML = "Senhas diferentes";
    }
  });
}

// ------------------------- login na conta
const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // credenciais de login
    const email = loginForm["inputEmail"].value;
    const password = loginForm["inputPassword"].value;

    auth.signInWithEmailAndPassword(email, password).then((cred) => {
      document.location.href = "index.html";
    });
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
