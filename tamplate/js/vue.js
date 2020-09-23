var iconeTrilha = function (nomeTrilha) {
  var out;
  switch (nomeTrilha) {
    case "sistemas":
      out = `<i class="fas fa-project-diagram"></i>`;
      break;
    case "design":
      out = `<i class="far fa-object-group"></i>`;
      break;
    case "audiovisual":
      out = `<i class="fas fa-play-circle"></i>`;
      break;
    case "jogos":
      out = `<i class="fas fa-gamepad"></i>`;
      break;
    default:
      out = "Valor inválido";
      break;
  }
  return out;
};
// componentes para a barra de icones das trilha na página inicial
Vue.component("icone-trilha", {
  props: ["trilha"],
  template: `<div class="icone-trilha icone-sistemas border rounded-circle" :style="{background-color: trilha.cor}">
      <span v-html="trilha.icone"></span>
    </div>`,
});

// app para a barra de icones das trilha na página inicial
var app = new Vue({
  el: "#icone-trilha",
  data: {
    trilhas: [
      { id: 0, icone: iconeTrilha("sistemas"), cor: "#34a853" },
      { id: 1, icone: iconeTrilha("design"), cor: "#fbbc04" },
      { id: 2, icone: iconeTrilha("audiovisual"), cor: "#4285f4" },
      { id: 3, icone: iconeTrilha("jogos"), cor: "#f33d29" },
    ],
    mensagem: "olá",
  },
});
