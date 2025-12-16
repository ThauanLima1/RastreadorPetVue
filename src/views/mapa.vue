<template>
  <nav class="nav-bar">
    <div class="conteudo">
      <div class="div-logo" @click="abrirMenu">
        <img src="../assets/imgs/logo.svg" class="logo" />
      </div>

      <div class="nav-links">
        <a class="nav-texto" @click="centralizarMapa">Mapa</a>
        <a class="nav-texto" @click="abrirBarra('pets')">Pets</a>
        <a class="nav-texto" @click="abrirBarra('geofences')">Geofences</a>
        <a class="nav-texto" @click="abrirBarra('alertas')">
          Alertas
        <span
          v-if="estatisticasAlertas.naoVisualizados > 0"
          class="badge-alerta"
        ></span>
         </a>
        <a class="nav-texto" @click="abrirBarra('historico')">Históricos</a>
      </div>

      <div class="div-config" @click="abrirBarra('configuracoes')">
        <span><img src="../assets/imgs/config.svg" /></span>
      </div>
    </div>
  </nav>

  <div class="popup" :class="popupStatusClass">
    <div class="online">
      <span></span>
      <p>Online</p>
    </div>

    <div class="localizacao">
      <img src="@/assets/imgs/localizacao-cinza.svg">
      <p>Lat: {{ posicaoAtual.lat.toFixed(4) }}</p>
      <p>Lng: {{ posicaoAtual.lng.toFixed(4) }}</p>
    </div>
  </div>

  <div id="mapa" class="mapa"></div>

  <mensagemAlertas
    :visivel="mostrarAlerta"
    :type="alertaTipo"
    :mensagem="alertaMensagem"
  />

  <barraLateral
    v-model:visivel="visivelBarra"
    :nome="nomeBarra"
    @voltar="gerenciarVoltar"
  >
    <router-view @abrir="abrirBarra" @fechar-barra="visivelBarra = false" />
  </barraLateral>
</template>

<script setup>
import { ref as vueRef, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref as dbRef } from "firebase/database";

import { auth, database } from "@/firebase";
import marcadorIcone from "../assets/imgs/marcador.svg";
import barraLateral from "../components/barraLateral.vue";
import mensagemAlertas from "@/components/mensagemAlertas.vue";
import { useGeofences } from "../composables/useGeofence";
import { useAlertas } from "../composables/useAlertas";

const router = useRouter();

const {
  geofences,
  carregarGeofences,
  salvarGeofences,
  verificarDentroZona,
  visivelBarraGlobal,
  nomeZona,
  raioZona,
  corZona,
  modoSelecao,
  registrarCallbackZonaAdicionada,
} = useGeofences();

const {
  alertaAtivo,
  estatisticasAlertas,
  criarAlerta,
  determinarNivelAlerta,
  devecriarAlerta,
  carregarHistoricoAlertas,
} = useAlertas();

const ultimoEstadoZona = vueRef(null);
const zonaAtual = vueRef(null);
const usuarioId = vueRef(null);
const nivelCritico = vueRef(false);

//Popup

const popupStatusClass = computed(() => {
  if (ultimoEstadoZona.value === null) return "popup-neutro";

  if (ultimoEstadoZona.value) return "popup-seguro";

  if (nivelCritico.value) return "popup-critico";
  
  return "popup-alerta";
});


