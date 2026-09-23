# Inventory System

Sistema de gestión de inventario con arquitectura limpia (Clean Architecture).

## Tecnologías

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Base de datos:** MySQL 8.0
- **Contenedores:** Docker + Docker Compose

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Node.js 18+ (para desarrollo local)

## Inicio rápido con Docker

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd inventory-system

# Copiar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Levantar todos los servicios
docker compose up --build
```

Los servicios estarán disponibles en:

| Servicio  | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:5173  |
| Backend   | http://localhost:3000  |
| MySQL     | localhost:3306         |

## Desarrollo local

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del proyecto

```
inventory-system/
├── backend/          # API REST (Node.js + Express)
│   └── src/
│       ├── domain/           # Entidades y reglas de negocio
│       ├── application/      # Casos de uso
│       ├── infrastructure/   # BD, APIs externas, mail
│       ├── adapters/         # Controllers, rutas
│       ├── config/           # Configuración
│       └── main.js           # Entry point
├── frontend/         # Aplicación web (React + Vite)
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Páginas
│       ├── services/         # Cliente API
│       └── App.jsx           # Componente principal
├── docker-compose.yml
├── mysql-init.sql
└── README.md
```

## Licencia

MIT
