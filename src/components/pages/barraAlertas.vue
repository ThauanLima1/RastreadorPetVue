<template>
  <div class="container-alertas">
    <div class="top">
      <div class="aviso">
        <span class="aviso-laranja"></span>
        <p>Longe</p>
        <span class="aviso-vermelho"></span>
        <p>Muito longe</p>
      </div>

      <p>Notificações: {{ estatisticasAlertas.total }}</p>
    </div>

    <div class="lista-alertas">
      <div v-if="historicoAlertas.length === 0" class="sem-alertas">
        <div class="icone-vazio">🔔</div>
        <p>Nenhum alerta registrado</p>
        <span
          >Quando seu pet sair de uma zona segura, os alertas aparecerão
          aqui.</span
        >
      </div>

      <div
        v-else
        v-for="alerta in historicoAlertas"
        :key="alerta.id"
        class="card-alerta"
        :class="`borda-${alerta.nivel}`"
        @click="visualizarAlerta(alerta)"
      >
        <div class="card-header">
          <div class="zona-info">
            <div
              class="zona-icone"
              :style="{ backgroundColor: alerta.zonaCor }"
            ></div>
            <h3>{{ alerta.zonaNome || "Zona" }}</h3>
            <span v-if="!alerta.visualizado" class="badge-novo">Novo</span>
            <div class="card-footer"></div>
            <span class="divisor"></span>
          </div>
          <button class="btn-fechar" @click.stop="removerAlerta(alerta.id)">
            <img src="@/assets/imgs/x-cinza.png" />
          </button>
        </div>

        <div class="card-body">
          <span class="data-hora">{{ formatarData(alerta.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { auth } from "@/firebase";
import { useAlertas } from "@/composables/useAlertas";

const {
  historicoAlertas,
  estatisticasAlertas,
  marcarAlertaVisualizado,
  excluirAlerta,
  carregarHistoricoAlertas,
} = useAlertas();

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    await carregarHistoricoAlertas(user.uid);
  }
});

function visualizarAlerta(alerta) {
  if (!alerta.visualizado) {
    marcarAlertaVisualizado(alerta.id);
  }
}

function formatarData(timestamp) {
  const data = new Date(timestamp);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function removerAlerta(id) {
  excluirAlerta(id);
}

</script>

<style scoped>
.container-alertas {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
}

.top p {
  color: var(--cinza);
  font-weight: 500;
  margin: 0;
}

.aviso {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.aviso span {
  width: 10px;
  height: 3px;
  border-radius: 3px;
}

.aviso p {
  margin: 0;
}

.aviso-laranja {
  background-color: #ff8001;
}

.aviso-vermelho {
  background-color: #ff1129;
  margin-left: 10px;
}

.lista-alertas {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  max-height: 750px;
  scroll-behavior: smooth;
}

.lista-alertas::-webkit-scrollbar {
  width: 6px;
}

.lista-alertas::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.sem-alertas {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
  margin: auto;
}

.icone-vazio {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.card-alerta {
  background: white;
  border-radius: 1.5rem;
  padding: 0.4rem 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.card-alerta:hover {
  transform: translateY(-2px);
}

.card-alerta.borda-perto,
.card-alerta.borda-medio {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(120deg, #e6e6e6, #e6e6e6, #ff7b00) border-box;
  border: 2px solid transparent;
}

.card-alerta.borda-longe {
  background: linear-gradient(white, white) padding-box,
    linear-gradient(120deg, #e6e6e6, #e6e6e6, #cf0000) border-box;
  border: 2px solid transparent;
}

.card-alerta:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.zona-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.divisor {
  position: absolute;
  right: 13%;
  top: 5%;
  width: 2px;
  height: 50px;
  background-color: var(--cinza-claro);
  border-radius: 3px;
}

.zona-icone {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zona-info h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--preto);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-novo {
  background-color: var(--azul-escuro);
  color: white;
  padding: 0.15rem 0.65rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8.5rem;
}

.btn-fechar {
  position: absolute;
  background: none;
  border: none;
  color: var(--cinza);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  top: 56%;
  right: 5px;
  width: 20px;
  height: 20px;
  transition: color 0.2s;
}

.btn-fechar:active {
  transform: scale(0.98);
}

.mensagem-alerta {
  margin: 0;
  font-size: 0.95rem;
  color: var(--cinza);
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.data-hora {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cinza);
}

.acoes-historico {
  text-align: center;
  padding: 1rem 0 0 0;
  flex-shrink: 0;
  border-top: 1px solid #f0f0f0;
}

.btn-limpar {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-limpar:hover {
  background: #ffebee;
  color: #d32f2f;
  border-color: #ef9a9a;
}
</style>
