<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visivel" class="wrapper-conteudo">
        <div class="fundo-conteudo"></div>

        <div class="conteudo">
          <img
            class="x"
            id="fecharConteudo"
            src="../assets/imgs/x.png"
            @click="fechar"
          />
          <div class="recuperar">
            <p>
              Preencha o e-mail da sua conta para receber o link de recuperação.
            </p>
            <input
              type="email"
              placeholder="mariaeduarda@senai.com"
              class="form-control label"
            />
            <Botao>Enviar</Botao>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import Botao from "@/components/botao.vue";

export default {
  name: "RecuperarSenha",
  components: {
    Botao,
  },

  props: {
    visivel: Boolean,
  },

  emits: ["fechar-janela"],

  methods: {
    fechar() {
      this.$emit("fechar-janela");
    },
  },
};
</script>

<style scoped>

.fundo-conteudo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.conteudo {
  max-height: 100vh;
  overflow-y: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  z-index: 1000;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.281);
  width: 80%;
  max-width: 550px;
}

.conteudo p {
  text-align: center;
  font-size: 1.4rem;
  padding: 1.7rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 500;
}

input {
  padding: 10px;
  height: 5vh;
  border-radius: 1rem;
  border: 1px solid #dadada;
  color: var(--cinza);
  margin-bottom: 2.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

input:focus {
  outline: none;
  border: 1px solid var(--roxo);
}

input::placeholder {
  color: #b1b1b1;
}

.recuperar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.x{
  position: absolute;
  top: 20px;
  right: 20px;
  width: 20px;
  height: auto;
  cursor: pointer;
}
</style>
