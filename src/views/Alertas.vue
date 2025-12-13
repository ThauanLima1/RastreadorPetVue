<template>
  <div class="container-alertas">
    <div class="conteudo-filtro">
      <div
        v-for="(filtro, index) in filtros"
        class="filtro"
        :key="index"
        :class="[filtro.classe, { ativo: filtroSelecionado === filtro.nome }]"
        @click="selecionarFiltro(filtro)"
      >
        {{ filtro.nome }}
      </div>
    </div>

    <div class="lista-alertas">
      <div v-if="alertasFiltrados.length === 0" class="sem-alertas">
        <div class="icone-vazio">🔔</div>
        <p>Nenhum alerta {{ filtroSelecionado.toLowerCase() }}</p>
        <span>Quando seu pet sair de uma zona segura, os alertas aparecerão aqui.</span>
      </div>

      <div
        v-else
        v-for="alerta in alertasFiltrados"
        :key="alerta.id"
        class="card-alerta"
        :class="[alerta.tipo, { 'nao-visualizado': !alerta.visualizado }]"
        @click="visualizarAlerta(alerta)"
      >
        <div class="alerta-header">
          <div class="icone-tipo">
            <span v-if="alerta.tipo === 'urgente'">🚨</span>
            <span v-else>⚠️</span>
          </div>
          <div class="alerta-info">
            <h3>{{ alerta.titulo }}</h3>
            <p class="data-alerta">{{ formatarData(alerta.timestamp) }}</p>
          </div>
          <div v-if="!alerta.visualizado" class="badge-novo">Novo</div>
        </div>

        <div class="alerta-conteudo">
          <p class="mensagem">{{ alerta.mensagem }}</p>
          
          <div v-if="alerta.zonaInfo" class="zona-detalhes">
            <div class="info-item">
              <span class="label">Zona:</span>
              <span class="valor">{{ alerta.zonaInfo.nome }}</span>
            </div>
            <div class="info-item">
              <span class="label">Distância:</span>
              <span class="valor destaque">{{ alerta.zonaInfo.distancia }}m fora</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="alertasFiltrados.length > 0" class="acoes-historico">
      <button class="btn-limpar" @click="confirmarLimpeza">
        🗑️ Limpar histórico
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref as vueRef, computed, onMounted } from "vue";
import { auth } from "@/firebase";
import { useAlertas } from "@/composables/useAlertas";

const {
  historicoAlertas,
  marcarAlertaVisualizado,
  limparHistoricoAlertas,
  filtrarAlertasPorPeriodo,
  carregarHistoricoAlertas
} = useAlertas();

const filtroSelecionado = vueRef("Hoje");

const filtros = vueRef([
  { nome: "Hoje", classe: "filtro-hoje" },
  { nome: "Mês", classe: "filtro-mes" },
  { nome: "Todos", classe: "filtro-todos" },
]);

const alertasFiltrados = computed(() => {
  return filtrarAlertasPorPeriodo(filtroSelecionado.value);
});

onMounted(async () => {
  console.log('🔍 Alertas.vue montado');
  
  const user = auth.currentUser;
  if (user) {
    console.log('👤 Usuário logado:', user.uid);
    await carregarHistoricoAlertas(user.uid);
    console.log('📊 Histórico carregado:', historicoAlertas.value);
    console.log('📊 Total de alertas:', historicoAlertas.value.length);
  } else {
    console.error('❌ Nenhum usuário logado!');
  }
});

function selecionarFiltro(filtro) {
  filtroSelecionado.value = filtro.nome;
}

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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.conteudo-filtro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  gap: 0.5rem;
}

.filtro {
  flex: 1;
  background-color: #f5f5f5;
  padding: 0.6rem 2.2rem;
  border-radius: 0.6rem;
  color: #666;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.filtro:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filtro.ativo {
  background-color: #6c5ce7;
  color: white;
}


.lista-alertas {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sem-alertas {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.icone-vazio {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.sem-alertas p {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #666;
}

.sem-alertas span {
  font-size: 0.9rem;
  color: #999;
}

.card-alerta {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #ff9800;
}

.card-alerta.urgente {
  border-left-color: #f44336;
}

.card-alerta.nao-visualizado {
  background: #fffbf0;
  box-shadow: 0 2px 12px rgba(255, 152, 0, 0.2);
}

.card-alerta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.alerta-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.icone-tipo {
  font-size: 2rem;
  line-height: 1;
}

.alerta-info {
  flex: 1;
}

.alerta-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.data-alerta {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #999;
}

.badge-novo {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-alerta.urgente .badge-novo {
  background: #f44336;
}

.alerta-conteudo {
  padding-left: 3rem;
}

.mensagem {
  margin: 0 0 1rem;
  color: #555;
  line-height: 1.5;
}

.zona-detalhes {
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.valor {
  color: #333;
  font-size: 0.9rem;
}

.valor.destaque {
  color: #f44336;
  font-weight: 600;
}

/* Ações */

.acoes-historico {
  margin-top: 2rem;
  text-align: center;
}

.btn-limpar {
  background: #f5f5f5;
  color: #666;
  border: 2px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-limpar:hover {
  background: #ff5252;
  color: white;
  border-color: #ff5252;
}

/* Responsivo */

@media (max-width: 640px) {
  .conteudo-filtro {
    flex-direction: column;
  }

  .filtro {
    width: 100%;
  }

  .alerta-conteudo {
    padding-left: 0;
  }

  .zona-detalhes {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>