<template>
  <button class="botao" :disabled="disabled">
    <span v-if="!carregando"><slot></slot></span>
    <div v-else class="spinner"></div>
  </button>
</template>

<script setup>
defineProps({
  disabled: Boolean,
  carregando: Boolean
});
</script>

<style scoped>
.botao {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #10061a;
  color: white;
  padding: 1.2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.4s ease all;
  margin: 1rem 0 0.3rem 0;
}

.botao:hover {
  background-color: var(--preto);
}

.botao:active {
  transform: scale(0.98);
}


.botao:disabled {
  background: var(--preto);
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
