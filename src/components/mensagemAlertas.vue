<template>
  <div  v-if="visivel" :class="alertClass" class="caixa-alerta">
    {{ mensagem }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'sucesso',
  },
  mensagem: {
    type: String,
    required: true,
  },
  visivel: {
    type: Boolean,
    default: true,
  },
});

const alertClass = computed(() => {
  return {
    'alerta-sucesso': props.type === 'sucesso',
    'alerta-erro': props.type === 'erro',
    'alerta-atencao': props.type === 'atencao',
    'alerta-logado': props.type === 'logado',
  };
});
</script>

<style scoped>

.caixa-alerta {
  position: fixed;
  top: 6.5rem;
  left: 50%;
  transform: translateX(-50%);
  height: auto;
  min-width: 250px;
  max-width: 500px;
  width: fit-content;
  padding: 0.3rem 2rem;
  z-index: 998;
  color: var(--branco);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
}


.alerta-sucesso {
  background-color: rgba(52, 168, 145, 0.9);
  border: 2px solid #34A891;
}
.alerta-erro {
  background-color: rgba(244, 67, 54, 0.9);
  border: 2px solid #f44336;
}
.alerta-atencao {
  background-color: rgba(255, 152, 0, 0.9);
  border: 2px solid #ff9800;
}
.alerta-logado {
  background-color: rgba(2, 7, 51, 0.9);
  border: 2px solid var(--azul-escuro);
}


@media (max-width: 940px) {

  .caixa-alerta {
    max-width: 85vw;
    min-width: 200px;
    white-space: normal;
    text-align: center;
  }
}
</style>
