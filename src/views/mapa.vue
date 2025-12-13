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
          <span v-if="estatisticasAlertas.naoVisualizados > 0" class="badge-alerta">
            {{ estatisticasAlertas.naoVisualizados }}
          </span>
        </a>
        <a class="nav-texto" @click="abrirBarra('historico')">Histórico</a>
      </div>

      <div class="div-config" @click="abrirBarra('configuracoes')">
        <span><img src="../assets/imgs/config.svg" /></span>
      </div>
    </div>
  </nav>

  <div class="popup">
    <div class="online">
      <span> </span>
      <p>Online</p>
    </div>
    <p>Lat: {{ posicaoAtual.lat.toFixed(6) }}</p>
    <p>Lng: {{ posicaoAtual.lng.toFixed(6) }}</p>
  </div>

  <div id="mapa" class="mapa"></div>

  <PopupAlerta
    :visivel="!!alertaAtivo"
    :tipo="alertaAtivo?.tipo || 'alerta'"
    :titulo="alertaAtivo?.titulo || ''"
    :mensagem="alertaAtivo?.mensagem || ''"
    :zonaInfo="alertaAtivo?.zonaInfo || null"
    :mostrarBotaoMapa="false"
    @fechar="fecharAlerta"
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
import { ref as vueRef, watch } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref as dbRef } from "firebase/database";

import { auth, database } from "@/firebase";
import marcadorIcone from "../assets/imgs/marcador.svg";
import barraLateral from "../components/barraLateral.vue";
import PopupAlerta from "../components/PopupAlerta.vue";
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
  modoSelecao
} = useGeofences();

const {
  alertaAtivo,
  estatisticasAlertas,
  criarAlerta,
  determinarNivelAlerta,
  devecriarAlerta,
  carregarHistoricoAlertas,
  fecharAlerta
} = useAlertas();

const usuarioId = vueRef(null);

async function verificarAlertas(posicaoAtual, petNome = "Seu pet") {
  if (!usuarioId.value) {
    console.log("Usuário não identificado");
    return null;
  }

  const { dentroDeAlgumaZona, alertasDetectados } = verificarDentroZona(posicaoAtual);

  if (alertasDetectados.length === 0) {
    return null;
  }

  for (const alertaInfo of alertasDetectados) {
    const { zona, distanciaForaZona } = alertaInfo;
    
    if (!devecriarAlerta(zona.id)) {
      console.log(`Alerta da zona ${zona.nome} em cooldown`);
      continue;
    }

    const nivelAlerta = determinarNivelAlerta(distanciaForaZona);
    
    if (nivelAlerta) {
      const alerta = await criarAlerta({
        petNome,
        zona,
        nivelAlerta,
        distanciaForaZona,
        localizacao: posicaoAtual
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
  historico: "Histórico"
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
      scaledSize: new google.maps.Size(30, 30),
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

        modoSelecao.value = false;
        raioZona.value = 50;
        nomeZona.value = "";

        alert("Zona salva com sucesso!");
      } catch (error) {
        console.log("Erro ao salvar a zona", error);
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

        if (!resultado.dentroDeAlgumaZona && resultado.alertasDetectados.length > 0) {
          console.log("🚨 Pet fora da zona! Criando alerta...");
          await verificarAlertas(posicaoAtual.value, "Seu Pet");
        }
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

watch(
  geofences,
  (listaAtualizada) => {
    if (!mapaGoogle) return;
    limparDesenhos();
    listaAtualizada.forEach((dadosDaCerca) => {
      desenharCirculoNoMapa(dadosDaCerca);
    });
  },
  { deep: true }
);

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
  font-size: 1.2rem;
  font-weight: 500;
  padding: 5px 15px;
  text-decoration: none;
  color: #010a1b;
  transition: all 0.5s ease;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-texto:hover {
  background-color: #ffffff;
  color: #020733cb;
}

.badge-alerta {
  background: linear-gradient(135deg, #ff9800, #f44336);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
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
  bottom: 50px;
  right: 50px;
  height: auto;
  width: 250px;
  padding: 0.7rem 0.7rem 0 0.7rem;
  z-index: 998;
  border-radius: 1rem;
  background: linear-gradient(white 0%, white 70%) padding-box,
    linear-gradient(-90deg, #e0e0e0, hsla(226, 100%, 90%, 0.58)) border-box;
}

.online {
  display: flex;
  align-items: center;
  padding: 0 0 1rem 0;
  gap: 0.7rem;
}

.online span {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: #1aeb9b;
}

.popup p {
  padding: 0 0 0.7rem 0;
  color: var(--cinza);
  font-size: 0.8rem;
}

.online p {
  padding: 0;
  color: var(--cinza-escuro);
  font-size: 1.1rem;
  font-weight: 600;
}

@media (max-width: 940px) {
  .nav-links {
    display: none;
  }

  .popup {
    width: 80%;
  }
}
</style>