<template>
  <div class="menu-container">

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
  padding: 0.7rem 0.5rem;
  border-radius: 0.8rem;
  border: none;
  font-size: 1.5rem;
  background-color: #ececec;
  color: var(--cinza-escuro);
  cursor: pointer;
  transition: 0.2s ease all;
}

.menu-item:hover{
  background-color: var(--roxo);
  color: var(--branco);
}

</style>