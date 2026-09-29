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
