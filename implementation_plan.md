# Plan d'implémentation du Module FinOps

Ce document présente la conception et le plan d'implémentation du module FinOps. Le module permet de suivre, analyser et optimiser les coûts associés aux pipelines de CI/CD (Jenkins) et à la consommation d'infrastructure (Kubernetes) grâce aux métriques récoltées en temps réel.

---

## Fonctionnalités Clés du Module FinOps

1. **Calcul des Coûts des Pipelines (CI/CD)** :
   * Analyse des exécutions de pipelines (durée en secondes).
   * Calcul du coût réel basé sur un tarif unitaire paramétrable (ex: $0.003 / seconde de build).
   
2. **Calcul des Coûts d'Infrastructure (Kubernetes)** :
   * Corrélation des projets DevOps avec les namespaces K8s correspondants (ex: `immo-dev`).
   * Récupération via Prometheus de la consommation moyenne de CPU et de Mémoire (RAM) du namespace.
   * Calcul du coût associé selon des grilles tarifaires de ressources (ex: $0.05/heure par CPU core, $0.01/heure par Go de RAM).

3. **Recommandations d'Optimisation des Coûts** :
   * **Surprovisionnement** : Détection des services consommant trop peu de ressources par rapport à leurs allocations et suggestion de réduction (ex: RAM moyenne < 20% ou CPU < 5%).
   * **Gaspillage CI/CD** : Calcul du coût des exécutions échouées et suggestions d'optimisation (caching, réduction de la durée) si le coût de gaspillage dépasse un certain seuil.

---

## Architecture Proposée (Backend)

Nous allons créer un nouveau package `com.smartit.devops_platform.finops` structuré selon les standards existants du projet :

```
com/smartit/devops_platform/finops/
├── domain/
│   └── model/
│       ├── CostSummary.java          # Modèle de synthèse globale des coûts
│       ├── ProjectCost.java          # Détails des coûts d'un projet spécifique
│       ├── PipelineCost.java         # Détails des coûts d'un pipeline
│       └── CostRecommendation.java   # Recommandation d'optimisation
├── application/
│   └── FinOpsService.java            # Service de calcul et génération des rapports
└── presentation/
    └── FinOpsController.java         # Endpoints REST (/api/finops)
```

---

## Modèles et Formules de Calcul

### 1. Coût du Pipeline (CI/CD)
$$\text{Coût} = \text{Durée d'exécution (s)} \times \text{Coût de l'agent de build (\$/s)}$$
* *Par défaut* : Coût de build = `$0.003` par seconde.
* *Wasted Cost* (Coût perdu) : Somme des coûts des exécutions au statut `FAILED`.

### 2. Coût de l'Infrastructure (Kubernetes)
Calculé sur la base de la télémétrie Prometheus sur le namespace ciblé :
* **CPU** : 
  $$\text{Coût CPU} = \text{Moyenne CPU (cores)} \times \text{Tarif CPU (\$/core-heure)} \times \text{Heures de fonctionnement}$$
  * *Par défaut* : Tarif CPU = `$0.04` / core-heure.
* **Mémoire** :
  $$\text{Coût RAM} = \text{Moyenne RAM (Go)} \times \text{Tarif RAM (\$/Go-heure)} \times \text{Heures de fonctionnement}$$
  * *Par défaut* : Tarif RAM = `$0.01` / Go-heure.

Si les données Prometheus sont absentes ou inaccessibles, une simulation réaliste basée sur le nombre de pods sera retournée en fallback.

---

## Proposed Changes

### [NEW] [CostSummary.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/domain/model/CostSummary.java)
DTO encapsulant les coûts globaux (total, cumul CI/CD, cumul Infra, économies estimées).

### [NEW] [ProjectCost.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/domain/model/ProjectCost.java)
Détail des coûts d'un projet : coût total, coût infra, coût pipeline, et liste des recommandations.

### [NEW] [PipelineCost.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/domain/model/PipelineCost.java)
Rapport de coûts d'un pipeline individuel : nombre de runs, temps total, coût total, coût gaspillé.

### [NEW] [CostRecommendation.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/domain/model/CostRecommendation.java)
Modèle représentant une opportunité d'économie : type, message de recommandation, impact financier estimé et niveau de gravité.

### [NEW] [FinOpsService.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/application/FinOpsService.java)
Service Spring réalisant les agrégations de données, les requêtes Prometheus via `ObservabilityPlugin`, le calcul des temps d'exécutions Jenkins, et l'application des règles de recommandation.

### [NEW] [FinOpsController.java](file:///c:/Users/PC/plateformdevops/src/main/java/com/smartit/devops_platform/finops/presentation/FinOpsController.java)
Contrôleur REST exposant :
* `GET /api/finops/summary` : Synthèse globale de tous les projets de la plateforme.
* `GET /api/finops/projects/{projectId}` : Coûts et recommandations détaillés pour un projet donné.
* `GET /api/finops/recommendations` : Toutes les opportunités d'optimisation de coût agrégées.

---

## Verification Plan

### Automated Tests
* Lancement des tests unitaires et vérification de la compilation Maven :
  `mvn clean compile`

### Manual Verification
* Envoi de requêtes HTTP `GET` sur les endpoints REST du module FinOps pour valider la structure JSON et les calculs dynamiques de coûts.
* Validation que la base de données existante H2 et les pipelines ne subissent aucune régression.
