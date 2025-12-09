# GarageManager - Configuration Multi-Environnements

## 📋 Vue d'ensemble

Ce projet utilise 3 environnements distincts :

| Environnement | Backend Port | Frontend Port | Database Port | Profil Spring | Profil Angular |
|---------------|--------------|---------------|---------------|---------------|----------------|
| **Development** | 8090 | 8050 | 5432 | `dev` | `development` |
| **Staging** | 8091 | 8051 | 5433 | `staging` | `staging` |
| **Production** | 8090 | 8050 | 5432 | `prod` | `production` |

---

## 🚀 Démarrage rapide

### Développement (Local)

```bash
# Backend - Lancer avec le profil dev
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend - Lancer en mode dev
cd frontend
npm run start:dev
```

### Docker - Développement

```bash
cd backend/docker/dev
docker-compose --env-file .env.dev -f docker-compose-dev.yml up -d
```

### Docker - Staging

```bash
cd backend/docker/staging
docker-compose --env-file .env.staging -f docker-compose-staging.yml up -d
```

### Docker - Production

```bash
cd backend/docker/prod
docker-compose --env-file .env.prod -f docker-compose.yml up -d
```

---

## 🏗️ Build des images Docker

### Backend

```bash
cd backend

# Build pour dev
docker build -t garage-backend:dev .

# Build pour staging
docker build -t garage-backend:staging .

# Build pour production
docker build -t garage-backend:latest .
```

### Frontend

```bash
cd frontend

# Build pour dev
docker build --build-arg PROFILE=dev -t garage-frontend:dev .

# Build pour staging
docker build --build-arg PROFILE=staging -t garage-frontend:staging .

# Build pour production
docker build --build-arg PROFILE=production -t garage-frontend:latest .
```

---

## 📁 Structure des fichiers de configuration

### Backend (Spring Boot)

```
backend/src/main/resources/
├── application.properties          # Configuration de base
├── application-dev.properties      # Développement (logs verbose, ddl-auto=update)
├── application-staging.properties  # Staging (logs modérés)
└── application-prod.properties     # Production (optimisé, logs minimaux)
```

### Frontend (Angular)

```
frontend/src/environments/
├── environment.ts                  # Fichier de base (remplacé au build)
├── environment.development.ts      # Développement (apiUrl: localhost)
├── environment.staging.ts          # Staging (apiUrl: staging server)
└── environment.production.ts       # Production (apiUrl: prod server)
```

### Docker

```
backend/docker/
├── dev/
│   ├── docker-compose-dev.yml
│   └── .env.dev
├── staging/
│   ├── docker-compose-staging.yml
│   └── .env.staging
├── prod/
│   ├── docker-compose.yml
│   └── .env.prod
└── .env.example                    # Template pour les variables
```

---

## ⚙️ Variables d'environnement

### Backend

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SPRING_PROFILES_ACTIVE` | Profil actif (dev/staging/prod) | `dev` |
| `PGHOST` | Hôte PostgreSQL | `localhost` |
| `PGPORT` | Port PostgreSQL | `5432` |
| `PGDATABASE` | Nom de la base | `garage_manager` |
| `PGUSER` | Utilisateur | `gm_user` |
| `PGPASSWORD` | Mot de passe | - |

### Frontend

Les variables sont intégrées au build via les fichiers `environment.*.ts`.

---

## 🔧 Scripts NPM disponibles

```bash
# Développement
npm run start:dev      # Serveur de dev avec config development
npm run build:dev      # Build pour dev

# Staging
npm run start:staging  # Serveur de dev avec config staging
npm run build:staging  # Build pour staging

# Production
npm run start:prod     # Serveur de dev avec config production
npm run build:prod     # Build pour production (optimisé)
```

---

## ⚠️ Sécurité

1. **Ne jamais committer** les fichiers `.env` contenant des vrais mots de passe
2. Utiliser `.env.example` comme template
3. En production, utiliser des secrets managés (Docker Secrets, Vault, etc.)
4. Changer les mots de passe par défaut avant tout déploiement