async function verificarAlertas(posicaoAtual, petNome = "Seu pet") {
  if (!usuarioId.value) {
    console.log("Usuário não identificado");
    return null;
  }

  const {
    dentroDeAlgumaZona,
    alertasDetectados,
    zonaAtual: zonaDetectada,
  } = verificarDentroZona(posicaoAtual);


  if (dentroDeAlgumaZona) {
   
    if (ultimoEstadoZona.value === false || ultimoEstadoZona.value === null) {
      if (zonaDetectada) {
        exibirAlerta("sucesso", `${zonaDetectada.nome}`);
      }
    }
    
    ultimoEstadoZona.value = true;
    nivelCritico.value = false;
    zonaAtual.value = zonaDetectada;
    

    return null;
  }

  if (!dentroDeAlgumaZona && ultimoEstadoZona.value === true) {
    if (zonaAtual.value) {
      exibirAlerta("atencao", `Saiu de: ${zonaAtual.value.nome}`);
    }
    ultimoEstadoZona.value = false;
    nivelCritico.value = false;
    zonaAtual.value = null;
  }

  if (ultimoEstadoZona.value === null) {
    ultimoEstadoZona.value = dentroDeAlgumaZona;
    zonaAtual.value = zonaDetectada;

    if (dentroDeAlgumaZona && zonaDetectada) {
      exibirAlerta("logado", `Pet em: ${zonaDetectada.nome}`);
      nivelCritico.value = false;
    }
  }


  if (alertasDetectados.length === 0) {
    nivelCritico.value = false;
    return null;
  }


  for (const alertaInfo of alertasDetectados) {
    const { zona, distanciaForaZona } = alertaInfo;

    if (!devecriarAlerta(zona.id)) {
      continue;
    }

    const nivelAlerta = determinarNivelAlerta(distanciaForaZona);

    if (nivelAlerta) {
      if (distanciaForaZona > 201) {
        nivelCritico.value = true;
        exibirAlerta(
          "erro",
          `Seu pet está ${Math.round(distanciaForaZona)}m fora da zona.`
        );
      } else if (distanciaForaZona > 20) {
        nivelCritico.value = false;
        exibirAlerta(
          "atencao",
          `Seu pet está ${Math.round(distanciaForaZona)}m fora da zona.`
        );
      } else {
        nivelCritico.value = false;
      }

      const alerta = await criarAlerta({
        petNome,
        zona,
        nivelAlerta,
        distanciaForaZona,
        localizacao: posicaoAtual,
      });

      if (alerta && !alertaAtivo.value) {
        alertaAtivo.value = alerta;
      }

      return alerta;
    }
  }

  return null;
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioId.value = user.uid;
    await carregarGeofences(user.uid);
    await carregarHistoricoAlertas(user.uid);

    console.log("Geofences carregadas:", geofences.value);
    if (!mapaGoogle) iniciarMapa();
  } else {
    usuarioId.value = null;
    if (mapaGoogle) destruirMapa();
    router.push("/app/login");
  }
});


const visivelBarra = vueRef(false);
const nomeBarra = vueRef("");

const labelsBarra = {
  pets: "Pets",
  configuracoes: "Configurações",
  alertas: "Alertas",
  zonasAtivas: "Zonas ativas",
  geofences: "Geofences",
  menu: "Menu",
  historico: "Históricos",
};

function abrirBarra(tipo) {
  nomeBarra.value = labelsBarra[tipo] || "";
  visivelBarra.value = true;

  const arrayRotas = [
    "pets",
    "configuracoes",
    "alertas",
    "menu",
    "zonasAtivas",
    "geofences",
    "historico",
  ];

  if (arrayRotas.includes(tipo)) {
    console.log(nomeBarra.value);
    router.push({ name: tipo });
  }
}

function gerenciarVoltar() {
  const rotaAtual = router.currentRoute.value.name;

  if (
    isMobile() &&
    (rotaAtual === "pets" ||
      rotaAtual === "geofences" ||
      rotaAtual === "alertas")
  ) {
    nomeBarra.value = labelsBarra.menu;
    router.push({ name: "menu" });
    return;
  }

  visivelBarra.value = false;
  router.push("/app/mapa");
}

function abrirMenu() {
  if (!isMobile()) return;
  abrirBarra("menu");
}

watch(
  () => router.currentRoute.value.name,
  (novaRota) => {
    if (novaRota && labelsBarra[novaRota]) {
      nomeBarra.value = labelsBarra[novaRota];
    }
  }
);

