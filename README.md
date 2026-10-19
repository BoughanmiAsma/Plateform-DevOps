<div align="center">

# 🚀 SmartIT DevOps Platform

**An enterprise-grade, full-stack DevOps management platform** that centralizes CI/CD pipelines, container orchestration, infrastructure monitoring, cost management, and security — all in one unified interface.

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-24.0.1-4D4D4D?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Infrastructure Services](#-infrastructure-services)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Frontend Pages](#-frontend-pages)
- [Security](#-security)
- [Monitoring & Observability](#-monitoring--observability)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🌟 Overview

The **SmartIT DevOps Platform** is a comprehensive, production-ready DevOps management solution built with a **modular hexagonal (Clean) architecture**. It provides development and operations teams with a single pane of glass to manage the entire software delivery lifecycle — from project creation and pipeline execution to cost tracking and infrastructure observability.

The platform integrates best-in-class open-source DevOps tools (Jenkins, SonarQube, Nexus, Prometheus, ArgoCD) and exposes them through a modern React dashboard secured by Keycloak OAuth2/JWT authentication.

---

## ✨ Key Features

### 🔧 CI/CD Pipeline Management
- Create, associate, and manage Jenkins pipelines directly from the UI
- **Trigger builds** with dynamic parameters via a dedicated Run Build modal
- **Real-time build status tracking** using Jenkins webhooks + frontend polling (every 4 seconds)
- View execution history with statuses: `RUNNING`, `SUCCESS`, `FAILURE`, `ABORTED`
- Automatic polling stops when the build completes (up to a 5-minute safety cap)

### 🐳 Docker Management
- Full Docker container lifecycle management (start, stop, inspect, remove)
- Pull and manage Docker images
- Real-time container stats and log streaming
- Direct integration with the Docker socket via the Docker Java Client

### ☸️ Kubernetes / ArgoCD Integration
- Manage Kubernetes workloads through the Fabric8 Kubernetes Client
- ArgoCD application deployment and synchronization support

### 📊 Monitoring & Observability
- Integrated **Prometheus** metrics scraping via Spring Boot Actuator (`/actuator/prometheus`)
- **Custom MetricChart** component for visualizing time-series data
- Full **Observability Report** page with infrastructure health summaries
- Alert management via Alertmanager

### 💰 FinOps (Cloud Cost Management)
- Dedicated **FinOps dashboard** for cloud resource cost tracking
- **FinOps Report** with exportable cost breakdown views
- Environment-aware cost filtering (Global, Dev, Staging, Production)

### 🔔 Real-time Notifications
- Server-side notification system with **read/unread tracking**
- Slide-in notification panel with mark-all-read support
- Polling-based updates every 30 seconds

### 🛡️ Security & Authentication
- Full **Keycloak 24** integration with OAuth2/JWT
- Spring Security resource server with JWT validation
- Realm: `devops-platform` — protected routes, role-based access
- Frontend initialized with `login-required` flow

### 🎨 Modern UI/UX
- **Dark/Light mode** toggle with persistent theme state
- Environment switcher (Global / Dev / Staging / Production)
- Responsive sidebar navigation with intuitive iconography
- Modal-driven project and pipeline management

---

## 🏗️ Architecture

The backend follows a **Hexagonal (Ports & Adapters) Architecture** — each domain module is self-contained with clean separation of concerns:

```
src/main/java/com/smartit/devops_platform/
├── argocd/             # ArgoCD integration module
│   ├── application/    # Use cases & application services
│   ├── domain/         # Domain entities & interfaces (ports)
│   ├── infrastructure/ # Adapters (repositories, external clients)
│   └── presentation/   # REST controllers & DTOs
│
├── cicd/               # CI/CD pipeline orchestration
├── config/             # Security (Keycloak/OAuth2) & CORS configuration
├── docker/             # Docker lifecycle management
├── event/              # Domain event handling
├── finops/             # Cost management & FinOps reporting
├── notification/       # Real-time notification system
├── observability/      # Metrics, health, and monitoring
├── pipeline/           # Jenkins pipeline + webhook receiver
├── project/            # Project & resource management
└── shared/             # Cross-cutting utilities & base classes
```

**Communication:** Domain events propagate asynchronously via **RabbitMQ (AMQP)**, decoupling modules and enabling reactive workflows (e.g., build completion → notification trigger).

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 3.2.5 | Application framework |
| Spring Web | — | REST API layer |
| Spring Data JPA | — | ORM & persistence |
| Spring Security | — | Authentication & authorization |
| Spring AMQP | — | RabbitMQ messaging |
| Spring Actuator | — | Health & metrics endpoints |
| PostgreSQL | Latest | Relational database |
| Micrometer Prometheus | — | Metrics registry |
| Docker Java Client | 3.3.6 | Docker API integration |
| Fabric8 Kubernetes Client | 6.10.0 | Kubernetes API integration |
| Lombok | 1.18.32 | Boilerplate reduction |
| OAuth2 Resource Server | — | JWT token validation |

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool & dev server |
| Keycloak JS (`@react-keycloak/web`) | OAuth2 authentication |
| Custom Hooks (`useNotifications`) | Notification polling logic |
| Vanilla CSS | Styling with dark/light theme support |

---

## 🐳 Infrastructure Services

All supporting services are orchestrated via **Docker Compose** on a shared `devops-network`:

| Service | Image | Port(s) | Purpose |
|---|---|---|---|
| **Jenkins** | Custom (`Dockerfile.jenkins`) | `8085:8080`, `50000` | CI/CD automation server |
| **SonarQube** | `sonarqube:community` | `9000:9000` | Static code analysis |
| **RabbitMQ** | `rabbitmq:3-management` | `5672`, `15672` | Message broker + management UI |
| **Nexus** | `sonatype/nexus3:latest` | `8081`, `8082` | Artifact repository manager |
| **Prometheus** | `prom/prometheus:latest` | `9090:9090` | Metrics collection & alerting |
| **Keycloak** | `keycloak:24.0.1` | `8180:8080` | Identity & access management |

### Start the full stack

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

---

## 📁 Project Structure

```
plateformdevops/
├── frontend/                         # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── MetricChart.jsx       # Time-series chart component
│       │   ├── Navbar.jsx            # Top navigation bar
│       │   ├── NotificationPanel.jsx # Slide-in notification drawer
│       │   ├── ProjectModal.jsx      # Create/associate project modal
│       │   ├── RunBuildModal.jsx     # Pipeline execution modal
│       │   └── Sidebar.jsx           # Navigation sidebar
│       ├── hooks/
│       │   └── useNotifications.js   # Notification polling hook (30s)
│       ├── pages/
│       │   ├── Dashboard.jsx         # Main overview dashboard
│       │   ├── Deployments.jsx       # Deployment tracking
│       │   ├── Docker.jsx            # Docker management UI
│       │   ├── FinOps.jsx            # Cost management dashboard
│       │   ├── Monitoring.jsx        # Infrastructure monitoring
│       │   ├── Plugins.jsx           # Plugin management
│       │   ├── Projects.jsx          # Project & pipeline management
│       │   └── reports/
│       │       ├── FinOpsReport.jsx        # Cost report
│       │       └── ObservabilityReport.jsx # Observability report
│       ├── services/
│       │   └── api.js                # Axios API client (all endpoints)
│       ├── keycloak.js               # Keycloak client configuration
│       └── App.jsx                   # Root component + routing logic
│
├── src/                              # Spring Boot backend
│   └── main/
│       ├── java/com/smartit/devops_platform/
│       │   └── [hexagonal modules]
│       └── resources/
│           └── application.properties
│
├── infrastructure/
│   ├── keycloak/                     # Realm export (auto-imported on start)
│   └── prometheus/
│       └── prometheus.yml            # Prometheus scrape configuration
│
├── prometheus/
│   └── alertmanager.yml              # Alertmanager configuration
│
├── docker-compose.yml                # Full infrastructure stack
├── Dockerfile.jenkins                # Custom Jenkins image with Docker CLI
└── pom.xml                           # Maven build configuration
```

---

## ✅ Prerequisites

Before running this project, ensure you have the following installed:

| Tool | Minimum Version |
|---|---|
| **Java JDK** | 17+ |
| **Maven** | 3.8+ |
| **Node.js** | 18+ |
| **npm** | 9+ |
| **Docker** | 24+ |
| **Docker Compose** | 2.x |
| **PostgreSQL** | 14+ |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:BoughanmiAsma/Plateform-DevOps.git
cd Plateform-DevOps
```

### 2. Start infrastructure services

```bash
docker-compose up -d
```

> Wait for all services to be healthy, especially **Keycloak** and **RabbitMQ** (can take 30–60 seconds on first boot).

### 3. Set up the PostgreSQL database

```sql
CREATE DATABASE devopsdb;
```

### 4. Configure the backend

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/devopsdb
spring.datasource.username=your_username
spring.datasource.password=your_password

jenkins.base-url=http://localhost:8085
jenkins.username=your_jenkins_user
jenkins.api-token=your_jenkins_api_token
```

### 5. Run the backend

```bash
./mvnw spring-boot:run
```

The API will be available at: **`http://localhost:8080`**

### 6. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at: **`http://localhost:5173`**

### 7. Authenticate

Navigate to `http://localhost:5173` — you will be automatically redirected to **Keycloak** for login.

> Default Keycloak admin credentials: `admin` / `admin` at `http://localhost:8180`

---

## ⚙️ Configuration

### `application.properties` — Key Properties

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/devopsdb
spring.jpa.hibernate.ddl-auto=update

# Jenkins Integration
jenkins.base-url=http://localhost:8085
jenkins.username=<jenkins_user>
jenkins.api-token=<jenkins_api_token>

# Prometheus Metrics
management.endpoints.web.exposure.include=health,prometheus,info
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true

# Keycloak / OAuth2
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/devops-platform

# Docker
docker.host=tcp://localhost:2375
```

### Keycloak Realm

The Keycloak realm `devops-platform` is auto-imported from `infrastructure/keycloak/` on container startup via the `--import-realm` command flag.

### Prometheus Scrape Config

Prometheus scrapes Spring Boot metrics from `/actuator/prometheus`. Customize scrape targets in `infrastructure/prometheus/prometheus.yml`.

---

## 📡 API Endpoints

All endpoints are served at `http://localhost:8080` and require a valid **JWT Bearer token** from Keycloak.

### Projects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `DELETE` | `/api/projects/{id}` | Delete a project |

### Pipelines
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects/{id}/pipelines` | Associate a Jenkins pipeline |
| `POST` | `/api/projects/{projectId}/pipelines/{pipelineId}/run` | Trigger a pipeline build |

### Jenkins Webhook
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/webhook/jenkins` | Receive Jenkins build completion callbacks |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get all notifications |
| `PUT` | `/api/notifications/{id}/read` | Mark a notification as read |

### Actuator (Metrics & Health)
| Endpoint | Description |
|---|---|
| `/actuator/health` | Application health status |
| `/actuator/prometheus` | Prometheus metrics scrape endpoint |

---

## 🖥️ Frontend Pages

| Page | Key | Description |
|---|---|---|
| **Dashboard** | `dashboard` | Overview of all projects, recent builds, and stats |
| **Projects** | `projects` | Create/manage projects and associate Jenkins pipelines |
| **Deployments** | `deployments` | Track all deployment executions and their statuses |
| **Docker** | `docker` | Manage Docker containers and images in real time |
| **Monitoring** | `monitoring` | Live infrastructure metrics with interactive charts |
| **FinOps** | `finops` | Cloud cost tracking by environment |
| **Plugins** | `plugins` | DevOps tool plugin registry and management |
| **Observability Report** | `observability-report` | Detailed infrastructure health and metrics report |
| **FinOps Report** | `finops-report` | In-depth cost analysis and breakdown report |

---

## 🔐 Security

Security is enforced at multiple layers:

- **OAuth2 / JWT**: Every API call must include a valid Bearer token issued by Keycloak (`Authorization: Bearer <token>`)
- **Keycloak Realm**: `devops-platform` realm supports configurable roles, users, and clients
- **Spring Security**: Resource server validates JWT signatures against the Keycloak JWKS endpoint automatically
- **CORS**: Configured to allow only the frontend origin
- **Docker Socket**: Jenkins runs as root with Docker socket mounted to support pipeline Docker-in-Docker operations

> ⚠️ **Production Warning**: Before deploying to any production or public environment, update all default credentials — Keycloak admin, RabbitMQ `guest/guest`, Jenkins API token, and database password.

---

## 📊 Monitoring & Observability

| Tool | URL | Default Credentials |
|---|---|---|
| **Prometheus** | `http://localhost:9090` | — |
| **SonarQube** | `http://localhost:9000` | `admin` / `admin` |
| **RabbitMQ Management** | `http://localhost:15672` | `guest` / `guest` |
| **Nexus Repository** | `http://localhost:8081` | `admin` / (see Nexus logs) |
| **Jenkins** | `http://localhost:8085` | (configured on first run) |
| **Keycloak Admin** | `http://localhost:8180` | `admin` / `admin` |

Prometheus is pre-configured to scrape the Spring Boot backend metrics endpoint. Alertmanager configuration is available at `prometheus/alertmanager.yml` for routing alerts to notification channels (email, Slack, PagerDuty, etc.).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes using [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request against `main`

---

## 👩‍💻 Author

**Asma Boughanmi**

- 🐙 GitHub: [@BoughanmiAsma](https://github.com/BoughanmiAsma)
- 📦 Repository: [Plateform-DevOps](https://github.com/BoughanmiAsma/Plateform-DevOps)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using Spring Boot, React, and the best open-source DevOps tools.</sub>
</div>
