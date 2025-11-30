import { ref as refVue } from "vue";
import { auth, database } from "@/firebase/config";
import { ref as refFb, onValue, push, set, remove} from "firebase/database";

export function useGeofences() {
  const geofences = refVue([]);
  const dentroZona = refVue(false);


  function carregarGeofences(usuarioId) {
    const geofencesRef = refFb(database, `usuarios/${usuarioId}/geofences`);

    onValue(geofencesRef, (snapshot) => {
      const dados = snapshot.val();
      geofences.value = [];

      if (dados) {
        Object.keys(dados).forEach((key) => {
          geofences.value.push({ id: key, ...dados[key] });
        });
      }
    });
  }



  async function salvarGeofences(lat, lng, raio, nome, cor) {
    const usuarioId = auth.currentUser?.uid;
    if (!usuarioId) throw new Error("Usuário não logado");

    const geofencesRef = refFb(database, `/usuarios/${usuarioId}/geofences`);
    const NovoGeofencesRef = push(geofencesRef);

    await set(NovoGeofencesRef, {
      lat,
      lng,
      raio,
      nome,
      cor: cor,
      ativa: true,
      criada_em: Date.now(),
    });
  }



  async function excluirZona(zonaId) {
    const usuarioId = auth.currentUser?.uid;
    if (!usuarioId) return;

    const zonaRef = refFb(
      database,
      `/usuarios/${usuarioId}/geofences/${zonaId}`
    );
    await remove(zonaRef);
  }



  function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }



  function VerificarDentroZona(posicaoAtual) {
    if (!posicaoAtual || geofences.value.length === 0) return false;

    const dentro = geofences.value.some((zona) => {
      if (!zona.ativa) return false;
      const distancia = calcularDistancia(
        posicaoAtual.lat,
        posicaoAtual.lng,
        zona.lat,
        zona.lng
      );
      return distancia <= zona.raio;
    });

    dentroZona.value = dentro;
    return dentro;
  }


  
  return {
    geofences,
    carregarGeofences,
    salvarGeofences,
    excluirZona,
    VerificarDentroZona,
    dentroZona,
  };
}
