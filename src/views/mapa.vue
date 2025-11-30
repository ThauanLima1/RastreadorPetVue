<template>
  <nav class="nav-bar">
    <div class="conteudo">
      <div class="div-logo">
        <img src="../assets/imgs/logo.svg" class="logo" />
      </div>

      <div class="nav-links">
        <a class="nav-texto">Mapa</a>
        <a class="nav-texto" @click="abrirBarra('pets')">Pets</a>
        <a class="nav-texto" @click="abrirBarra('geofences')">Geofences</a>
        <a class="nav-texto" @click="abrirBarra('historico')">Histórico</a>
      </div>

      <div class="div-config">
        <span @click="abrirBarra('config')"
          ><img src="../assets/imgs/config.svg"
        /></span>
        <span @click="sairConta"><img src="../assets/imgs/sair.svg" /></span>
      </div>
    </div>
  </nav>
  <div id="mapa" class="mapa"></div>

  <barraLateral
    v-model:visivel="visivelBarra"
    :nome="nomeBarra"
    @voltar="gerenciarVoltar"
  >
    <div v-if="conteudoBarra === 'pets'">
      <h3>Lista de Pets</h3>
      <p>Carregando pets...</p>
    </div>

    <div v-show="conteudoBarra === 'geofences'">
      <p>Clique no mapa para definir o centro da zona segura.</p>
      <div class="entrada-grupo">
        <div class="entrada-nome">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Casa, Parque, Trabalho"
            v-model="nomeZona"
            class="form-control label"
          />
        </div>
        <div class="seletorCor">
          <label>Cor da área</label>
          <div class="conteudo-cores">
            <div
              v-for="cor in opcoesCores"
              :key="cor.valor"
              class="cores"
              :style="{ backgroundColor: cor.hexa }"
              :class="{ selecionada: corZona === cor.valor }"
              @click="corZona = cor.valor"
            ></div>
          </div>
        </div>
        <div class="entrada-raio">
          <label>Raio</label>
          <div class="conteudo-raio">
            <input
              type="range"
              v-model="raioZona"
              min="100"
              max="500"
              step="50"
              value="50"
              class="form-control label"
              :style="estiloSlider"
            />
            <div class="valorRaio">{{ raioZona }}m</div>
          </div>
        </div>
      </div>
      <button class="add-geocercas" @click="selecionarLocal">Adicionar</button>
      <button class="ver-zonas" @click="abrirBarra('zonasAtivas')">
        Zonas ativas
      </button>
    </div>

    <div v-if="conteudoBarra === 'zonasAtivas'"></div>

    <div v-if="conteudoBarra === 'historico'">
      <h3>Histórico de Movimentação</h3>
    </div>

    <div v-if="conteudoBarra === 'config'">
      <h3>Configurações da Conta</h3>
    </div>
  </barraLateral>
</template>

<script setup>
import { database, auth } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, ref as dbRef } from "firebase/database";

import { ref as vueRef, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

import marcadorIcone from "../assets/imgs/marcador.svg";
import barraLateral from "../components/barraLateral.vue";
import { useGeofences } from "../composables/useGeofence";

const { geofences, carregarGeofences, salvarGeofences } = useGeofences();
const rota = useRouter();

//Sair da conta

async function sairConta() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
}

//Ver se o usuario está logado

let usuarioId = vueRef(null);
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioId = user.uid;
    console.log("Usuário autenticado:", usuarioId);

    if (!mapaGoogle) iniciarMapa();

    carregarGeofences(user.uid);
  } else {
    console.log("Usuário não autenticado");
    if (mapaGoogle) destruirMapa();
    rota.push("/cademeupet/app/login");
  }
});

//Barra Lateral

const visivelBarra = vueRef(false);
const conteudoBarra = vueRef("");
const nomeBarra = vueRef("");

function abrirBarra(tipo) {
  conteudoBarra.value = tipo;

  if (tipo === "pets") nomeBarra.value = "Pets";
  if (tipo === "geofences") nomeBarra.value = "Geofences";
  if (tipo === "historico") nomeBarra.value = "Histórico";
  if (tipo === "config") nomeBarra.value = "Configurações";
  if (tipo === "zonasAtivas") nomeBarra.value = "Zonas ativas";

  visivelBarra.value = true;
}

function gerenciarVoltar() {
  if (conteudoBarra.value === "zonasAtivas") {
    conteudoBarra.value = "geofences";
    nomeBarra.value = "Geofences";

    return;
  }

  visivelBarra.value = false;
}

//Mapa Google Maps