watch(visivelBarra, (v) => {
  visivelBarraGlobal.value = v;
});

watch(visivelBarraGlobal, (v) => {
  visivelBarra.value = v;
});

let mapaGoogle = null;
let marcador;
const mapaPronto = vueRef(false);
const posicaoAtual = vueRef({
  lat: 0,
  lng: 0,
});

function iniciarMapa() {
  const pos = { lat: -12.9714, lng: -38.5014 };

  mapaGoogle = new google.maps.Map(document.getElementById("mapa"), {
    zoom: 16,
    center: pos,
  });

  marcador = new google.maps.Marker({
    position: pos,
    map: mapaGoogle,
    icon: {
      url: marcadorIcone,
      scaledSize: new google.maps.Size(25, 25),
    },
  });
  mapaPronto.value = true;

  if (geofences.value.length > 0) {
    limparDesenhos();
    geofences.value.forEach((dadosDaCerca) => {
      desenharCirculoNoMapa(dadosDaCerca);
    });
  }

  mapaGoogle.addListener("click", async (evento) => {
    if (modoSelecao.value === true) {

      modoSelecao.value = false;

      const lat = parseFloat(evento.latLng.lat().toFixed(8));
      const lng = parseFloat(evento.latLng.lng().toFixed(8));

      try {
        await salvarGeofences(
          lat,
          lng,
          Number(raioZona.value),
          nomeZona.value,
          corZona.value,
          usuarioId.value
        );

        
        raioZona.value = 50;
        nomeZona.value = "";

        exibirAlerta("sucesso", "Zona criada com sucesso!");
      } catch (error) {
        console.log("Erro ao salvar a zona", error);
        exibirAlerta("erro", "Erro ao criar zona.");
        modoSelecao.value = false;
      }
    }
  });

const localizacaoRef = dbRef(database, "localizacao_atual");
onValue(localizacaoRef, async (snapshot) => {
  const dados = snapshot.val();

  if (mapaPronto.value && dados && dados.lat && dados.lng) {
    posicaoAtual.value = {
      lat: dados.lat,
      lng: dados.lng,
    };

    marcador.setPosition({
      lat: posicaoAtual.value.lat,
      lng: posicaoAtual.value.lng,
    });
    mapaGoogle.setCenter({
      lat: posicaoAtual.value.lat,
      lng: posicaoAtual.value.lng,
    });

    if (geofences.value.length > 0) {
      const resultado = verificarDentroZona(posicaoAtual.value);
      console.log("Verificação de zona:", resultado);

      await verificarAlertas(posicaoAtual.value, "Seu pet");
    }
  }
});

}

function destruirMapa() {
  if (mapaGoogle) {
    document.getElementById("mapa").innerHTML = "";
    mapaGoogle = null;
  }
}

function centralizarMapa() {
  visivelBarra.value = false;

  if (marcador && marcador.getPosition()) {
    const pos = marcador.getPosition();
    mapaGoogle.setCenter({ lat: pos.lat(), lng: pos.lng() });
    mapaGoogle.setZoom(16);
  }
}

const mostrarAlerta = vueRef(false);
const alertaTipo = vueRef("sucesso");
const alertaMensagem = vueRef("");

function exibirAlerta(tipo, mensagem, duracao = 3000) {
  alertaTipo.value = tipo;
  alertaMensagem.value = mensagem;
  mostrarAlerta.value = true;

  setTimeout(() => {
    mostrarAlerta.value = false;
  }, duracao);
}


const geofenceCirculo = vueRef([]);

function limparDesenhos() {
  geofenceCirculo.value.forEach((circulo) => circulo.setMap(null));
  geofenceCirculo.value = [];
}

