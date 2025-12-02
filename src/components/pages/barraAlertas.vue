<template>
    
  <div class="conteudo-filtro">
    <div
      v-for="(filtro, index) in filtros"
      class="filtro"
      :key="index"
      :class="[filtro.classe, { ativo: filtroSelecionado === filtro.nome }]"
      @click="selecionarFiltro(filtro)"
    >
      {{ filtro.nome }}
    </div>
  </div>

</template>

<script setup>

import { ref as vueRef } from "vue";

const filtroSelecionado = vueRef("Hoje");

const filtros = vueRef([
  { nome: "Hoje", classe: "filtro-hoje" },
  { nome: "Mês", classe: "filtro-mes" },
  { nome: "Todos", classe: "filtro-todos" },
]);

function selecionarFiltro(filtro) {
  filtroSelecionado.value = filtro.nome;
}

</script>
<style scoped>

.conteudo-filtro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
}

.filtro {
  background-color: var(--cinza-claro);
  padding: 0.6rem 2.2rem;
  border-radius: 0.6rem;
  color: var(--cinza-escuro);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.filtro.ativo {
  background-color: var(--roxo);
  color: var(--branco);
}

</style>
