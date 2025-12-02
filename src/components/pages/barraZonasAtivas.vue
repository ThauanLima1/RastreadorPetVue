<template>
  <div class="gap"></div>
  <div class="div-zonas" v-if="zonasAtivas.length > 0">
    <ul v-for="(zona, index) in zonasAtivas" :key="zona.id || index">
      <li>
        <div class="topo-zonas">
          <div class="nome-cor">
            <span :style="{ backgroundColor: zona.cor }"></span>
            <h4>{{ zona.nome }}</h4>
          </div>
          <p>{{ zona.raio }}m</p>
        </div>
        <div class="baixo-zonas">
          <div class="coordenadas-excluir">
            <p>Lat: {{ zona.lat }} Lng: {{ zona.lng }}</p>
          </div>
          <img
            @click="excluirZona(zona.id)"
            src="../../assets/imgs/lixeira.svg"
            style="cursor: pointer"
          />
        </div>
      </li>
    </ul>
  </div>
  <div v-else class="sem-zonas">
    <p>Nenhuma zona ativa encontrada.</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGeofences } from '@/composables/useGeofence'

const { geofences, excluirZona } = useGeofences()

const zonasAtivas = computed(() => geofences.value)

const emit = defineEmits(['atualizar-nome-barra'])

onMounted(() => {
  emit('atualizar-nome-barra', 'Zonas ativas')
})

</script>

<style scoped>

.div-zonas {
  display: flex;
  flex-direction: column;
  max-height: 700px;
  scroll-behavior: smooth;
  overflow-y: auto;
}

.div-zonas::-webkit-scrollbar {
  width: 6px;
}

.div-zonas::-webkit-scrollbar-thumb {
  background-color: #e6e6e6;
  border-radius: 3px;
}

.div-zonas ul {
  list-style: none;
}

.div-zonas ul li {
  background-color: #f1f1f1;
  padding: 0.4rem 0.6rem;
  border-radius: 1.5rem;
  margin: 0 0 1.5rem 0;
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.24);
}

.gap {
  margin: 1rem;
}

.topo-zonas {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 3rem 0;
}

.nome-cor {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
}

.nome-cor h4 {
  color: var(--cinza-escuro);
  font-size: 1.4rem;
}
.topo-zonas p {
  color: var(--cinza);
  font-size: 1rem;
}

.nome-cor span {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.baixo-zonas {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coordenadas-excluir p {
  color: var(--cinza);
  font-size: 0.8rem;
}

.sem-zonas p {
  color: var(--cinza-escuro);
  font-size: 1.2rem;
}

</style>
