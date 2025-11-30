<template>
  <button class="botao">
    <slot></slot>
  </button>
</template>

<style scoped>
.botao {
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
</style>
