### 🔹 Backend - API REST
Scalar ([text](https://dashboard.scalar.com/))

#### Modelos de Base de Datos (MongoDB + Mongoose)
* [x] **User**: perfil, preferencias, configuración, karma/reputación.
* [ ] **Book**: referencia a Open Library + metadata local + estadísticas comunidad.
* [ ] **UserBook**: relación usuario-libro (estado: leyendo/leído/quiero leer, progreso, fechas).
* [ ] **Review**: reseñas con rating, spoiler flag, likes.
* [ ] **Quote**: citas guardadas con página, libro, reacciones.
* [ ] **Achievement**: logros/badges del sistema.
* [ ] **UserAchievement**: logros desbloqueados por usuario con fecha.
* [ ] **ReadingChallenge**: retos activos (mensuales, por género, etc.).
* [ ] **Club**: clubes de lectura con miembros, libro actual, cronograma.
* [ ] **Notification**: sistema de notificaciones en tiempo real.

#### Endpoints Esenciales MVP

**Autenticación** (`/api/auth`)
* [x] POST `/register` → Registro con Auth0.
* [x] POST `/login` → Login con Auth0.
* [x] POST `/logout` → Cerrar sesión.
* [x] GET `/me` → Obtener usuario autenticado.
* [x] PUT `/me` → Actualizar perfil de usuario autenticado.

**Usuarios** (`/api/users`)
* [ ] GET `/:id` → Perfil público de usuario.
* [ ] PUT `/:id` → Actualizar perfil.
* [ ] GET `/:id/stats` → Estadísticas de lectura.
* [ ] GET `/:id/achievements` → Logros desbloqueados.
* [ ] POST `/:id/follow` → Seguir usuario.
* [ ] DELETE `/:id/unfollow` → Dejar de seguir.
* [ ] GET `/:id/followers` → Lista de seguidores.
* [ ] GET `/:id/following` → Lista de seguidos.

**Libros** (`/api/books`)
* [ ] GET `/search` → Buscar en Open Library API.
* [ ] GET `/:id` → Detalle de libro + stats comunidad.
* [ ] GET `/:id/quotes` → Citas populares del libro.
* [ ] GET `/:id/reviews` → Reseñas con filtros y paginación.
* [ ] GET `/trending` → Libros en tendencia en la plataforma.

**Mi Biblioteca** (`/api/my-books`)
* [ ] GET `/` → Mis libros (todos los estados).
* [ ] POST `/` → Añadir libro a mi biblioteca.
* [ ] PUT `/:id` → Actualizar estado/progreso.
* [ ] DELETE `/:id` → Eliminar de biblioteca.
* [ ] GET `/reading` → Libros que estoy leyendo.
* [ ] GET `/finished` → Libros terminados.
* [ ] GET `/wishlist` → Lista de deseos.

**Reseñas** (`/api/reviews`)
* [ ] POST `/` → Crear reseña.
* [ ] PUT `/:id` → Editar reseña.
* [ ] DELETE `/:id` → Eliminar reseña.
* [ ] POST `/:id/helpful` → Marcar reseña como útil.
* [ ] POST `/:id/report` → Reportar reseña inapropiada.

**Citas** (`/api/quotes`)
* [ ] POST `/` → Guardar cita de un libro.
* [ ] GET `/book/:bookId` → Citas de un libro específico.
* [ ] GET `/user/:userId` → Citas guardadas por usuario.
* [ ] POST `/:id/react` → Reaccionar a cita (❤️, 💡, 😢, 🔥).
* [ ] DELETE `/:id` → Eliminar cita propia.
* [ ] GET `/feed` → Feed de citas de usuarios seguidos.

**Logros/Gamificación** (`/api/achievements`)
* [ ] GET `/all` → Todos los logros disponibles.
* [ ] GET `/user/:id` → Logros del usuario.
* [ ] POST `/check` → Sistema verifica y desbloquea logros (automático).
* [ ] GET `/user/:id/streak` → Racha de lectura actual.

**Retos de Lectura** (`/api/challenges`)
* [ ] GET `/active` → Retos activos (mensuales, anuales).
* [ ] POST `/:id/join` → Unirse a un reto.
* [ ] GET `/user/:id` → Retos del usuario + progreso.
* [ ] GET `/leaderboard/:challengeId` → Ranking del reto.

**Clubes de Lectura** (`/api/clubs`)
* [ ] POST `/` → Crear club (público/privado).
* [ ] GET `/:id` → Detalle del club.
* [ ] POST `/:id/join` → Solicitar unirse.
* [ ] POST `/:id/leave` → Abandonar club.
* [ ] GET `/:id/members` → Miembros del club.
* [ ] PUT `/:id/current-book` → Establecer libro actual (admin).
* [ ] POST `/:id/discussions` → Crear hilo de discusión.
* [ ] GET `/:id/discussions` → Ver discusiones del club.

**Feed Social** (`/api/feed`)
* [ ] GET `/` → Feed personalizado (actividad de seguidos).
* [ ] GET `/global` → Feed global de la plataforma.

**Notificaciones** (`/api/notifications`)
* [ ] GET `/` → Todas las notificaciones del usuario.
* [ ] PUT `/:id/read` → Marcar como leída.
* [ ] PUT `/read-all` → Marcar todas como leídas.
* [ ] GET `/unread-count` → Contador de no leídas.

**Estadísticas** (`/api/stats`)
* [ ] GET `/user/:id/reading-pace` → Páginas por día/hora.
* [ ] GET `/user/:id/yearly-report` → Resumen anual (Wrapped).
* [ ] GET `/user/:id/genre-distribution` → Distribución por géneros.
* [ ] GET `/user/:id/reading-activity` → Heatmap de actividad.
* [ ] GET `/platform` → Estadísticas globales de la plataforma.

#### Middleware y Servicios
* [x] **authMiddleware**: Verificar JWT/Auth0 token.
* [ ] **achievementService**: Lógica para desbloquear logros automáticamente.
* [ ] **notificationService**: Crear y enviar notificaciones.
* [ ] **recommendationService**: Algoritmo básico de recomendaciones.
* [x] **errorHandler**: Manejo centralizado de errores.
* [x] **rateLimiter**: Protección contra abuso de API.
