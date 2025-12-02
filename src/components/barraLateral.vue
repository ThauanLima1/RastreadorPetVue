<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visivel" class="wrapper-conteudo">
        <div class="fundo-conteudo"></div>

        <div class="barra-lateral">
          <div class="botao-voltar" @click="voltar">
            <img src="../assets/imgs/voltar.svg" />
            <span>Voltar</span>
          </div>
          <h3>{{ nome }}</h3>

          <div class="conteudo-dinamico">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visivel: Boolean,
  nome: String,
});

const emit = defineEmits(["update:visivel"], 'voltar');

function voltar() {
  emit('voltar');
}
</script>

<style scoped>
.wrapper-conteudo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.fundo-conteudo {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.barra-lateral {
  position: relative;
  width: 400px;
  height: 100vh;
  background: white;
  padding: 10px 20px;
}

.botao-voltar {
  display: flex;
  padding: 30px 0;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  gap: 10px;  
}

.botao-voltar img {
  height: 20px;
  width: auto;
}

.botao-voltar span {
  font-size: 1.5rem;
  font-weight: 600;
  color: #010a1b;
}

.barra-lateral h3 {
  padding: 20px 0 0 0;
  font-size: 2.5rem;
  background: linear-gradient(to right, #021230 30%, #d0cfff8a 75%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

@media (max-width: 768px){
  .barra-lateral{
    width: 100vw;
  }
}

.fade-enter-active .barra-lateral,
.fade-leave-active .barra-lateral {
  transition: transform 0.3s ease-out;
}

.fade-enter-from .barra-lateral,
.fade-leave-to .barra-lateral {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
