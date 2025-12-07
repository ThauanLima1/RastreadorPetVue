<template>
  <div v-if="alertasAtivos.length > 0" class="alertas-persistentes">
    <div
      v-for="alerta in alertasAtivos"
      :key="alerta.zonaId"
      class="alerta-mini"
      :class="alerta.tipo"
      @click="expandirAlerta(alerta)"
    >
      <div class="alerta-mini-header">
        <span class="icone-alerta">
          {{ alerta.tipo === 'urgente' ? '🚨' : '⚠️' }}
        </span>
        <div class="alerta-mini-info">
          <strong>Pet fora da zona!</strong>
          <span class="zona-nome">{{ alerta.zona.nome }}</span>
        </div>
        <button class="btn-minimizar" @click.stop="minimizar(alerta.zonaId)">
          ×
        </button>
      </div>
      
      <div class="alerta-mini-detalhes">
        <div class="tempo-fora">
          <span class="label">Tempo fora:</span>
          <span class="valor">{{ formatarTempoFora(alerta.inicioTimestamp) }}</span>
        </div>
        <div class="distancia-info">
          <span class="label">Distância:</span>
          <span class="valor destaque">{{ alerta.distanciaFora }}m</span>
        </div>
      </div>

      <div class="barra-progresso">
        <div 
          class="barra-fill" 
          :style="{ width: calcularUrgencia(alerta.distanciaFora) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref as vueRef, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  alertasAtivos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['expandir', 'minimizar'])

const tempoAtual = vueRef(Date.now())
let intervalo = null

onMounted(() => {
  intervalo = setInterval(() => {
    tempoAtual.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

function formatarTempoFora(inicioTimestamp) {
  const diferenca = tempoAtual.value - inicioTimestamp
  const minutos = Math.floor(diferenca / 60000)
  const horas = Math.floor(diferenca / 3600000)

  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `${minutos} min`
  return `${horas}h ${minutos % 60}min`
}

function calcularUrgencia(distancia) {
  if (distancia < 50) return 30
  if (distancia < 100) return 50
  if (distancia < 200) return 70
  return 100
}

function expandirAlerta(alerta) {
  emit('expandir', alerta)
}

function minimizar(zonaId) {
  emit('minimizar', zonaId)
}
</script>

<style scoped>
.alertas-persistentes {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
}

.alerta-mini {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #ff9800;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease;
}

.alerta-mini.urgente {
  border-left-color: #f44336;
  box-shadow: 0 4px 20px rgba(244, 67, 54, 0.3);
}

.alerta-mini:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.alerta-mini-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.icone-alerta {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

.alerta-mini-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alerta-mini-info strong {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 2px;
}

.zona-nome {
  font-size: 0.8rem;
  color: #666;
}

.btn-minimizar {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-minimizar:hover {
  background: #f0f0f0;
  color: #333;
}

.alerta-mini-detalhes {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.tempo-fora, .distancia-info {
  display: flex;
  flex-direction: column;
}

.label {
  color: #999;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.valor {
  color: #333;
  font-weight: 600;
}

.valor.destaque {
  color: #f44336;
}

.barra-progresso {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.barra-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #f44336);
  transition: width 0.3s ease;
}

.alerta-mini.urgente .barra-fill {
  background: #f44336;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 640px) {
  .alertas-persistentes {
    right: 10px;
    bottom: 10px;
    max-width: calc(100vw - 20px);
  }
}
</style>