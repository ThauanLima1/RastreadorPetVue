import { ref as vueRef } from "vue";
import { database } from "@/firebase";
import { ref as dbRef, push, set, get, remove } from "firebase/database";

const geofences = vueRef([]);
const nomeZona = vueRef("");
const raioZona = vueRef(50);
const corZona = vueRef("#3264fe");
const modoSelecao = vueRef(false);
const visivelBarraGlobal = vueRef(false);
const usuarioIdGlobal = vueRef(null);
let onZonaAdicionada = null;

export function useGeofences() {


   function registrarCallbackZonaAdicionada(callback) {
    onZonaAdicionada = callback;
  }

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

  await carregarGeofences(usuarioId);
  
  const zonaCompleta = { id: novaRef.key, ...novaZona };
  
  if (onZonaAdicionada) {
    await onZonaAdicionada(zonaCompleta);
  }
  
  return zonaCompleta;
}


async function excluirZona(id) {
  if (!usuarioIdGlobal.value) return;

  try {
    const refZona = dbRef(
      database,
      `usuarios/${usuarioIdGlobal.value}/geofences/${id}`
    );
    await remove(refZona);

    await carregarGeofences(usuarioIdGlobal.value);
    
  } catch (error) {
    console.error('Erro ao excluir zona:', error);
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

  return {
    geofences,
    carregarGeofences,
    salvarGeofences,
    verificarDentroZona,
    excluirZona,
    calcularDistancia,
    visivelBarraGlobal,
    nomeZona,
    raioZona,
    corZona,
    modoSelecao,
    registrarCallbackZonaAdicionada,
  };
}