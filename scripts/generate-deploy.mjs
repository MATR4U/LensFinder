#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { envPath: path.join(repoRoot, '.env') };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--env' || a === '--env-path') {
      out.envPath = path.resolve(process.cwd(), args[i + 1]);
      i += 1;
    }
  }
  return out;
}

function get(env, key, fallback = '') {
  const v = env[key] ?? process.env[key] ?? fallback;
  return String(v);
}

function ensureDir(p) {
  return fs.mkdir(p, { recursive: true });
}

async function writeFileIfChanged(target, content) {
  const current = await fs.readFile(target, 'utf8').catch(() => null);
  if (current !== content) {
    await fs.writeFile(target, content, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`wrote ${path.relative(repoRoot, target)}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`unchanged ${path.relative(repoRoot, target)}`);
  }
}

function makeDockerComposeClient(env) {
  const VITE_API_BASE_URL = get(env, 'VITE_API_BASE_URL', '');
  const CLIENT_PORT = get(env, 'CLIENT_PORT', '3000');
  return `services:\n  client:\n    build:\n      context: ./client\n      dockerfile: Dockerfile\n      args:\n        VITE_API_BASE_URL: ${JSON.stringify(VITE_API_BASE_URL)}\n    image: lensfinder-client:latest\n    container_name: lensfinder-client\n    restart: unless-stopped\n    ports:\n      - "${CLIENT_PORT}:3000"\n`;
}

function makeDockerComposeServer(env, envFileName) {
  const DATABASE_URL = get(env, 'DATABASE_URL', 'postgres://lens:lens@postgres:5432/lensfinder');
  const PORT = get(env, 'PORT', '3001');
  return `services:\n  server:\n    build:\n      context: .\n      dockerfile: server/Dockerfile\n    image: lensfinder-server:latest\n    container_name: lensfinder-server\n    restart: unless-stopped\n    env_file:\n      - ${envFileName}\n    environment:\n      NODE_ENV: production\n      DATABASE_URL: ${JSON.stringify(DATABASE_URL)}\n    ports:\n      - "${PORT}:${PORT}"\n`;
}

function makeDockerComposeDb(env, envFileName) {
  const POSTGRES_DB = get(env, 'POSTGRES_DB', 'lensfinder');
  const POSTGRES_USER = get(env, 'POSTGRES_USER', 'lens');
  const POSTGRES_PASSWORD = get(env, 'POSTGRES_PASSWORD', 'lens');
  const POSTGRES_PORT = get(env, 'POSTGRES_PORT', '5432');
  const PGADMIN_DEFAULT_EMAIL = get(env, 'PGADMIN_DEFAULT_EMAIL', 'admin@example.com');
  const PGADMIN_DEFAULT_PASSWORD = get(env, 'PGADMIN_DEFAULT_PASSWORD', 'lenspass');
  const PGADMIN_PORT = get(env, 'PGADMIN_PORT', '5050');
  return `services:\n  postgres:\n    image: postgres:16-alpine\n    container_name: lensfinder-postgres\n    restart: unless-stopped\n    env_file:\n      - ${envFileName}\n    environment:\n      POSTGRES_DB: ${JSON.stringify(POSTGRES_DB)}\n      POSTGRES_USER: ${JSON.stringify(POSTGRES_USER)}\n      POSTGRES_PASSWORD: ${JSON.stringify(POSTGRES_PASSWORD)}\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB\"]\n      interval: 5s\n      timeout: 5s\n      retries: 10\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    ports:\n      - \"${POSTGRES_PORT}:5432\"\n\n  pgadmin:\n    image: dpage/pgadmin4:9.6\n    container_name: lensfinder-pgadmin\n    restart: unless-stopped\n    env_file:\n      - ${envFileName}\n    environment:\n      PGADMIN_DEFAULT_EMAIL: ${JSON.stringify(PGADMIN_DEFAULT_EMAIL)}\n      PGADMIN_DEFAULT_PASSWORD: ${JSON.stringify(PGADMIN_DEFAULT_PASSWORD)}\n      PGADMIN_CONFIG_SERVER_MODE: 'False'\n    ports:\n      - \"${PGADMIN_PORT}:80\"\n    volumes:\n      - pgadmin:/var/lib/pgadmin\n\nvolumes:\n  pgdata:\n  pgadmin:\n`;
}

function makeDockerComposeRoot() {
  return `services:\n  client:\n    extends:\n      file: docker-compose.client.yml\n      service: client\n\n  server:\n    extends:\n      file: docker-compose.server.yml\n      service: server\n    depends_on:\n      - postgres\n\n  postgres:\n    extends:\n      file: docker-compose.db.yml\n      service: postgres\n\n  pgadmin:\n    extends:\n      file: docker-compose.db.yml\n      service: pgadmin\n\nvolumes:\n  pgdata:\n    external: false\n  pgadmin:\n    external: false\n`;
}

function makeK8sPostgres(env) {
  const POSTGRES_DB = get(env, 'POSTGRES_DB', 'lensfinder');
  const POSTGRES_USER = get(env, 'POSTGRES_USER', 'lens');
  const POSTGRES_PASSWORD = get(env, 'POSTGRES_PASSWORD', 'lens');
  const STORAGE = get(env, 'POSTGRES_STORAGE', '1Gi');
  return `apiVersion: v1\nkind: Secret\nmetadata:\n  name: postgres-secret\ntype: Opaque\nstringData:\n  POSTGRES_DB: ${JSON.stringify(POSTGRES_DB)}\n  POSTGRES_USER: ${JSON.stringify(POSTGRES_USER)}\n  POSTGRES_PASSWORD: ${JSON.stringify(POSTGRES_PASSWORD)}\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: postgres-pvc\nspec:\n  accessModes: [\"ReadWriteOnce\"]\n  resources:\n    requests:\n      storage: ${STORAGE}\n---\napiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: postgres\nspec:\n  serviceName: postgres\n  replicas: 1\n  selector:\n    matchLabels:\n      app: postgres\n  template:\n    metadata:\n      labels:\n        app: postgres\n    spec:\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          ports:\n            - containerPort: 5432\n          envFrom:\n            - secretRef:\n                name: postgres-secret\n          volumeMounts:\n            - name: data\n              mountPath: /var/lib/postgresql/data\n      volumes:\n        - name: data\n          persistentVolumeClaim:\n            claimName: postgres-pvc\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: postgres\nspec:\n  selector:\n    app: postgres\n  ports:\n    - port: 5432\n      targetPort: 5432\n`;
}

function makeK8sServer(env) {
  const NODE_ENV = get(env, 'NODE_ENV', 'production');
  const PORT = get(env, 'PORT', '3001');
  const DATABASE_URL = get(env, 'DATABASE_URL', 'postgres://lens:lens@postgres:5432/lensfinder');
  return `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: server-config\ndata:\n  NODE_ENV: ${JSON.stringify(NODE_ENV)}\n  PORT: ${JSON.stringify(PORT)}\n---\napiVersion: v1\nkind: Secret\nmetadata:\n  name: server-secret\ntype: Opaque\nstringData:\n  DATABASE_URL: ${JSON.stringify(DATABASE_URL)}\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: server\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: server\n  template:\n    metadata:\n      labels:\n        app: server\n    spec:\n      containers:\n        - name: server\n          image: lensfinder-server:latest\n          imagePullPolicy: IfNotPresent\n          envFrom:\n            - configMapRef:\n                name: server-config\n            - secretRef:\n                name: server-secret\n          ports:\n            - containerPort: ${PORT}\n          readinessProbe:\n            httpGet:\n              path: /api/health\n              port: ${PORT}\n            initialDelaySeconds: 5\n            periodSeconds: 5\n          livenessProbe:\n            httpGet:\n              path: /api/health\n              port: ${PORT}\n            initialDelaySeconds: 15\n            periodSeconds: 10\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: server\nspec:\n  selector:\n    app: server\n  ports:\n    - port: ${PORT}\n      targetPort: ${PORT}\n`;
}

function makeK8sClient(env) {
  const CLIENT_PORT = get(env, 'CLIENT_PORT', '3000');
  return `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: client\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: client\n  template:\n    metadata:\n      labels:\n        app: client\n    spec:\n      containers:\n        - name: client\n          image: lensfinder-client:latest\n          imagePullPolicy: IfNotPresent\n          ports:\n            - containerPort: ${CLIENT_PORT}\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: client\nspec:\n  selector:\n    app: client\n  ports:\n    - port: ${CLIENT_PORT}\n      targetPort: ${CLIENT_PORT}\n`;
}

function makeK8sRedis(env) {
  return `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: redis\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: redis\n  template:\n    metadata:\n      labels:\n        app: redis\n    spec:\n      containers:\n        - name: redis\n          image: redis:7\n          ports:\n            - containerPort: 6379\n          args: [\"--save\", \"\", \"--appendonly\", \"no\"]\n          securityContext:\n            allowPrivilegeEscalation: false\n            readOnlyRootFilesystem: true\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: redis\nspec:\n  selector:\n    app: redis\n  ports:\n    - name: tcp\n      port: 6379\n      targetPort: 6379\n`;
}

function makeK8sIngress(env) {
  const host = get(env, 'INGRESS_HOST', 'lensfinder.local');
  const portClient = 3000;
  const portServer = get(env, 'PORT', '3001');
  return `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: lensfinder\n  annotations:\n    kubernetes.io/ingress.class: nginx\nspec:\n  rules:\n    - host: ${host}\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: client\n                port:\n                  number: ${portClient}\n          - path: /api\n            pathType: Prefix\n            backend:\n              service:\n                name: server\n                port:\n                  number: ${portServer}\n`;
}

async function main() {
  const { envPath } = parseArgs();
  dotenv.config({ path: envPath });
  const envFileName = path.basename(envPath);
  const env = process.env;

  // Docker Compose files
  const cicdDockerDir = path.join(repoRoot, 'infra', 'docker');
  await ensureDir(cicdDockerDir);
  await writeFileIfChanged(path.join(cicdDockerDir, 'docker-compose.client.yml'), makeDockerComposeClient(env));
  await writeFileIfChanged(path.join(cicdDockerDir, 'docker-compose.server.yml'), makeDockerComposeServer(env, envFileName));
  await writeFileIfChanged(path.join(cicdDockerDir, 'docker-compose.db.yml'), makeDockerComposeDb(env, envFileName));
  await writeFileIfChanged(path.join(cicdDockerDir, 'docker-compose.yml'), makeDockerComposeRoot());

  // Kubernetes files
  const k8sDir = path.join(repoRoot, 'infra', 'k8s');
  await ensureDir(k8sDir);
  await writeFileIfChanged(path.join(k8sDir, 'namespace.yaml'), `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: lensfinder\n`);
  await writeFileIfChanged(path.join(k8sDir, 'postgres.yaml'), makeK8sPostgres(env));
  await writeFileIfChanged(path.join(k8sDir, 'server.yaml'), makeK8sServer(env));
  await writeFileIfChanged(path.join(k8sDir, 'client.yaml'), makeK8sClient(env));
  await writeFileIfChanged(path.join(k8sDir, 'ingress.yaml'), makeK8sIngress(env));
  await writeFileIfChanged(path.join(k8sDir, 'redis.yaml'), makeK8sRedis(env));
  await writeFileIfChanged(path.join(k8sDir, 'server-monitor.yaml'), `apiVersion: monitoring.coreos.com/v1\nkind: ServiceMonitor\nmetadata:\n  name: server-monitor\n  labels:\n    release: prometheus\nspec:\n  selector:\n    matchLabels:\n      app: server\n  endpoints:\n    - port: http\n      path: /metrics\n      interval: 30s\n  namespaceSelector:\n    any: true\n`);
  await writeFileIfChanged(path.join(k8sDir, 'kustomization.yaml'), `apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nnamespace: lensfinder\nresources:\n  - namespace.yaml\n  - postgres.yaml\n  - server.yaml\n  - client.yaml\n  - ingress.yaml\n  - redis.yaml\n  - server-monitor.yaml\n`);

  // eslint-disable-next-line no-console
  console.log('\nGenerated deployment assets from', path.relative(repoRoot, envPath));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


