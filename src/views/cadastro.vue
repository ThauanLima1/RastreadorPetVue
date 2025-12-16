<template>
  <div class="container">
    <div class="section-esquerda">
      <img src="@/assets/imgs/cachorro-cadastro.jpg" alt="Cachorro" />
    </div>
    <div class="section-direita">
      <div class="form-login">
        <div class="logo">
          <img src="../assets/imgs/logo.svg" />
        </div>
        <h2>Bem vindo!</h2>
        <p>Crie uma conta para continuar.</p>

        <button class="btn-google" @click="loginComGoogle">
          <img src="../assets/imgs/google.svg" />
          Logue com o Google
        </button>

        <div class="divisor">Ou</div>

        <form @submit.prevent="cadastrarUsuario">
          <div class="form-grupo">
            
            <label>Usuário</label>
            <input
              v-model="usuario"
              type="text"
              class="input"
              :class="{ 'input-erro': erros.usuario }"
              placeholder="Maria Eduarda"
              @input="erros.usuario = ''" 
            />
            <span v-if="erros.usuario" class="msg-erro-texto">
              {{ erros.usuario }}
            </span>

            <label>Email</label>
            <input
              v-model="email"
              type="email"
              class="input"
              :class="{ 'input-erro': erros.email }"
              placeholder="mariaeduarda@senai.com"
              @input="erros.email = ''"
            />
            <span v-if="erros.email" class="msg-erro-texto">
              {{ erros.email }}
            </span>

            <label>Senha</label>
            <div class="wrapper-olho">
              <input
                v-model="senha"
                class="input sem-margem"
                :class="{ 'input-erro': erros.senha }"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="123456"
                @input="erros.senha = ''"
              />
              <div class="icone-olho" @click="mostrarSenha = !mostrarSenha">
                <i
                  class="bi"
                  :class="mostrarSenha ? 'bi-eye-fill olho ativo' : 'bi-eye olho'"
                ></i>
              </div>
            </div>
            <span v-if="erros.senha" class="msg-erro-texto mb-custom">
              {{ erros.senha }}
            </span>

            <label>Confirmar senha</label>
            <input
              v-model="confirmarSenha"
              class="input sem-margem"
              :class="{ 'input-erro': erros.confirmarSenha }"
              style="margin-bottom: 0.5rem"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="123456"
              @input="erros.confirmarSenha = ''"
            />
            <span v-if="erros.confirmarSenha" class="msg-erro-texto mb-custom">
              {{ erros.confirmarSenha }}
            </span>
          </div>

          <Botao type="submit" :disabled="carregando" :carregando="carregando">
            Cadastrar
          </Botao>
        </form>

        <div class="login-link">
          Já tem uma conta?
          <router-link to="/app/login">Entrar</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Botao from "@/components/botao.vue";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/index.js";
import { signInWithPopup } from "firebase/auth";
import { ref as vueRef, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const usuario = vueRef("");
const email = vueRef("");
const senha = vueRef("");
const confirmarSenha = vueRef("");
const mostrarSenha = vueRef(false);
const carregando = vueRef(false);

const erros = reactive({
  usuario: "",
  email: "",
  senha: "",
  confirmarSenha: ""
});

function validarFormulario() {
  let valido = true;

  erros.usuario = "";
  erros.email = "";
  erros.senha = "";
  erros.confirmarSenha = "";

  if (!usuario.value.trim()) {
    erros.usuario = "O nome de usuário é obrigatório.";
    valido = false;
  }

  if (!email.value.trim()) {
    erros.email = "O email é obrigatório.";
    valido = false;
  } else if (!email.value.includes("@")) {
    erros.email = "Digite um email válido.";
    valido = false;
  }

  if (!senha.value.trim()) {
    erros.senha = "A senha é obrigatória.";
    valido = false;
  } else if (senha.value.trim().length < 6) {
    erros.senha = "A senha deve ter pelo menos 6 caracteres.";
    valido = false;
  }

  if (senha.value !== confirmarSenha.value) {
    erros.confirmarSenha = "As senhas não coincidem.";
    valido = false;
  }

  return valido;
}

async function cadastrarUsuario() {
  if (!validarFormulario()) {
    return;
  }

  carregando.value = true;

  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );
    const usuarioFirebase = res.user;

    await updateProfile(usuarioFirebase, {
      displayName: usuario.value,
    });

    router.push("/app/mapa");
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    if (error.code === 'auth/email-already-in-use') {
      erros.email = "Este email já está em uso.";
    }
  } finally {
    carregando.value = false;
  }
}

async function loginComGoogle() {
  try {
    carregando.value = true;
    await signInWithPopup(auth, googleProvider);
    router.push("/app/mapa");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  } finally {
    carregando.value = false;
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

.section-esquerda,
.section-direita {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.section-esquerda img {
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
  background: white;
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
  border: 1px solid #dadada;
  color: var(--cinza);
  margin-bottom: 0.5rem; 
  font-size: 0.9rem;
  font-weight: 600;
  transition: border 0.3s ease;
}

.form-grupo .input.sem-margem {
  margin-bottom: 0;
}

.form-grupo .input.input-erro {
  border: 1px solid #dc3545;
}

.form-grupo .input::placeholder {
  color: #b1b1b1;
}

.form-grupo .input:focus {
  outline: none;
  border: 1px solid var(--roxo);
}

.msg-erro-texto {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: -0.2rem; 
  margin-bottom: 1.5rem; 
  display: block;
  font-weight: 500;
}

.mb-custom {
    margin-bottom: 1.5rem;
    margin-top: 0.3rem;
}

.wrapper-olho {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
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
  font-size: 1.2rem;
  color: #707070;
  transition: color 0.3s;
}

.olho.ativo {
  color: var(--roxo);
}

.login-link {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
}

.login-link a {
  color: #4285f4;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .section-esquerda {
    display: none;
  }

  .form-login {
    width: 100%;
    max-width: 100%;
  }
}
</style>