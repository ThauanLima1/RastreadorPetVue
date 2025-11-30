import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/login.vue";
import Cadastro from "../views/cadastro.vue";
import Mapa from "../views/mapa.vue";

const routes = [
  { path: "/cademeupet/app/login", component: Login },
  { path: "/cademeupet/app/cadastro", component: Cadastro },
  { path: "/cademeupet/app/mapa", component: Mapa },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
