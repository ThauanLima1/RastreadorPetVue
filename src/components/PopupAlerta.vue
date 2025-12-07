<!-- components/PopupAlerta.vue -->
<template>
  <div v-if="visivel" class="popup-overlay" @click.self="fechar">
    <div class="popup-container">
      <div class="popup-header" :class="tipo">
        <h3>{{ titulo }}</h3>
        <button class="fechar-btn" @click="fechar">×</button>
      </div>
      
      <div class="popup-content">
        <p class="mensagem-principal">{{ mensagem }}</p>
        
        <div v-if="zonaInfo" class="zona-info">
          <div class="info-linha">
            <span class="icone">🎯</span>
            <div>
              <span class="label">Zona:</span>
              <span class="valor">{{ zonaInfo.nome }}</span>
            </div>
          </div>
          <div class="info-linha">
            <span class="icone">📏</span>
            <div>
              <span class="label">Distância:</span>
              <span class="valor distancia">{{ zonaInfo.distancia }}m fora da zona</span>
            </div>
          </div>
        </div>
        
        <div class="popup-acoes">
          <button class="btn-primario" @click="fechar">Entendido</button>
          <button v-if="mostrarBotaoMapa" class="btn-secundario" @click="irParaMapa">
            📍 Ver no Mapa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visivel: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    default: 'alerta', 
    validator: (value) => ['alerta', 'urgente', 'info'].includes(value)
  },
  titulo: {
    type: String,
    default: 'Alerta de Localização'
  },
  mensagem: {
    type: String,
    default: ''
  },
  zonaInfo: {
    type: Object,
    default: null
  },
  mostrarBotaoMapa: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['fechar', 'irParaMapa'])

const tipoCores = {
  alerta: '#ff9800',
  urgente: '#f44336',
  info: '#2196f3'
}

const corTipo = computed(() => tipoCores[props.tipo] || tipoCores.alerta)

function fechar() {
  emit('fechar')
}

function irParaMapa() {
  emit('irParaMapa')
  fechar()
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(3px);
}

.popup-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 420px;
  width: 90%;
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  color: white;
  font-weight: 600;
}

.popup-header.alerta {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.popup-header.urgente {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.popup-header.info {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.popup-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.fechar-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.fechar-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.popup-content {
  padding: 1.5rem;
}

.mensagem-principal {
  margin: 0 0 1.25rem;
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
}

.zona-info {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  padding: 1rem;
  border-radius: 12px;
  margin: 1rem 0 1.5rem;
  border-left: 4px solid v-bind(corTipo);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-linha {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.info-linha:last-child {
  margin-bottom: 0;
}

.icone {
  font-size: 1.5rem;
  line-height: 1;
}

.info-linha > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.valor {
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.valor.distancia {
  color: v-bind(corTipo);
  font-weight: 700;
  font-size: 1.1rem;
}

.popup-acoes {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primario,
.btn-secundario {
  flex: 1;
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primario {
  background: v-bind(corTipo);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primario:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-primario:active {
  transform: translateY(0);
}

.btn-secundario {
  background-color: #f5f5f5;
  color: #555;
  border: 2px solid #e0e0e0;
}

.btn-secundario:hover {
  background-color: #e8e8e8;
  border-color: #d0d0d0;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .popup-container {
    width: 95%;
    margin: 1rem;
  }

  .popup-header {
    padding: 1rem 1.25rem;
  }

  .popup-header h3 {
    font-size: 1.1rem;
  }

  .popup-content {
    padding: 1.25rem;
  }

  .popup-acoes {
    flex-direction: column;
  }

  .btn-primario,
  .btn-secundario {
    width: 100%;
  }
}
</style>