<template>
  <div class="menu-container">
    <h2 class="menu-titulo">Menu</h2>

    <div class="menu-itens">
      <button class="menu-item" @click="abrir('pets')">
        Pets
      </button>

      <button class="menu-item" @click="abrir('geofences')">
        Geofences
      </button>

      <button class="menu-item" @click="abrir('alertas')">
        Alertas
      </button>

      <button class="menu-item" @click="abrir('configuracoes')">
        Configurações
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['abrir'])

function abrir(tipo) {
  emit('abrir', tipo)
}

</script>

<style scoped>

.menu-itens {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.menu-item{
  display: block;
  width: 100%;
  text-align: left;
  padding: 0;
  border-radius: 0.8rem;
}

</style>