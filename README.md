# WorldCup 2026 — Sistema de Gestión y Predicciones

Plataforma web full stack para gestionar el Mundial FIFA 2026 (48 selecciones, 12 grupos) y generar **predicciones con inteligencia artificial**. Incluye gestión de partidos y resultados, tabla de posiciones, cuadro de eliminatorias, simulación de partidos en tiempo real y un servicio predictivo independiente.

> Proyecto académico desarrollado en equipo de 4 personas con metodología ágil (Scrum).

## Funcionalidades

- **Autenticación y roles:** registro, login con credenciales y Google OAuth, sesión con JWT, perfiles de administrador y usuario.
- **Tabla de posiciones:** grupos A–L con cálculo automático de puntos, diferencia de goles y clasificados.
- **Eliminatorias:** cuadro desde dieciseisavos hasta la final, con definición por penales.
- **Partidos en vivo:** simulación multipartido con eventos (goles, tarjetas, penales, etc.) emitidos por WebSockets.
- **Notificaciones en tiempo real:** aviso de partido programado, actualizado o iniciado, con redirección al módulo.
- **Estadísticas por partido:** posesión, tiros, xG, corners, faltas y línea de eventos.
- **Predicción de partido:** probabilidad de victoria/empate y explicación en español generada por IA.
- **Predicción de campeón:** campeón y top 4 con nivel de confianza.
- **Historial por usuario** de predicciones.
- **Log de auditoría** de acciones administrativas y de predicciones.

## 🧱 Arquitectura

```
Angular (4200) ──HTTP/WebSocket──▶ Node.js + Express (3000) ──▶ SQL Server
                                          │
                                          └──HTTP──▶ Spring Boot (8080, Docker) ──▶ MySQL
                                                           │
                                                           └──▶ Proveedores de IA (OpenAI / Gemini)
```

- **Frontend:** Angular 16, TypeScript, RxJS, SCSS, Bootstrap Icons, ngx-toastr, Socket.IO client.
- **Backend principal:** Node.js, Express, Socket.IO, node-cron, JWT, bcryptjs; arquitectura en capas (rutas → servicios → repositorios).
- **Servicio predictivo:** Java 21, Spring Boot, JPA/Hibernate, MapStruct, Lombok.
- **Datos:** SQL Server (torneo) y MySQL 8.4 (estadísticas y predicciones).
- **Infraestructura:** Docker y Docker Compose.

**Patrones aplicados:** Singleton y Observer (servicios Angular con RxJS), Repository (backend), Strategy (`LLMProvider` para intercambiar OpenAI/Gemini), DTO/Mapper.

## Modelo predictivo

El puntaje de cada equipo combina 70 % tasa de victorias y 30 % promedio de goles. La probabilidad de empate es dinámica (mayor cuando los equipos son parejos). Un modelo de lenguaje (OpenAI `gpt-4.1-mini`) redacta la explicación; Gemini está integrado mediante la misma interfaz.

## 👥 Equipo

| Rol | Integrante |
| --- | --- |
| Scrum Master | Nicolas Casas Bedoya |
| Arquitecto de software | Eduar Stiven Jiménez Arias |
| Backend y base de datos | Jeisson Arley Osorio Llanos |
| Frontend | Diego Felipe García Giraldo |

### Mi aporte (Frontend)

- Diseño y desarrollo de la aplicación Angular modular (auth, dashboard, configuración, predicciones).
- Guards de autenticación y de administrador; menú lateral adaptado al rol.
- Servicios reactivos con RxJS y servicio de WebSockets.
- Notificaciones globales en tiempo real con modal y navegación.
- Tabla de posiciones, cuadro de eliminatorias con penales y vista en vivo.
- Módulos de predicción (partido, campeón e historial) e integración con las APIs.
- Corrección de zona horaria en fechas y mejoras de usabilidad a partir de pruebas con usuarios.

## Ejecución local

**Requisitos:** Node.js, Angular CLI, Docker, SQL Server.

```bash
# 1. Servicio predictivo y MySQL
docker-compose up --build

# 2. Backend Node.js
cd BackEnd
npm install
npm run dev

# 3. Frontend Angular
cd WorldCup26
npm install
ng serve
```

Configura las variables de entorno en un archivo `.env` (no versionado): conexión a SQL Server, `SECRET_KEY` de JWT, `GOOGLE_CLIENT_ID`, y para el servicio predictivo la conexión a MySQL, `LLM_PROVIDER`, `OPENAI_API_KEY`, `GEMINI_API_KEY` y los modelos.

> Nunca subas claves ni contraseñas al repositorio.


## Trabajo futuro

- Avance automático de equipos entre fases eliminatorias.
- Respaldo automático entre proveedores de IA.
- Pruebas automatizadas y gestor de secretos.

## 📄 Licencia

Proyecto con fines académicos.
