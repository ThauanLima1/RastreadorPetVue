import { ref as vueRef, computed } from "vue";
import { database } from "@/firebase";
import { ref as dbRef, push, set, get, remove } from "firebase/database";
import { post } from "@/api/index";

const historicoAlertas = vueRef([]);
const alertaAtivo = vueRef(null);
const ultimosAlertas = vueRef({});
const usuarioIdGlobal = vueRef(null);

const INTERVALO_MIN_ALERTA = 60000;

const NIVEIS_ALERTA = {
  PERTO: {
    nome: "perto",
    distanciaMin: 0,
    distanciaMax: 50,
    tipo: "alerta",
    cor: "#ffc107",
    emoji: "⚠️",
    titulo: "⚠️ Pet Próximo ao Limite",
    mensagemTemplate: "está se aproximando do limite da zona segura",
  },
  MEDIO: {
    nome: "medio",
    distanciaMin: 51,
    distanciaMax: 200,
    tipo: "alerta",
    cor: "#ff9800",
    emoji: "⚠️",
    titulo: "⚠️ Pet Fora da Zona",
    mensagemTemplate: "saiu da zona segura",
  },
  LONGE: {
    nome: "longe",
    distanciaMin: 201,
    distanciaMax: Infinity,
    tipo: "urgente",
    cor: "#f44336",
    emoji: "🚨",
    titulo: "🚨 URGENTE: Pet Muito Distante",
    mensagemTemplate: "está muito longe da zona segura",
  },
};

export function useAlertas() {
  function determinarNivelAlerta(distanciaForaZona) {
    if (distanciaForaZona === 0) return null;

    for (const nivel of Object.values(NIVEIS_ALERTA)) {
      if (
        distanciaForaZona >= nivel.distanciaMin &&
        distanciaForaZona <= nivel.distanciaMax
      ) {
        return nivel;
      }
    }

    return NIVEIS_ALERTA.LONGE;
  }



  function devecriarAlerta(zonaId) {
    
    const agora = Date.now();
    const ultimoAlerta = ultimosAlertas.value[zonaId];

    if (!ultimoAlerta) return true;

    return agora - ultimoAlerta > INTERVALO_MIN_ALERTA;
  }





  async function criarAlerta({
    petNome,
    zona,
    nivelAlerta,
    distanciaForaZona,
    localizacao,
  }) {
    if (!usuarioIdGlobal.value) return null;
    
    const alertaFirebase = {
      userId: usuarioIdGlobal.value,
      petNome,
      tipo: nivelAlerta.tipo,
      titulo: nivelAlerta.titulo,
      mensagem: `${petNome} ${nivelAlerta.mensagemTemplate}`,
      zonaId: zona.id,
      zonaNome: zona.nome,
      distancia: distanciaForaZona,
      timestamp: Date.now(),
      visualizado: false,
      nivel: nivelAlerta.nome,
      cor: nivelAlerta.cor,
      emoji: nivelAlerta.emoji,
      latitude: localizacao.lat.toFixed(7),
      longitude: localizacao.lng.toFixed(7),
    };

    const alertaMySQL = {
      zoneName: zona.nome,
      latitude: localizacao.lat,
      longitude: localizacao.lng,
      distance: distanciaForaZona,
      dateTime: new Date().toISOString(),
      batteryLevel: 85.5,
      deviceId: 1,
    };

    try {
      await post("locations", alertaMySQL);

      const ref = dbRef(database, `usuarios/${usuarioIdGlobal.value}/alertas`);
      const novaRef = push(ref);
      await set(novaRef, alertaFirebase);

      alertaFirebase.id = novaRef.key;
      historicoAlertas.value.unshift(alertaFirebase);
      ultimosAlertas.value[zona.id] = Date.now();

      return alertaFirebase;
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
      return null;
    }
  }




  async function carregarHistoricoAlertas(usuarioId) {
    usuarioIdGlobal.value = usuarioId;

    try {
      const ref = dbRef(database, `usuarios/${usuarioId}/alertas`);
      const snapshot = await get(ref);
      const dados = snapshot.val() || {};

      historicoAlertas.value = Object.keys(dados)
        .map((id) => ({ id, ...dados[id] }))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }




  async function marcarAlertaVisualizado(alertaId) {
    if (!usuarioIdGlobal.value) {
      throw new Error("Usuário não identificado");
    }

    try {
      const alerta = historicoAlertas.value.find((a) => a.id === alertaId);
      if (!alerta) return;

      const ref = dbRef(
        database,
        `usuarios/${usuarioIdGlobal.value}/alertas/${alertaId}`
      );
      await set(ref, { ...alerta, visualizado: true });

      const index = historicoAlertas.value.findIndex((a) => a.id === alertaId);
      if (index !== -1) {
        historicoAlertas.value[index].visualizado = true;
      }
    } catch (error) {
      console.error("Erro ao marcar alerta:", error);
    }
  }




  async function excluirAlertasPorZona(nomeZona) {
    if (!usuarioIdGlobal.value) {
      throw new Error("Usuário não identificado");
    }

    try {
      const alertasParaExcluir = historicoAlertas.value.filter(
        (alerta) => alerta.zonaNome === nomeZona // ✅ CORRIGIDO
      );

      if (alertasParaExcluir.length === 0) return;

      const promises = alertasParaExcluir.map((alerta) => {
        const alertaRef = dbRef(
          database,
          `usuarios/${usuarioIdGlobal.value}/alertas/${alerta.id}`
        );
        return remove(alertaRef);
      });

      await Promise.all(promises);

      historicoAlertas.value = historicoAlertas.value.filter(
        (alerta) => alerta.zonaNome !== nomeZona // ✅ CORRIGIDO
      );
    } catch (error) {
      console.error("Erro ao excluir alertas da zona:", error);
      throw error;
    }
  }

  function filtrarAlertasPorPeriodo(periodo) {
    switch (periodo) {
      case "Hoje":
        const inicioHoje = new Date();
        inicioHoje.setHours(0, 0, 0, 0);
        return historicoAlertas.value.filter(
          (a) => a.timestamp >= inicioHoje.getTime()
        );

      case "Mês":
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        return historicoAlertas.value.filter(
          (a) => a.timestamp >= inicioMes.getTime()
        );

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

  const estatisticasAlertas = computed(() => ({
    total: historicoAlertas.value.length,
    naoVisualizados: historicoAlertas.value.filter((a) => !a.visualizado)
      .length,
    urgentes: historicoAlertas.value.filter((a) => a.tipo === "urgente").length,
    alertasHoje: (() => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return historicoAlertas.value.filter((a) => a.timestamp >= hoje.getTime())
        .length;
    })(),
  }));

  return {
    historicoAlertas,
    alertaAtivo,
    estatisticasAlertas,
    criarAlerta,
    carregarHistoricoAlertas,
    marcarAlertaVisualizado,
    filtrarAlertasPorPeriodo,
    excluirAlertasPorZona,
    fecharAlerta,
    determinarNivelAlerta,
    devecriarAlerta,
    NIVEIS_ALERTA,
  };
}