let mapaGoogle = null;
let marcador;
let mapaPronto = vueRef(false);

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

  mapaGoogle.addListener("click", async (evento) => {
    if (modoSelecao.value === true) {
      const lat = evento.latLng.lat();
      const lng = evento.latLng.lng();

      try {
        await salvarGeofences(
          lat,
          lng,
          Number(raioZona.value),
          nomeZona.value,
          corZona.value
        );

        modoSelecao.value = false;
        Number(raioZona.value);
        corZona.value;
        nomeZona.value = "";

        alert("Zona salva com sucesso!");
      } catch (error) {
        console.log("Erro ao salvar a zona", error);
      }
    }
  });

  const localizacaoRef = dbRef(database, "localizacao_atual");
  onValue(localizacaoRef, (snapshot) => {
    if (mapaPronto && snapshot.val()?.lat) {
      const novaPos = { lat: snapshot.val().lat, lng: snapshot.val().lng };
      marcador.setPosition(novaPos);
      mapaGoogle.setCenter(novaPos);
    }
  });
}

function destruirMapa() {
  if (mapaGoogle) {
    document.getElementById("mapa").innerHTML = "";
    mapaGoogle = null;
  }
}

// Circulo para geofences

function limparDesenhos() {
  geofenceCirculo.value.forEach((circulo) => circulo.setMap(null));
  geofenceCirculo.value = [];
}

function desenharCirculoNoMapa(cercaDados) {
  const corDaCerca = cercaDados.cor;
  if (!mapaGoogle) return;

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
    limparDesenhos();

    listaAtualizada.forEach((dadosDaCerca) => {
      desenharCirculoNoMapa(dadosDaCerca);
    });
  },
  { deep: true }
);

onMounted(() => {
  iniciarMapa();
});

// Geofences

let geofenceCirculo = vueRef([]);
const nomeZona = vueRef("");
const raioZona = vueRef(50);
const modoSelecao = vueRef(false);
const corZona = vueRef("#3264fe");

const opcoesCores = [
  { valor: "#ff4d4d", hexa: "#ff4d4d", nome: "vermelho" },
  { valor: "#ff9f43", hexa: "#ff9f43", nome: "laranja" },
  { valor: "#2ecc71", hexa: "#2ecc71", nome: "verde" },
  { valor: "#3264fe", hexa: "#3264fe", nome: "azul" },
  { valor: "#5f1bff", hexa: "#5f1bff", nome: "roxo" },
];

function selecionarLocal() {
  visivelBarra.value = false;
  modoSelecao.value = true;
}
</script>

<style scoped>
/* Mapa */

.mapa {
  width: 100%;
  height: 100vh;
  border: none;
}

/* NavBar */

.conteudo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.nav-bar {
  position: fixed;
  padding: 0.8rem 2rem;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 997;
  width: 80%;
  border-radius: 60px;
  background: linear-gradient(white 0%, white 70%) padding-box,
    linear-gradient(-90deg, #e0e0e0, #b4b9fd94) border-box;
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
}

.nav-texto:hover {
  background-color: #ffffff;
  color: #020733cb;
}

.div-config {
  display: flex;
  gap: 1.5rem;
}

.div-config img {
  height: 25px;
  cursor: pointer;
}

/* Geofences */

.entrada-grupo {
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
}

.entrada-nome {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem 0 0.5rem 0;
}

input {
  padding: 10px;
  height: 5.2vh;
  border-radius: 1rem;
  color: var(--cinza);
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.entrada-nome input::placeholder {
  color: var(--cinza);
  font-weight: 500;
}

.entrada-nome input:focus {
  outline: none;
  border: 1px solid #5f1bff;
}

label {
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 3px;
  color: var(--cinza-escuro);
}

.seletorCor {
  padding: 2rem 0;
}

.conteudo-cores {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.cores {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.cores:hover {
  transform: scale(1.1);
}

.cores.selecionada {
  transform: scale(1.05);
  box-shadow: 0 0 0 1px white, 0 0 0 3px #5f1bff;
}

.entrada-raio {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 1rem 0 5rem 0;
}

.entrada-raio input {
  width: 80%;
  accent-color: var(--roxo);
  padding: 0;
  background-color: transparent;
}
.entrada-raio input:hover {
  opacity: 0.8;
}

.conteudo-raio {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.valorRaio {
  background-color: #dddddd;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: var(--roxo);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-geocercas {
  margin: 1rem 0;
  height: 5.4vh;
  width: 100%;
  background-color: var(--cinza-escuro);
  color: var(--gelo);
  font-weight: 600;
  font-size: 1.2rem;
  border: none;
  border-radius: 15px;
  transition: background-color 0.3s ease;
}

.add-geocercas:hover,
.ver-zonas:hover {
  cursor: pointer;
}

.add-geocercas:active,
.ver-zonas:active {
  transform: scale(0.98);
}

.ver-zonas {
  height: 4.4vh;
  width: 100%;
  background-color: var(--gelo);
  color: var(--azul-claro);
  font-weight: 550;
  font-size: 1rem;
  border: none;
  border-radius: 14px;
  transition: background-color 0.3s ease;
}


@media (max-width: 940px) {
  .nav-links {
    display: none;
  }
}
</style>
