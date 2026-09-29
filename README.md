# progra-101-fernando-herrera

1. Hallazgos de Seguridad en CI/CD y Pipeline
[ALTA] Riesgo de ejecución de código en Runner Self-Hosted Windows
Ubicación: .github/workflows/deploy.yml y SETUP.md.   
YML
+ 1

Detalle: El pipeline ejecuta jobs en runs-on: [self-hosted, windows] ante eventos pull_request y push. Un runner autoalojado en una máquina de desarrollo local tiene acceso directo a la red corporativa/hogareña, demonio de Docker y credenciales del host. Modificar scripts o dependencias en un PR puede resultar en compromiso total de la estación de trabajo.   
YML
+ 2

Remediación:

No ejecutar eventos pull_request en runners self-hosted a menos que provengan de forks de estricta confianza y con aprobación manual (environment approval).

Aislar el runner dentro de una máquina virtual efímera o contenedor con red segmentada.

[ALTA] Permiso pull-requests: write a nivel de Workflow
Ubicación: .github/workflows/deploy.yml (permissions: contents: read, pull-requests: write).   
YML

Detalle: Conceder permisos de escritura a nivel global en el flujo de trabajo incrementa el radio de explosión si un paso intermedio (o script de terceros) es vulnerado.   
YML

Remediación: Restringir los permisos únicamente al job que lo requiere (ai-qa para comentar el PR):   
YML

YAML
jobs:
  ai-qa:
    permissions:
      contents: read
      pull-requests: write
[MEDIA] Ausencia de controles SAST y Dependency Scanning (SCA) en el Gate
Ubicación: .github/workflows/deploy.yml.   
YML

Detalle: El pipeline valida tipos (typecheck) y corre Vitest/Playwright, además del agente exploratorio, pero carece de un análisis estático de seguridad (SAST), detección de secretos (GitLeaks/TruffleHog) o escaneo de vulnerabilidades en dependencias (npm audit).   
YML

Remediación: Incorporar antes del build de Docker:   
YML

YAML
- name: Dependency Check
  working-directory: app
  run: npm audit --audit-level=high

- name: TruffleHog OSS
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
2. Hallazgos en Código y Configuración de API (app.ts)
[MEDIA] Ausencia de Headers de Seguridad HTTP y Protección Base
Ubicación: app.ts.   
TS

Detalle: Si bien se desactiva x-powered-by, el servicio no implementa cabeceras HTTP de protección como Content-Security-Policy, X-Content-Type-Options: nosniff, Strict-Transport-Security, ni políticas de Referrer-Policy.   
TS

Remediación: Integrar la librería helmet:

TypeScript
import helmet from "helmet";
app.use(helmet());
[MEDIA] Inexistencia de Rate Limiting contra Abuso / DoS
Ubicación: app.ts.   
TS

Detalle: Aunque el cuerpo JSON está restringido a 100kb (express.json({ limit: "100kb" })), los endpoints como /api/todos o /api/todos/complete-all no cuentan con control de tasa de peticiones (Rate Limit). Un cliente puede agotar recursos de CPU y memoria en operaciones masivas o búsquedas continuas.   
TS

Remediación: Implementar express-rate-limit:

TypeScript
import rateLimit from "express-rate-limit";
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);
3. Front-end y Superficie Web (index.html)
[BAJA] Manejo de Datos y Renderizado Dinámico
Ubicación: index.html.   
HTML

Detalle: En la función renderItem, la inserción de títulos se realiza vía title.textContent = todo.title; y atributos mediante setAttribute, lo cual previene XSS reflejado básico. Sin embargo, no hay política CSP configurada en meta tags ni encabezados. Si en futuras iteraciones se migra a plantillas HTML o innerHTML, la ausencia de sanitización estricta derivará en ejecución arbitraria de script.   
HTML
+ 1

Remediación: Declarar un meta CSP mínimo en index.html:   
HTML

HTML
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';">
4. Configuración de Entornos y Archivos de Control
[INFORMATIVA] Configuración de .gitignore y Artefactos
Ubicación: .gitignore y .gitattributes.   
Desconocido
+ 1

Detalle: .gitignore excluye correctamente variables de entorno (.env, .env.local) y artefactos temporales de QA.   
Desconocido

Mejora recomendada: Asegurar que los reportes de QA (qa-report.json, qa-report.html) no expongan cadenas de depuración que contengan tokens o secretos derivados de respuestas de la API en los artifacts de GitHub Actions.   
YML
+ 1

