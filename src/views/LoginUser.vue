<template>
    <div class="container-fluid">
  
  <!-- Login metade -->
  <div class="left-section">
    <div class="login-form">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo">
      </div>
      <h2>Bem vindo!</h2>
      <p>Logue com sua conta para continuar.</p>

      <button class="google-btn">
        <img src="../assets/google.svg" alt="Google Logo">
        Logue com o Google
      </button>

      <div class="divider">Ou</div>

      <form @submit.prevent="onSubmit">
        <div class="">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="Digite seu email">
        </div>

        <div class="">
          <label class="form-label">Senha</label>
          <input v-model="password" type="password" class="form-control" placeholder="Digite sua senha">
        </div>

        <div class="forgot-password">
          <a href="#">Esqueceu a senha?</a>
        </div>

        <button type="submit" class="btn-login">Logue</button>
      </form>

      <div class="register-link">
        Não possui uma conta ainda? <router-link to="/register">Cadastre-se</router-link>
      </div>
    </div>
  </div>




  <div class="right-section">
    <div class="quote-card">
      <p>
        Quem cuida com amor, nunca perde o caminho<br>
        — nem o pet.
      </p>
      <img src="../assets/cat.png" alt="cat">
    </div>
  </div>
</div>
</template>

<script>
    export default {
        name: 'LoginUser',
    }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');


*{
    font-family: "Poppins", sans-serif;  
}

body    {    
    overflow: hidden;
    width: 100%;
    height: 100vh;
    margin: 0;
    
}

.container-fluid {
    display: flex;
    height: 100vh; /* Pega toda a altura da tela */
}

/* Sections */

.left-section, .right-section{
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
}

.right-section{
    background: linear-gradient(to bottom, #4285F4 0%, #264D8E 100%);
  
}

/* Form */

.login-form{
    padding: 30px;
}

.quote-card{
    padding: 40px;
    background-color: white;
    border-radius: 20px;
    height: 70vh;
    overflow: hidden;
    position: relative;
    max-width: 40%;
}

.quote-card img{
    left: 38%;
    top: 45%;
    position: absolute;
}

.quote-card p{
    color: #6E6E6E;
    font-size: 1.3rem;
}


@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>