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

        <form @submit.prevent="fazerLogin">
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
                <i
  class="bi"
  :class="mostrarSenha ? 'bi-eye-fill olho ativo' : 'bi-eye olho'"
></i>

              </div>
            </div>
            <div v-if="mensagemErro" class="mensagem-erro">
              {{ mensagemErro }}
            </div>
          </div>

          <div class="esqueceu-senha">
            <a href="#" @click.prevent="mostrarConteudo = true"
              >Esqueceu a senha?</a
            >
          </div>

          <Botao type="submit" :disabled="carregando" :carregando="carregando"
            >Entrar</Botao
          >
        </form>

        <div class="cadastro-link">
          Não tem uma conta ainda?
          <router-link to="/app/cadastro">Cadastre-se</router-link>
        </div>
      </div>
    </div>

    <div class="section-direita">
      <img src="@/assets/imgs/cachorro.jpg" />
    </div>
  </div>

  <mensagemAlertas
    :visivel="mostrarAlerta"
    :type="alertaTipo"
    :mensagem="alertaMensagem"
  />

  <RecuperarSenha
    :visivel="mostrarConteudo"
    @fechar-janela="mostrarConteudo = false"
  />
</template>

<script setup>
import Botao from "@/components/botao.vue";
import RecuperarSenha from "@/components/recuperarSenha.vue";
import mensagemAlertas from "@/components/mensagemAlertas.vue";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/index.js";

import { ref as vueRef } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = vueRef("");
const senha = vueRef("");
const mostrarSenha = vueRef(false);
const mostrarConteudo = vueRef(false);
const carregando = vueRef(false);
const mensagemErro = vueRef("");

async function fazerLogin() {
  carregando.value = true;
  mensagemErro.value = "";
  
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );

    exibirAlerta("logado", `Autenticado como ${userCredential.user.email}`);

    setTimeout(() => {
      router.push("/app/mapa");
    }, 2000);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    mensagemErro.value = "Email ou senha incorretos!";
  } finally {
    carregando.value = false;
  }
}

async function loginComGoogle() {
  carregando.value = true;
  mensagemErro.value = "";
  
  try {
    const result = await signInWithPopup(auth, googleProvider);

    exibirAlerta("logado", `Autenticado como ${result.user.email}`);

    setTimeout(() => {
      router.push("/app/mapa");
    }, 2000);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    mensagemErro.value = "Erro ao fazer login com Google!";
  } finally {
    carregando.value = false;
  }
}

const mostrarAlerta = vueRef(false);
const alertaTipo = vueRef("sucesso");
const alertaMensagem = vueRef("");

function exibirAlerta(tipo, mensagem, duracao = 3000) {
  alertaTipo.value = tipo;
  alertaMensagem.value = mensagem;
  mostrarAlerta.value = true;

  setTimeout(() => {
    mostrarAlerta.value = false;
  }, duracao);
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

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

.mensagem-erro {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #ffe6e6;
  border-radius: 0.5rem;
  border-left: 3px solid #dc3545;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icone-olho {
  position: absolute;
  right: 15px;
  cursor: pointer;
  display: flex;
}

.olho {
  font-size: 1.2rem;
  color: #707070;
  transition: color 0.3s;
}

.olho.ativo {
  color: var(--roxo);
  cursor: pointer;
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