function desenharCirculoNoMapa(cercaDados) {
  if (!mapaGoogle) return;

  const corDaCerca = cercaDados.cor;

  const novoCirculo = new google.maps.Circle({
    strokeColor: corDaCerca,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: corDaCerca,
    fillOpacity: 0.15,
    map: mapaGoogle,
    center: { lat: cercaDados.lat, lng: cercaDados.lng },
    radius: cercaDados.raio,
  });

  geofenceCirculo.value.push(novoCirculo);
}

registrarCallbackZonaAdicionada(async () => {
    setTimeout(async () => {
    if (posicaoAtual.value && posicaoAtual.value.lat !== 0) {
      await verificarAlertas(posicaoAtual.value, "Seu pet");
    }
  }, 1000);
});

watch(geofences, () => {
  if (mapaGoogle) {
    limparDesenhos();
    geofences.value.forEach(desenharCirculoNoMapa);
  }
});

function isMobile() {
  return window.innerWidth <= 940;
}



</script>

<style scoped>
.mapa {
  width: 100%;
  height: 100vh;
  border: none;
}

.conteudo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nav-bar {
  position: fixed;
  padding: 0.8rem 2rem;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 997;
  width: 80%;
  border-radius: 1.8rem;
  background: linear-gradient(white 0%, white 70%) padding-box,
    linear-gradient(-90deg, #e0e0e0, hsla(226, 100%, 90%, 0.58)) border-box;
  border: 2px solid transparent;
}

.logo {
  height: 40px;
  margin-left: 0.8rem;
}

.nav-texto {
  font-size: 1.3rem;
  font-weight: 500;
  padding: 5px 15px;
  text-decoration: none;
  color: #010a1b;
  transition: all 0.5s ease;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.nav-texto:hover {
  background-color: #ffffff;
  color: #020733cb;
}

.badge-alerta {
  position: relative;
  width: 8px;
  height: 8px;
  top: 5%;
  border-radius: 50%;
  background: linear-gradient(135deg, #02082b, var(--azul-escuro));
  animation: pulse 3s infinite;
  flex-shrink: 0;
  margin-bottom: 7px;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(88, 126, 253, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(255, 152, 0, 0);
  }
}

.div-config {
  display: flex;
  justify-content: center;
  border-radius: 1rem;
}

.div-config img {
  height: 25px;
  cursor: pointer;
  transition: transform 0.5s ease;
}

.div-config img:hover {
  transform: rotate(20deg);
}

.div-menu {
  display: none;
}

.popup {
  position: fixed;
  bottom: 20px;
  right: 50%;
  transform: translate(50%);
  height: auto;
  max-width: 450px;
  width: 100%;
  padding: 1rem 1.5rem;
  z-index: 998;
  border-radius: 1.5rem;
  background: linear-gradient(white 0%, white 70%) padding-box,
    linear-gradient(-90deg, #e0e0e0, hsla(226, 100%, 90%, 0.58)) border-box;
  border: 2px solid transparent;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.online,
.localizacao {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.popup span {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: #34a891;
}

.popup p {
  padding: 0;
  color: var(--cinza-escuro);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cinza);
}

.localizacao p {
  color: var(--cinza);
  font-size: 0.85rem;
  font-weight: 600;
}
.localizacao img{
  width: 11px;
  height: auto;
}
.popup-seguro {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(120deg, #ffffff, #ffffff, #34a891) border-box;
  border: 2px solid transparent;
}

.popup-alerta {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(120deg, #ffffff, #ffffff, #ff7b00) border-box;
  border: 2px solid transparent;

}

.popup-critico {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(120deg, #ffffff, #ffffff, #cf0000) border-box;
  border: 2px solid transparent;

}

.popup-neutro {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #e0e0e0, #bdbdbd) border-box;
  border: 2px solid transparent;
}

@keyframes pulse-border {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
  }
}

@media (max-width: 940px) {
  .nav-links {
    display: none;
  }

  .popup {
    width: 70%;
  }

  .localizacao p {
    font-size: 0.8rem;
  }
}
</style>
