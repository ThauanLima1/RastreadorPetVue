<template>
  <div class="div-sair" @click="sairConta">
    <span><img src="../assets/imgs/sair.svg" />Sair</span>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase';

async function sairConta() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
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
