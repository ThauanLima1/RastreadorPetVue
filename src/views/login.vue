<template>
  <div class="container">
    <div class="section-esquerda">
      <div class="form-login">
        <div class="logo">
          <img src="../assets/imgs/logo.svg" />
        </div>
        <h2>Bem vindo!</h2>
        <p>Logue com sua conta para continuar.</p>

        <button class="btn-google" @click="loginComGoogle">
          <img src="../assets/imgs/google.svg" />
          Logue com o Google
        </button>

        <div class="divisor">Ou</div>

        <form  @submit.prevent="fazerLogin">
          <div class="form-grupo">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="mariaeduarda@senai.com"
            />
            <label>Senha</label>
            <div class="wrapper-olho">
              <input
                v-model="senha"
                class="input sem-margem"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="123456"
              />
              <div class="icone-olho" @click="mostrarSenha = !mostrarSenha">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  class="olho"
                  :class="{ ativo: mostrarSenha }"
                  id="olho"
                  viewBox="0 0 16 16"
                  stroke-width="2"
                >
                  <path
                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"
                  />
                  <path
                    d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="esqueceu-senha">
            <a href="#" @click.prevent="mostrarConteudo = true"
              >Esqueceu a senha?</a
            >
          </div>

          <Botao type="submit">Entrar</Botao>
        </form>

        <div class="cadastro-link">
          Não tem uma conta ainda?
          <router-link to="/cademeupet/app/cadastro">Cadastre-se</router-link>
        </div>
      </div>
    </div>

    <div class="section-direita">
      <img src="@/assets/imgs/cachorro.jpg"/>
    </div>
  </div>

  <RecuperarSenha
    :visivel="mostrarConteudo"
    @fechar-janela="mostrarConteudo = false"
  />
</template>

<script setup>
import Botao from "@/components/botao.vue";
import RecuperarSenha from "@/components/recuperarSenha.vue";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config.js";

import { ref } from "vue";
import { useRouter } from "vue-router";

const rota = useRouter();

const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);
const mostrarConteudo = ref(false);

async function fazerLogin() {
  
  try {
    await signInWithEmailAndPassword(auth, email.value, senha.value);

    rota.push("/cademeupet/app/mapa");

  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
}

async function loginComGoogle() {

  try{
    await signInWithPopup(auth, googleProvider);

    rota.push("/cademeupet/app/mapa");
  }catch(error){
    console.error("Erro ao fazer login:", error);
  }
}

</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Sections */

.section-esquerda,
.section-direita {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.section-direita img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Formulario */

.form-login {
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo img {
  height: 5vh;
}

.form-login h2 {
  font-size: 2.2rem;
}

.form-login p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: var(--cinza);
}

.btn-google {
  width: 100%;
  height: 5vh;
  border: 1px solid #dadada;
  color: var(--cinza-escuro);
  padding: 0.6rem;
  border-radius: 1rem;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, border 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-google:hover {
  border: 1px solid var(--roxo);
}

.divisor {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 1rem;
}

.form-grupo {
  display: flex;
  flex-direction: column;
}

.form-grupo label {
  font-size: 1.1rem;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  color: var(--cinza-escuro);
}

.form-grupo .input {
  padding: 10px;
  height: 5vh;
  border-radius: 1rem;
  color: var(--cinza);
  margin-bottom: 2.5rem;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-grupo .input.sem-margem {
  margin-bottom: 0;
}

.form-grupo .input::placeholder {
  color: #b1b1b1;
}

.form-grupo .input:focus {
  outline: none;
  border: 1px solid var(--roxo);
}

.wrapper-olho {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
}

.wrapper-olho .input {
  width: 100%;
  padding-right: 40px;
  margin-bottom: 0;
}

.icone-olho {
  position: absolute;
  right: 15px;
  cursor: pointer;
  display: flex;
}

.olho {
  fill: #707070;
  transition: fill 0.3s;
}

.olho.ativo {
  fill: var(--roxo);
}

.esqueceu-senha {
  text-align: right;
}

.esqueceu-senha a {
  color: #4285f4;
  text-decoration: none;
  font-size: 1rem;
}

.cadastro-link {
  text-align: center;
  font-size: 1rem;
}

.cadastro-link a {
  color: #4285f4;
  text-decoration: none;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .section-direita {
    display: none;
  }

  .form-login {
    width: 100%;
    max-width: 100%;
  }
}
</style>
