<template>
  <div class="container-alertas">
    <div class="header-alertas">
      <div class="estatisticas">
        <div class="stat-card">
          <span class="stat-numero">{{ estatisticasAlertas.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card urgente">
          <span class="stat-numero">{{ estatisticasAlertas.urgentes }}</span>
          <span class="stat-label">Urgentes</span>
        </div>
        <div class="stat-card novos">
          <span class="stat-numero">{{ estatisticasAlertas.naoVisualizados }}</span>
          <span class="stat-label">Não lidos</span>
        </div>
      </div>
    </div>

    <div class="lista-alertas">
      <div v-if="historicoAlertas.length === 0" class="sem-alertas">
        <div class="icone-vazio">🔔</div>
        <p>Nenhum alerta registrado</p>
        <span>Quando seu pet sair de uma zona segura, os alertas aparecerão aqui.</span>
      </div>

      <div
        v-else
        v-for="alerta in historicoAlertas"
        :key="alerta.id"
        class="card-alerta"
        :class="[
          `nivel-${alerta.nivel}`,
          { 'nao-visualizado': !alerta.visualizado }
        ]"
        @click="visualizarAlerta(alerta)"
      >
        <div class="alerta-header">
          <div class="icone-tipo">
            {{ alerta.emoji || '⚠️' }}
          </div>
          <div class="alerta-info">
            <h3>{{ alerta.titulo }}</h3>
            <p class="data-alerta">{{ formatarData(alerta.timestamp) }}</p>
          </div>
          <div v-if="!alerta.visualizado" class="badge-novo" :class="`badge-${alerta.nivel}`">
            Novo
          </div>
        </div>

        <div class="alerta-conteudo">
          <p class="mensagem">{{ alerta.mensagem }}</p>
          
          <div v-if="alerta.zonaInfo" class="zona-detalhes">
            <div class="info-item">
              <span class="label">🎯 Zona:</span>
              <span class="valor">{{ alerta.zonaInfo.nome }}</span>
            </div>
            <div class="info-item">
              <span class="label">📏 Distância:</span>
              <span class="valor" :class="`distancia-${alerta.nivel}`">
                {{ alerta.zonaInfo.distancia }}m fora
              </span>
            </div>
          </div>

          <div class="nivel-indicador" :class="`nivel-${alerta.nivel}`">
            <span v-if="alerta.nivel === 'perto'">⚠️ Próximo ao limite</span>
            <span v-else-if="alerta.nivel === 'medio'">🟠 Distância moderada</span>
            <span v-else>🔴 Muito distante</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="historicoAlertas.length > 0" class="acoes-historico">
      <button class="btn-limpar" @click="confirmarLimpeza">
        🗑️ Limpar histórico
      </button>
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
  limparHistoricoAlertas,
  carregarHistoricoAlertas
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
  const agora = new Date();
  const diferenca = agora - data;
  const minutos = Math.floor(diferenca / 60000);
  const horas = Math.floor(diferenca / 3600000);
  const dias = Math.floor(diferenca / 86400000);

  if (minutos < 1) return 'Agora';
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `${dias} dias atrás`;
  
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function confirmarLimpeza() {
  if (confirm('Tem certeza que deseja limpar todo o histórico de alertas?')) {
    limparHistoricoAlertas();
  }
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

.header-alertas {
  margin-bottom: 1rem;
  flex-shrink: 0; 
}

.header-alertas h1 {
  font-size: 1.8rem;
  color: var(--cinza-escuro, #333);
  margin-bottom: 1rem;
}

.estatisticas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-card.urgente {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.stat-card.novos {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.stat-numero {
  display: block;
  font-size: 1.5rem; 
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.lista-alertas {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.2rem;
  max-height: 700px;
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
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 4px solid #ccc;
  flex-shrink: 0; 
}

.card-alerta.nivel-perto { border-left-color: #ffc107; }
.card-alerta.nivel-medio { border-left-color: #ff9800; }
.card-alerta.nivel-longe { border-left-color: #f44336; }

.card-alerta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-alerta.nao-visualizado {
  background-color: #fcfcfc;
  border-right: 3px solid rgba(0,0,0,0.05);
}

.alerta-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.icone-tipo { font-size: 1.8rem; }
.alerta-info { flex: 1; }
.alerta-info h3 { margin: 0; font-size: 1rem; color: #333; }
.data-alerta { margin: 0.25rem 0 0; font-size: 0.8rem; color: #999; }

.badge-novo {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}
.badge-perto { background: #ffc107; }
.badge-medio { background: #ff9800; }
.badge-longe { background: #f44336; }

.alerta-conteudo { padding-left: 0; margin-top: 0.5rem; }
@media(min-width: 600px) { .alerta-conteudo { padding-left: 2.8rem; } }

.mensagem { margin: 0 0 0.8rem; color: #555; font-size: 0.95rem; line-height: 1.4; }

.zona-detalhes {
  background: #f9f9f9;
  padding: 0.6rem;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.info-item { display: flex; gap: 0.4rem; align-items: center; }
.label { font-weight: 600; color: #777; }
.valor { font-weight: 600; color: #333; }
.distancia-longe { color: #f44336; }

.nivel-indicador {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
.nivel-indicador.nivel-perto { background: #fff9c4; color: #f57c00; }
.nivel-indicador.nivel-medio { background: #ffe0b2; color: #e65100; }
.nivel-indicador.nivel-longe { background: #ffcdd2; color: #c62828; }

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