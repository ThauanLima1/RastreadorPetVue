<template>
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
    <div v-if="historicoLocalizacoesSQL.length === 0" class="sem-alertas">
      <p>Nenhum histórico de localização encontrado para o filtro "{{ filtroSelecionado }}".</p>
      <span>
        Tente mudar o filtro ou verifique se o dispositivo enviou dados recentemente.
      </span>
    </div>

    <div
      v-else
      v-for="localizacao in historicoLocalizacoesSQL"
      :key="localizacao.id"
      class="card-alerta"
      @click="visualizarAlerta(localizacao)"
      
    >
      <div class="alerta-header">
    <div class="zona-nome">
        <span class="icone-localizacao"
            ><img src="@/assets/imgs/localizacao.svg" alt=""
        /></span>
        <h3>{{ localizacao.zoneName }}</h3>
    </div>
        <span></span>
        <div class="data-alerta">{{ formatarDataCompleta(localizacao.locationDateTime) }}</div> 
      </div>

     <p class="mensagem-saida">
          Registro de Posição (Nível de Bateria: {{ formatarCoordenada(localizacao.locationBatteryLevel) }}%)
      </p>

      <div class="alerta-footer">
        <div class="coordenadas">
          <span>Lat: {{ formatarCoordenada(localizacao.latitude) }}</span><br>
          <span>Lng: {{ formatarCoordenada(localizacao.longitude) }}</span>
        </div>
        <div class="distancia">
           <span class="distancia-label">Device ID:</span>
           <span class="distancia-valor">{{ localizacao.deviceId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { auth } from "@/firebase";
import { ref as vueRef } from "vue";
import { useAlertas } from "@/composables/useAlertas";

const { historicoLocalizacoesSQL, 
    getLocationsToday, 
    getLocationsThisMonth, 
    getAllLocations,historicoAlertas, marcarAlertaVisualizado, carregarHistoricoAlertas } =
  useAlertas();

const filtroSelecionado = vueRef("Hoje");

const filtros = vueRef([
    { nome: "Hoje", valor: "today", classe: "filtro-hoje" }, 
    { nome: "Mês", valor: "month", classe: "filtro-mes" },
    { nome: "Todos", valor: "all", classe: "filtro-todos" },
]);


const carregaFiltroMap = {
    'today': getLocationsToday,
    'month': getLocationsThisMonth,
    'all': getAllLocations,
};

async function selecionarFiltro(filtro) {
    filtroSelecionado.value = filtro.nome;
    
    const funcaoCarregamento = carregaFiltroMap[filtro.valor];
    
    if (funcaoCarregamento) {
        await funcaoCarregamento();
    }
}

function formatarCoordenada(valor) {
    if (valor === undefined || valor === null) return '';
    
    return Number(valor).toFixed(6); 
}

onMounted(async () => {
    await getLocationsToday(); 
    
    // const user = auth.currentUser;
    // if (user) {
    //     await carregarHistoricoAlertas(user.uid);
    // }
    
});

function visualizarAlerta(alerta) {
  if (!alerta.visualizado) {
    marcarAlertaVisualizado(alerta.id);
  }
}

function formatarDataCompleta(dateTimeString) {
    const data = new Date(dateTimeString);
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }) + 'h';
}

function formatarDataCurta(timestamp) {
  const data = new Date(timestamp);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<style scoped>
.conteudo-filtro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
}

.filtro {
  background-color: var(--cinza-claro);
  padding: 0.6rem 2.4rem;
  border-radius: 0.6rem;
  color: var(--cinza-escuro);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.filtro.ativo {
  background-color: var(--azul-escuro);
  color: var(--branco);
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
  color: var(--cinza);
}

.sem-alertas p {
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.2rem;
}

.card-alerta {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.267);
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  border: 1px solid #f0f0f0;
}

.card-alerta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.alerta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.2rem;
}

.zona-nome {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.icone-localizacao {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.icone-localizacao img {
  height: 15px;
  width: auto;
}

.zona-nome h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--cinza-escuro);
}

.data-alerta {
  font-size: 0.9rem;
  color: var(--cinza);
  font-weight: 600;
}

.mensagem-saida {
  margin: 0 0 1rem 0;
  color: var(--cinza);
  font-size: 1rem;
  font-weight: 500;
}

.alerta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.8rem;
  border-top: 1px solid #f5f5f5;
}

.coordenadas {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cinza);
}

.distancia {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
}

.distancia-label {
  color: var(--cinza);
  font-weight: 400;
  font-size: 1rem;
}

.distancia-valor {
  font-weight: 600;
  font-size: 1rem;
}

.distancia-perto .distancia-valor {
  color: #ffe926;
}

.distancia-medio .distancia-valor {
  color: #fc6436;
}

.distancia-longe .distancia-valor {
  color: #ff3333;
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
