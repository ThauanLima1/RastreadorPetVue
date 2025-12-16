<template>
  <div>
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
            class="form-control label"
          />
          <div class="valorRaio">{{ raioZona }}m</div>
        </div>
      </div>
    </div>

    <button class="add-geocercas" @click="ativarSelecaoNoMapa">Salvar</button>

    <button class="ver-zonas" @click="abrirZonasAtivas">Ver zonas</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useGeofences } from "@/composables/useGeofence";

const router = useRouter();

const { nomeZona, raioZona, corZona, visivelBarraGlobal, modoSelecao } =
  useGeofences();

const opcoesCores = [
  { valor: "#ff4d4d", hexa: "#ff4d4d", nome: "vermelho" },
  { valor: "#ff9f43", hexa: "#ff9f43", nome: "laranja" },
  { valor: "#2ecc71", hexa: "#2ecc71", nome: "verde" },
  { valor: "#3264fe", hexa: "#3264fe", nome: "azul" },
  { valor: "#5f1bff", hexa: "#5f1bff", nome: "roxo" },
];

function ativarSelecaoNoMapa() {
  if (!nomeZona.value || nomeZona.value.trim() === "") {
    alert("Digite um nome para sua zona!");
    return;
  }

  visivelBarraGlobal.value = false;
  modoSelecao.value = true;
}

function abrirZonasAtivas() {
  router.push({ name: "zonasAtivas" });
}
</script>

<style scoped>

p {
  font-weight: 500;
  color: var(--cinza);
}

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
  padding: 1rem 0 8rem 0;
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
  height: 1.4rem;
  align-items: center;
}

.valorRaio {
  background-color: #dddddd;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: var(--roxo);
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d4d4d4;
}

.add-geocercas {
  margin: 1rem 0;
  height: 5.4vh;
  width: 100%;
  background-color: var(--azul-escuro);
  color: var(--branco);
  font-weight: 500;
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
  height: 4.6vh;
  width: 100%;
  background-color: var(--branco);
  color: #150047;
  font-weight: 550;
  font-size: 1rem;

  background: linear-gradient(#ffffff) padding-box,
    linear-gradient(135deg, #141c41, #000e8b, #000000) border-box;
  border: 2px solid transparent;

  border-radius: 14px;
  transition: background-color 0.3s ease;
}
</style>
