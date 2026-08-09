# 🎬 Common Room | Trabajo Final de Carrera

---

## ✒️ Autores

- **Fenoy Rivas, Delfina**

- **Francano, Ian**

- **Pérez, Lola**

---

## 📌 Descripción General

Common Room es una aplicación web full-stack orientada a la comunidad cinéfila. Permite a los usuarios compartir opiniones, redactar reseñas, valorar películas, crear playlists personalizadas y explorar contenido actualizado proveniente de la API externa TheMovieDB.

El sistema fue desarrollado bajo una arquitectura cliente-servidor desacoplada que combina un backend en **Java 21 + Spring Boot** con un frontend dinámico en **Angular**. Aplica seguridad mediante tokens JWT, persistencia relacional con MySQL, documentación interactiva con OpenAPI/Swagger y metodologías de gestión ágil (Scrum).

Este proyecto constituye el **Trabajo Final de Carrera** de la **Tecnicatura Universitaria en Programación** en la **Universidad Tecnológica Nacional – Facultad Regional Mar del Plata (UTN FRMDP)**.

---

## 🎯 Propósito del Proyecto

La misión de Common Room es ofrecer una plataforma web intuitiva y dinámica en la que los miembros de la comunidad cinéfila puedan interactuar de forma segura. Los objetivos principales incluyen:

- Brindar un catálogo extenso de películas sincronizado mediante una API externa.

- Fomentar el intercambio de opiniones a través de un sistema completo de reseñas y valoraciones.

- Permitir la organización de contenidos mediante la gestión de playlists o listas personalizadas.

- Ofrecer herramientas de administración y moderación para garantizar un entorno comunitario adecuado.

---

## 🌐 Funcionalidades Principales

### 👤 Gestión de Usuarios y Autenticación

- **Registro e Inicio de Sesión:** Autenticación basada en Spring Security y JWT con expiración de 24 horas.

- **Gestión de Perfil:** Edición de biografía, imagen de perfil, cambio de datos y opción de baja de cuenta.

- **Perfiles Públicos:** Exploración de perfiles de otros usuarios con sus reseñas y listas públicas.

### ✍️ Reseñas y Puntuación

- **ABM de Reseñas:** Creación, edición y eliminación de opiniones propias.

- **Puntuación:** Calificaciones numéricas de 0.5 a 5 estrellas.

- **Visualización:** Listado de reseñas por película, por usuario o en el perfil personal.

### 🎬 Películas y Catálogo

- **Consumo de API Externa:** Integración directa con TheMovieDB (TMDB) para fichas técnicas, afiches y sinopsis.

- **Búsqueda y Filtros:** Filtrado dinámico de películas por título, género u otros parámetros con soporte de paginación.

### 📜 Playlists / Listas Personalizadas

- **Gestión de Listas (ABM):** Creación, modificación y eliminación de listas de películas.

- **Organización de Contenido:** Adición y extracción de películas en listas propias.

- **Visibilidad:** Control de privacidad para listas públicas o privadas y buscador de listas comunitarias.

### 🛡️ Moderación y Administración

- **Control de Contenido:** Eliminación de reseñas inadecuadas publicadas por otros usuarios.

- **Sanciones:** Sistema de baneo y desbaneo de miembros, con invalidación de accesos.

- **Filtros de Gestión:** Consulta y filtrado dinámico de usuarios sancionados.

---

## 👥 Roles del Sistema

- **Visitante:** Usuario no autenticado. Puede explorar el catálogo de películas, fichas técnicas, reseñas y playlists públicas.

- **Miembro:** Usuario registrado. Puede gestionar su perfil, publicar y editar reseñas propias, y administrar sus playlists.

- **Moderador:** Usuario con permisos elevados. Puede eliminar reseñas ajenas y gestionar el estado (baneo/desbaneo) de los miembros.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura distribuida tipo C4 (Contenedores):

- **Frontend (App Web):** Desarrollado en Angular (HTML, CSS, TypeScript). Se comunica de forma asíncrona mediante HTTPS/JSON con el backend.

- **Backend (API REST):** Desarrollado en Spring Boot (Java 21). Maneja la lógica de negocio, validaciones, seguridad JWT e integración externa.

- **Base de Datos:** MySQL para la persistencia relacional de usuarios, reseñas, playlists y tokens.

- **API Externa:** Interacción con TheMovieDB para obtener el catálogo de películas.

---

## 🔧 Tecnologías Utilizadas

### 💻 Backend

- **Lenguaje:** Java 21

- **Framework Principal:** Spring Boot 3.4.5

- Spring Web _(Endpoints REST)_

- Spring Data JPA _(ORM / Hibernate)_

- Spring Security _(Autenticación y autorización JWT)_

- Spring Validation _(Validación de entradas)_

- Spring Mail _(Servicio de correo)_

- **Base de Datos:** MySQL conector `mysql-connector-j`

- **Documentación API:** SpringDoc OpenAPI / Swagger UI

- **Utilidades:** Lombok, JJWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`)

### 🖌️ Frontend

- **Framework:** Angular

- **Lenguajes:** TypeScript, HTML5, CSS3

### 🍿 Servicios Externos

- [TheMovieDB API](https://www.themoviedb.org/) _(Consulta de catálogo de cine)_

---

## 📊 Métricas y Estimaciones del Proyecto

- **Puntos de Función Ajustados (PFA):** 141 PFA.

- **Métricas COCOMO:** 6,90 KSLOC totales (5,10 Backend / 1,80 Frontend), esfuerzo estimado de 18,5 meses-persona.

- **Técnica Tres Puntos:** 71 días estimados de desarrollo técnico efectivo.

- **Metodología Ágil:** Desarrollo organizado mediante Scrum, con definición de Product Backlog, Sprints, historias de usuario e indicadores en Jira.

- **Scrum Master:** Delfina Fenoy Rivas

- **Product Owner:** Ian Francano

- **Equipo de Desarrollo:** Lola Pérez

---

## 🏫 Contexto Académico

- **Institución:** Universidad Tecnológica Nacional (UTN) – Facultad Regional Mar del Plata.

- **Carrera:** Tecnicatura Universitaria en Programación.

- **Entregable:** Trabajo Final de Carrera (Tesis Final).

---

## 📄 Licencia

Proyecto desarrollado con fines académicos. Distribución y uso libres con fines educativos.
