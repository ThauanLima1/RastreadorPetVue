import { ref as vueRef } from "vue";
import { database } from "@/firebase";
import { ref as dbRef, push, set, get, remove } from "firebase/database";

const geofences = vueRef([]);
const historicoAlertas = vueRef([]);
const alertaAtivo = vueRef(null);

const nomeZona = vueRef("");
const raioZona = vueRef(50);
const corZona = vueRef("#3264fe");
const modoSelecao = vueRef(false);
const visivelBarraGlobal = vueRef(false);
const usuarioIdGlobal = vueRef(null);

const NIVEIS_ALERTA = {
  PERTO: {
    nome: 'perto',
    distanciaMin: 0,
    distanciaMax: 50,
    tipo: 'alerta',
    cor: '#ffc107',
    emoji: '⚠️',
    titulo: '⚠️ Pet Próximo ao Limite',
    mensagemTemplate: 'está se aproximando do limite da zona segura'
  },
  MEDIO: {
    nome: 'medio',
    distanciaMin: 51,
    distanciaMax: 200,
    tipo: 'alerta',
    cor: '#ff9800',
    emoji: '⚠️',
    titulo: '⚠️ Pet Fora da Zona',
    mensagemTemplate: 'saiu da zona segura'
  },
  LONGE: {
    nome: 'longe',
    distanciaMin: 201,
    distanciaMax: Infinity,
    tipo: 'urgente',
    cor: '#f44336',
    emoji: '🚨',
    titulo: '🚨 URGENTE: Pet Muito Distante',
    mensagemTemplate: 'está muito longe da zona segura'
  }
};

const ultimosAlertas = vueRef(new Map());
const INTERVALO_MIN_ALERTA = 60000; 

