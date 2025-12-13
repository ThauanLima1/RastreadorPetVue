import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/login.vue";
import Cadastro from "../views/cadastro.vue";
import Mapa from "../views/mapa.vue";
import barraConfig from "@/components/pages/barraConfig.vue";
import barraPets from "@/components/pages/barraPets.vue";
import BarraAlertas from "@/components/pages/barraAlertas.vue";
import BarraMenu from "@/components/pages/barraMenu.vue";
import BarraGeofences from "@/components/pages/barraGeofences.vue";
import BarraZonasAtivas from "@/components/pages/barraZonasAtivas.vue";
import BarraHistorico from "@/components/pages/barraHistorico.vue";

const routes = [
  { path: "/app/login", component: Login },
  { path: "/app/cadastro", component: Cadastro },
{
  path: '/app/mapa',
  component: Mapa,
  children: [
    
    {
      path: 'configuracoes',
      name: 'configuracoes',
      component: barraConfig,
    },
    {
      path: 'pets',
      name: 'pets',
      component: barraPets,
    },
    {
      path: 'alertas',
      name: 'alertas',
      component: BarraAlertas,
    },
    {
      path: 'menu',
      name: 'menu',
      component: BarraMenu,
    },
     {
      path: 'geofences',
      name: 'geofences',
      component: BarraGeofences,
    },
     {
      path: 'zonas-ativas',
      name: 'zonasAtivas',
      component: BarraZonasAtivas,
    },
      {
      path: 'historico',
      name: 'historico',
      component: BarraHistorico,
    },

  ],
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
