<template>
  <div class="pet-profile-container">
    <div class="pet-card">
      
      <div class="pet-image-wrapper">
        <img :src="pet.fotoUrl" :alt="pet.nome" class="pet-image" />
      </div>

      <div class="pet-content">
        <div class="pet-header">
          <h2>{{ pet.nome }}</h2>
          <span class="pet-breed">{{ pet.raca }} • {{ pet.idade }} anos</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const pet = ref({
  nome: 'Paçoca',
  raca: 'Vira-lata Caramelo (Legítimo)',
  idade: 3,
  fotoUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
});
</script>

<style scoped>
.pet-profile-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f4f6f8;
  min-height: 100%;
}

.pet-card {
  background: white;
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  height: fit-content; 
}

.pet-card:hover {
  transform: translateY(-5px);
}

.pet-image-wrapper {
  position: relative;
  height: 300px; 
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-content {
  padding: 25px;
  text-align: left; 
}

.pet-header h2 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.pet-breed {
  color: #7f8c8d;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>