export function useGeofences() {
  
  async function carregarGeofences(usuarioId) {
    usuarioIdGlobal.value = usuarioId;

    const ref = dbRef(database, `usuarios/${usuarioId}/geofences`);
    const snapshot = await get(ref);
    const dados = snapshot.val() || {};

    geofences.value = Object.keys(dados).map((id) => ({
      id,
      ...dados[id],
      raio: Number(dados[id].raio),
    }));
  }

  async function salvarGeofences(lat, lng, raio, nome, cor, usuarioId) {
    const ref = dbRef(database, `usuarios/${usuarioId}/geofences`);
    const novaRef = push(ref);
    const novaZona = { lat, lng, raio, nome, cor };

    await set(novaRef, novaZona);
    geofences.value.push({ id: novaRef.key, ...novaZona });
  }


  async function excluirZona(id) {
    if (!usuarioIdGlobal.value) return;

    try {

      const zonaExcluida = geofences.value.find(z => z.id === id);
      
      if (!zonaExcluida) {
        console.error('❌ Zona não encontrada');
        return;
      }


      const refZona = dbRef(
        database,
        `usuarios/${usuarioIdGlobal.value}/geofences/${id}`
      );
      await remove(refZona);


      geofences.value = geofences.value.filter((z) => z.id !== id);


      await excluirAlertasPorZona(zonaExcluida.nome);

      console.log(`✅ Zona "${zonaExcluida.nome}" e alertas relacionados excluídos`);

    } catch (error) {
      console.error('❌ Erro ao excluir zona:', error);
      throw error;
    }
  }

  async function excluirAlertasPorZona(nomeZona) {
    if (!usuarioIdGlobal.value) return;

    try {
      const alertasParaExcluir = historicoAlertas.value.filter(
        alerta => alerta.zonaInfo?.nome === nomeZona
      );

      if (alertasParaExcluir.length === 0) {
        console.log('ℹ️ Nenhum alerta relacionado a esta zona');
        return;
      }

      console.log(`🗑️ Excluindo ${alertasParaExcluir.length} alertas da zona "${nomeZona}"`);

      const promises = alertasParaExcluir.map(alerta => {
        const alertaRef = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas/${alerta.id}`);
        return remove(alertaRef);
      });

      await Promise.all(promises);

      historicoAlertas.value = historicoAlertas.value.filter(
        alerta => alerta.zonaInfo?.nome !== nomeZona
      );

      console.log(`✅ ${alertasParaExcluir.length} alertas excluídos com sucesso`);

    } catch (error) {
      console.error('❌ Erro ao excluir alertas da zona:', error);
      throw error;
    }
  }

  async function excluirAlerta(alertaId) {
    if (!usuarioIdGlobal.value) return;

    try {
      const alertaRef = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas/${alertaId}`);
      await remove(alertaRef);

      historicoAlertas.value = historicoAlertas.value.filter(a => a.id !== alertaId);
      
      console.log('✅ Alerta individual excluído');
    } catch (error) {
      console.error('❌ Erro ao excluir alerta:', error);
      throw error;
    }
  }


  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  function verificarDentroZona(posicaoAtual) {
    if (!geofences.value || geofences.value.length === 0) {
      console.log("Sem geofences para verificar");
      return { dentroDeAlgumaZona: false, alertasDetectados: [] };
    }

    const alertasDetectados = [];
    let dentroDeAlgumaZona = false;

    geofences.value.forEach((zona) => {
      const distancia = calcularDistancia(
        posicaoAtual.lat,
        posicaoAtual.lng,
        zona.lat,
        zona.lng
      );

      const distanciaForaZona = Math.max(0, distancia - zona.raio);
      const estaDentro = distancia <= zona.raio;

      console.log(
        `Zona: ${zona.nome}, Distância: ${distancia.toFixed(2)}m, Raio: ${zona.raio}m, Dentro: ${estaDentro}`
      );

      if (estaDentro) {
        dentroDeAlgumaZona = true;
      } else {
        alertasDetectados.push({
          zona,
          distanciaTotal: Math.round(distancia),
          distanciaForaZona: Math.round(distanciaForaZona)
        });
      }
    });

    return { dentroDeAlgumaZona, alertasDetectados };
  }

  function determinarNivelAlerta(distanciaForaZona) {
    if (distanciaForaZona === 0) return null;
    
    for (const [key, nivel] of Object.entries(NIVEIS_ALERTA)) {
      if (distanciaForaZona >= nivel.distanciaMin && distanciaForaZona <= nivel.distanciaMax) {
        return nivel;
      }
    }
    
    return NIVEIS_ALERTA.LONGE;
  }

  function devecriarAlerta(zonaId) {
    const agora = Date.now();
    const ultimoAlerta = ultimosAlertas.value.get(zonaId);
    
    if (!ultimoAlerta) return true;
    
    return (agora - ultimoAlerta) > INTERVALO_MIN_ALERTA;
  }

  async function verificarAlertas(posicaoAtual, petNome = "Seu pet") {
    if (!usuarioIdGlobal.value) {
      console.log("⚠️ Usuário não identificado");
      return null;
    }

    const { dentroDeAlgumaZona, alertasDetectados } = verificarDentroZona(posicaoAtual);

    if (alertasDetectados.length === 0) {
      return null;
    }

    for (const alertaInfo of alertasDetectados) {
      const { zona, distanciaForaZona } = alertaInfo;
      
      if (!devecriarAlerta(zona.id)) {
        console.log(`⏱️ Alerta da zona ${zona.nome} ainda em cooldown`);
        continue;
      }

      const nivelAlerta = determinarNivelAlerta(distanciaForaZona);
      
      if (nivelAlerta) {
        const alerta = await criarAlerta({
          petNome,
          zona,
          nivelAlerta,
          distanciaForaZona,
          localizacao: posicaoAtual
        });

        ultimosAlertas.value.set(zona.id, Date.now());

        if (!alertaAtivo.value) {
          alertaAtivo.value = alerta;
        }

        return alerta;
      }
    }

    return null;
  }

  async function criarAlerta({ petNome, zona, nivelAlerta, distanciaForaZona, localizacao }) {
    if (!usuarioIdGlobal.value) return null;

    const alerta = {
      userId: usuarioIdGlobal.value,
      petNome,
      tipo: nivelAlerta.tipo,
      titulo: nivelAlerta.titulo,
      mensagem: `${petNome} ${nivelAlerta.mensagemTemplate}`,
      zonaInfo: {
        nome: zona.nome,
        distancia: distanciaForaZona
      },
      localizacao,
      timestamp: Date.now(),
      visualizado: false,
      nivel: nivelAlerta.nome,
      cor: nivelAlerta.cor,
      emoji: nivelAlerta.emoji
    };

    try {
      const ref = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas`);
      const novaRef = push(ref);
      
      await set(novaRef, alerta);
      
      alerta.id = novaRef.key;
      historicoAlertas.value.unshift(alerta);
      
      console.log('✅ Alerta criado:', alerta);
      
      return alerta;
    } catch (error) {
      console.error('❌ Erro ao criar alerta:', error);
      return null;
    }
  }

  async function carregarHistoricoAlertas(usuarioId) {
    try {
      const ref = dbRef(database, `usuarios/${usuarioId}/alertas`);
      const snapshot = await get(ref);
      const dados = snapshot.val() || {};
      
      historicoAlertas.value = Object.keys(dados)
        .map(id => ({
          id,
          ...dados[id]
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`✅ ${historicoAlertas.value.length} alertas carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }

  async function marcarAlertaVisualizado(alertaId) {
    if (!usuarioIdGlobal.value) return;

    try {
      const alerta = historicoAlertas.value.find(a => a.id === alertaId);
      if (!alerta) return;

      const ref = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas/${alertaId}`);
      await set(ref, {
        ...alerta,
        visualizado: true
      });
      
      const index = historicoAlertas.value.findIndex(a => a.id === alertaId);
      if (index !== -1) {
        historicoAlertas.value[index].visualizado = true;
      }
      
      console.log('✅ Alerta marcado como visualizado');
    } catch (error) {
      console.error('❌ Erro ao marcar alerta:', error);
    }
  }

  async function limparHistoricoAlertas() {
    if (!usuarioIdGlobal.value) return;

    try {
      const ref = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas`);
      await remove(ref);
      
      historicoAlertas.value = [];
      
      console.log('✅ Histórico limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
    }
  }

  function filtrarAlertasPorPeriodo(periodo) {
    const agora = Date.now();
    
    switch (periodo) {
      case 'Hoje':
        const inicioHoje = new Date();
        inicioHoje.setHours(0, 0, 0, 0);
        return historicoAlertas.value.filter(a => a.timestamp >= inicioHoje.getTime());
        
      case 'Mês':
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        return historicoAlertas.value.filter(a => a.timestamp >= inicioMes.getTime());
        
      case 'Todos':
      default:
        return historicoAlertas.value;
    }
  }

  function fecharAlerta() {
    if (alertaAtivo.value && !alertaAtivo.value.visualizado) {
      marcarAlertaVisualizado(alertaAtivo.value.id);
    }
    alertaAtivo.value = null;
  }

  const estatisticasAlertas = vueRef({
    get total() {
      return historicoAlertas.value.length;
    },
    get naoVisualizados() {
      return historicoAlertas.value.filter(a => !a.visualizado).length;
    },
    get urgentes() {
      return historicoAlertas.value.filter(a => a.tipo === 'urgente').length;
    },
    get alertasHoje() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return historicoAlertas.value.filter(a => a.timestamp >= hoje.getTime()).length;
    }
  });

  return {
    geofences,
    carregarGeofences,
    salvarGeofences,
    verificarDentroZona,
    excluirZona, 
    visivelBarraGlobal,
    nomeZona,
    raioZona,
    corZona,
    modoSelecao,
    
    historicoAlertas,
    alertaAtivo,
    estatisticasAlertas,
    verificarAlertas,
    carregarHistoricoAlertas,
    marcarAlertaVisualizado,
    limparHistoricoAlertas,
    filtrarAlertasPorPeriodo,
    fecharAlerta,
    NIVEIS_ALERTA,
    
    excluirAlertasPorZona,
    excluirAlerta
  };
}