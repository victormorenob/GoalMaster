# GoalMaster: Aplicación Web para la Gestión de Metas Personales

<div align="center">
  <img src="URL_A_UN_LOGO_O_IMAGEN_PRINCIPAL" alt="GoalMaster Logo" width="150"/>
  <h3>Un proyecto para transformar aspiraciones en logros medibles.</h3>
</div>

---

**GoalMaster** es una aplicación web de código abierto diseñada para ayudar a los usuarios a definir, gestionar y monitorizar sus metas personales de una manera eficiente y motivadora. La plataforma se centra en la cuantificación del progreso, ofreciendo herramientas visuales y analíticas para que los usuarios puedan seguir su evolución, identificar patrones y mantenerse enfocados en sus objetivos.

Este repositorio contiene el código fuente completo del proyecto, desarrollado como parte de un Trabajo de Fin de Grado en Ingeniería del Software.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/V1ct0r5/proyecto_web_TFG)

## ✨ Características Principales

*   **Gestión Integral de Objetivos:** Crea, actualiza, archiva y elimina tus metas. Define objetivos cuantitativos (ej. "ahorrar 1000€") o cualitativos.
*   **Seguimiento Detallado del Progreso:** Registra avances periódicos para tus metas y observa cómo evolucionas a lo largo del tiempo.
*   **Dashboard Interactivo:** Obtén una visión global de tu estado con estadísticas, resúmenes de actividad reciente y gráficos de distribución.
*   **Análisis de Rendimiento:** Profundiza en tus datos con gráficos de tendencias mensuales, comparativas entre categorías y rankings de tus objetivos más y menos exitosos.
*   **Personalización de la Experiencia:** Adapta la aplicación a tus preferencias con soporte para tema claro/oscuro e internacionalización (Español/Inglés).
*   **Gestión Segura de la Cuenta:** Actualiza tu perfil, cambia tu contraseña y gestiona tus datos con opciones de exportación en JSON y eliminación de cuenta.

## 🛠️ Ecosistema Tecnológico

El proyecto está construido sobre un stack tecnológico moderno, robusto y escalable, basado enteramente en JavaScript.

*   **Frontend:**
    *   **React:** Librería principal para construir la interfaz de usuario componentizada.
    *   **React Router:** Para la gestión del enrutamiento en la Single-Page Application (SPA).
    *   **Axios:** Cliente HTTP para la comunicación con la API, con interceptores para la gestión de tokens JWT y errores.
    *   **Chart.js:** Para la creación de los gráficos interactivos del Dashboard y la página de Análisis.
    *   **i18next:** Framework para la internacionalización (i18n).
*   **Backend:**
    *   **Node.js & Express.js:** Entorno de ejecución y framework web para construir la API RESTful.
    *   **Sequelize:** ORM para la interacción con la base de datos, gestionando modelos y relaciones.
    *   **MySQL:** Sistema de gestión de bases de datos relacional para la persistencia de los datos.
*   **Autenticación y Seguridad:**
    *   **JSON Web Tokens (JWT):** Para la gestión de sesiones seguras y sin estado.
    *   **Bcrypt.js:** Para el hasheo y salting de las contraseñas de los usuarios.
    *   **Helmet.js & CORS:** Middlewares de Express para securizar las cabeceras HTTP.
*   **Testing y Calidad:**
    *   **Jest & Supertest:** Para pruebas unitarias y de integración del backend.
    *   **React Testing Library:** Para pruebas unitarias de los componentes de React.
    *   **Cypress:** Para las pruebas End-to-End (E2E) que simulan el flujo de usuario completo.
    *   **ESLint:** Para mantener la consistencia y calidad del código.
*   **Documentación:**
    *   **OpenAPI (Swagger):** Para la documentación interactiva y formal de la API RESTful.

## 🚀 Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu entorno local, sigue los siguientes pasos.

### Prerrequisitos
*   Node.js (versión 18.x o superior)
*   npm (normalmente viene con Node.js)
*   Una instancia de MySQL en ejecución.

### Pasos

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/V1ct0r5/proyecto_web_TFG.git
    cd proyecto_web_TFG
    ```

2.  **Configura las variables de entorno del Backend:**
    *   Navega a la carpeta `/backend`.
    *   Crea una copia del fichero `.env`.
    *   Abre el fichero `.env` y rellena las variables de configuración de tu base de datos MySQL (host, puerto, nombre de usuario, contraseña, nombre de la base de datos) y el secreto para los JWT.

3.  **Instala las dependencias del Backend:**
    ```bash
    cd backend
    npm install
    ```

4.  **Instala las dependencias del Frontend:**
    *   Desde la raíz del proyecto:
    ```bash
    cd frontend/reactapp
    npm install
    ```

5.  **Ejecuta el Backend:**
    *   Desde la carpeta `/backend`:
    ```bash
    node index.js
    ```
    La API estará escuchando en el puerto especificado (ej. `http://localhost:3001`).

6.  **Ejecuta el Frontend:**
    *   Desde la carpeta `/frontend/reactapp` (en una terminal separada):
    ```bash
    npm start
    ```
    La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`.

## 🧪 Pruebas

El proyecto cuenta con una suite completa de pruebas. Para ejecutarlas, sitúate en la **raíz del proyecto** y usa los siguientes comandos:

*   **Ejecutar todas las pruebas (unitarias e integración):**
    ```bash
    npm test
    ```
*   **Ejecutar solo las pruebas unitarias:**
    ```bash
    npm run test:unit
    ```
*   **Ejecutar solo las pruebas de integración:**
    ```bash
    npm run test:integration
    ```
*   **Ejecutar las pruebas End-to-End con Cypress (primero, asegúrate de que tanto el frontend como el backend estén en ejecución):**
    ```bash
    npm run cypress:open
    ```

---

**Desarrollado por Víctor Moreno Bueno** - *TFG Ingeniería del Software 2025*