Plan de Acción Inmediato (Roadmap DevSecOps)
Aislamiento de CI/CD: Restringir permisos de GITHUB_TOKEN a nivel de job y deshabilitar ejecución de PRs no aprobados en el runner local.   
YML
+ 1

Hardening de Express: Añadir helmet y express-rate-limit en createApp().   
TS

Pipeline Gates: Incorporar npm audit y Trivy para escaneo del contenedor Docker generado (docker build) antes del paso deploy-qa.   
YML

Informe de Seguridad Integral: SAST, SCA y DASTProyecto: todo-app (Node.js / TypeScript / Express / CI/CD GitHub Actions)   Alcance: Código fuente de backend y frontend, árbol de dependencias (package-lock.json), configuración de CI/CD (deploy.yml) y superficie de exposición dinámica de la API.   Resumen Ejecutivo de HallazgosTipo de AnálisisSeveridad AltaSeveridad MediaSeveridad Baja / InfoEstado GeneralSAST (Código Estático)122Requiere mejoras en hardening y validación   SCA (Composición de Software)012Sin vulnerabilidades críticas inmediatas; falta automatización   DAST (Comportamiento Dinámico)031Faltan cabeceras de seguridad y control de tasa   1. Análisis Estático de Seguridad (SAST)El análisis SAST evalúa el código fuente (app.ts, index.html), configuraciones y lógica de pipelines en busca de fallos lógicos, inyecciones y malas prácticas de desarrollo.   [ALTA] Ejecución insegura de Pull Requests en Runner Self-HostedUbicación: .github/workflows/deploy.yml (jobs.build, jobs.deploy-qa).   Detalle: El pipeline activa jobs en runs-on: [self-hosted, windows] ante eventos pull_request contra la rama main. Cualquier cambio introducido en scripts o dependencias en un PR se ejecuta directamente con los privilegios del runner en la máquina local o corporativa.   Impacto: Posible movimiento lateral, persistencia en el host o exfiltración de credenciales del runner.   Remediación: Restringir los disparadores de PR para que requieran aprobación manual previa en runners autoalojados o aislar la ejecución en entornos de contenedor efímeros sin acceso a la red interna.   [MEDIA] Ausencia de validación y tipado estricto de esquemas en payloadsUbicación: app.ts.   Detalle: Si bien se define app.use(express.json({ limit: "100kb" })), el middleware no implementa esquemas de validación estructural (como Zod, TypeBox o Joi) antes de derivar la petición al router y al almacén de datos.   Impacto: Procesamiento de atributos no esperados o contaminación de estructuras en memoria si el almacén no filtra exhaustivamente los campos.   Remediación: Incorporar validación formal de esquema en la capa de enrutamiento para asegurar tipos, longitudes mínimas/máximas y descarte de claves ajenas al modelo (stripUnknown).[MEDIA] Exposición de trazas internas en manejador de erroresUbicación: app.ts (console.error("[error] no manejado:", err);).   Detalle: El middleware de captura de errores imprime objetos completos de error sin ofuscación de datos sensibles o sanitización previa en la consola estándar del servidor.   Impacto: Filtración involuntaria de rutas internas del sistema operativo, variables de memoria o detalles de infraestructura en los registros del runner o servicio.   Remediación: Utilizar un logger estructurado que filtre trazas de depuración en entornos no productivos y redacte parámetros confidenciales.[BAJA] Ausencia de Content Security Policy (CSP) en FrontendUbicación: index.html.   Detalle: El cliente renderiza texto usando title.textContent = todo.title; (lo cual previene XSS reflejado básico), pero el archivo HTML carece por completo de directivas <meta http-equiv="Content-Security-Policy"> o encabezados equivalentes.   Impacto: Si se introducen bibliotecas externas o cambios hacia renderizado mediante plantillas en el futuro, no habrá barrera defensiva en profundidad contra inyecciones de script.   Remediación: Declarar una directiva CSP restrictiva en index.html.   2. Análisis de Composición de Software (SCA)El análisis SCA revisa las dependencias declaradas en package.json y resueltas en package-lock.json.   Hallazgos de DependenciasPila de Producción:express: ^5.1.0 (resuelto a 5.2.1 en package-lock.json).   Sub-dependencias analizadas: body-parser: 2.3.0, qs: 6.15.3, path-to-regexp: 8.4.2, serve-static: 2.2.1.   Pila de Desarrollo:playwright: ^1.62.1, vitest: ^4.1.11, tsx: ^4.19.2, typescript: ^5.7.2, supertest: ^7.0.0.   [MEDIA] Falta de verificación automatizada de vulnerabilidades y licencias en el PipelineUbicación: .github/workflows/deploy.yml.   Detalle: El job build ejecuta npm ci, npm run typecheck y npm test, pero no cuenta con un paso que audite el árbol de paquetes contra bases de datos de vulnerabilidades (NVD/GitHub Advisory Database) ni evalúe licencias incompatibles.   Impacto: Incorporación de dependencias con CVEs conocidos sin detección previa al despliegue a QA o Producción.   Remediación: Integrar npm audit y herramientas de escaneo de contenedores/SCA (como Trivy) antes del build de la imagen Docker:   Bashnpm audit --audit-level=high
[BAJA] Uso de versión temprana de Express 5.xUbicación: package.json (express: "^5.1.0").   Detalle: Express 5.x incluye cambios mayores de arquitectura y soporte en comparación con la versión 4.x. Aunque incluye mitigaciones modernas, diversas extensiones y middlewares del ecosistema comunitario aún presentan diferencias de compatibilidad.   Remediación: Mantener fijada la versión mediante lockfile estricto (package-lock.json) y monitorear parches periódicos de seguridad del canal Express.   3. Análisis Dinámico de Seguridad (DAST)El análisis DAST simula la interacción con la aplicación en tiempo de ejecución, analizando la superficie expuesta por los endpoints /api/todos y /version.   [MEDIA] Ausencia de Cabeceras de Hardening HTTPUbicación: app.ts.   Detalle: La aplicación únicamente deshabilita x-powered-by (app.disable("x-powered-by")). No envía cabeceras esenciales de protección web:   X-Frame-Options: DENY / SAMEORIGIN (riesgo de Clickjacking si la app es embebida en un iframe externo).   X-Content-Type-Options: nosniff (previene ataques de MIME-sniffing).   Strict-Transport-Security (HSTS para forzar canales HTTPS seguros).   Impacto: Vulnerabilidad a ataques de manipulación de contexto web en navegadores que interactúan con la API o UI.   Remediación: Implementar el middleware helmet en createApp():   TypeScriptimport helmet from "helmet";
app.use(helmet());
[MEDIA] Ausencia de Limitación de Tasa (Rate Limiting) en Operaciones CríticasUbicación: app.ts y rutas /api/todos.   Detalle: Endpoints con operaciones masivas como POST /api/todos/complete-all y DELETE /api/todos/completed no poseen restricción de tasa por cliente.   Impacto: Un cliente puede emitir solicitudes continuas generando degradación de rendimiento, congestión del evento loop de Node.js o condiciones de denegación de servicio (DoS) a nivel de aplicación.   Remediación: Configurar express-rate-limit con un umbral adecuado para endpoints de lectura y otro más restrictivo para métodos mutables (POST, PATCH, DELETE).   [MEDIA] Ambigüedad en la Negociación de Tipos de Contenido (Content-Type)Ubicación: app.ts.   Detalle: Si un cliente envía una solicitud POST o PATCH con un encabezado Content-Type inesperado o ausente, la aplicación podría procesarlo como vacío o generar respuestas no estandarizadas sin rechazar explícitamente con código 415 Unsupported Media Type.   Impacto: Inconsistencia en la semántica de la API REST y riesgo de bypass de validaciones intermedias de payloads.   Remediación: Forzar que las rutas con cuerpo exijan Content-Type: application/json y respondan 415 ante discrepancias.   [BAJA] Respuestas Informativas en Endpoints de Salud y MetadatosUbicación: Endpoint /version referenciado en index.html y healthRouter.   Detalle: El endpoint expone metadatos como el commit SHA (gitSha) y versión de la aplicación directamente al cliente sin requerir autenticación.   Impacto: Enumeración de versión y correlación directa con commits públicos para identificar si faltan parches específicos.   Remediación: Restringir el acceso a métricas y versiones a nivel de red interna o herramientas de monitoreo de infraestructura.   Plan de Remediación PriorizadoPrioridad 1 (CI/CD): Segregar y aislar los permisos del runner self-hosted para pull requests no confiables en .github/workflows/deploy.yml.   Prioridad 2 (DAST/Hardening): Añadir helmet y express-rate-limit en src/app.ts para cubrir cabeceras defensivas y mitigar abuso por volumen.   Prioridad 3 (SCA): Incluir un paso determinista de npm audit --audit-level=high en la fase build del pipeline.   Prioridad 4 (SAST/Frontend): Declarar políticas CSP estrictas y reforzar validaciones de esquema de datos en las peticiones entrantes.   
