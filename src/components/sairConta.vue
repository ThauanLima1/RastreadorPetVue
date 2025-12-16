<template>
  <div class="div-sair" @click="sairConta">
    <span><img src="../assets/imgs/sair.svg" />Sair</span>
  </div>

  <mensagemAlertas
    :visivel="mostrarAlerta"
    :type="alertaTipo"
    :mensagem="alertaMensagem"
  />
</template>

<script setup>
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { ref as vueRef } from "vue";
import mensagemAlertas from "@/components/mensagemAlertas.vue";

async function sairConta() {
  try {
    exibirAlerta("logado", `Saindo da conta...`);

    setTimeout(async () => {
      await signOut(auth);
    }, 500);
  } catch (error) {
    console.error("Erro ao sair:", error);
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
</script>

<style scoped>
.div-sair {
  display: flex;
  justify-content: center;
  height: 50px;
  background-color: #fad5d5;
  border-radius: 1rem;
  cursor: pointer;
  margin: 1rem 0;
}

.div-sair span {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff6070;
  font-weight: 500;
  font-size: 1.2rem;
  gap: 1rem;
}

.div-sair img {
  height: 20px;
  cursor: pointer;
}

.div-sair:active {
  transform: scale(0.98);
}
</style>
