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

  function verificarDentroZona(posicaoAtual) {
    if (!geofences.value || geofences.value.length === 0) {
      console.log("Sem geofences para verificar");
      return false;
    }

    console.log("Posição atual:", posicaoAtual);
    console.log("Geofences:", geofences.value);

    const dentroDeAlgumaZona = geofences.value.some((zona) => {
      const R = 6371000;
      const lat1 = (posicaoAtual.lat * Math.PI) / 180;
      const lat2 = (zona.lat * Math.PI) / 180;
      const deltaLat = ((zona.lat - posicaoAtual.lat) * Math.PI) / 180;
      const deltaLng = ((zona.lng - posicaoAtual.lng) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLng / 2) *
          Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c;

      console.log(
        `Zona: ${zona.nome}, Distância: ${distancia.toFixed(2)}m, Raio: ${
          zona.raio
        }m, Dentro: ${distancia <= zona.raio}`
      );

      return distancia <= zona.raio;
    });

    return dentroDeAlgumaZona;
  }

  async function excluirZona(id) {
    if (!usuarioIdGlobal.value) return;

    const refZona = dbRef(
      database,
      `usuarios/${usuarioIdGlobal.value}/geofences/${id}`
    );

    await remove(refZona);
    geofences.value = geofences.value.filter((z) => z.id !== id);
  }

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
  };
}
