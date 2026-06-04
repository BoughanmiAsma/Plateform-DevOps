import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Deployments from './pages/Deployments';
import Monitoring from './pages/Monitoring';
import Plugins from './pages/Plugins';
import ProjectModal from './components/ProjectModal';
import RunBuildModal from './components/RunBuildModal';
import { api } from './services/api';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [env, setEnv] = useState('Global');
  const [projects, setProjects] = useState([]);
  const [isLightMode, setIsLightMode] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'associate'
  const [activeProject, setActiveProject] = useState(null);

  // Run Modal State
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runTarget, setRunTarget] = useState({ projectId: null, pipelineId: null, project: null });

  // Charger la liste des projets
  const loadProjects = async () => {
    try {
      const data = await api.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Gérer le changement de thème
  const toggleTheme = () => {
    setIsLightMode(prev => {
      const nextMode = !prev;
      if (nextMode) {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
      return nextMode;
    });
  };

  // Vérifie si un ou plusieurs projets ont encore des exécutions en RUNNING
  const hasRunningExecutions = (projectList) => {
    return projectList.some(proj =>
      proj.pipelines && proj.pipelines.some(pip =>
        pip.executions && pip.executions.some(e => e.status === 'RUNNING')
      )
    );
  };

  // Déclencher l'ouverture du modal d'exécution
  const handleRunPipeline = (projectId, pipelineId) => {
    const project = projects.find(p => p.id === projectId);
    setRunTarget({ projectId, pipelineId, project });
    setRunModalOpen(true);
  };

  // Lancement final de l'exécution avec les paramètres
  const executePipeline = async (projectId, pipelineId, parameters) => {
    try {
      console.log(`Lancement du pipeline ${pipelineId} pour le projet ${projectId}`);
      await api.runPipeline(projectId, pipelineId, parameters);

      // Recharger immédiatement pour afficher RUNNING
      await loadProjects();

      // Sonder le backend toutes les 4 secondes tant qu'il y a des builds RUNNING
      // (s'arrête automatiquement quand le webhook Jenkins arrive et met à jour le statut)
      const MAX_POLLS = 75; // sécurité : max 5 minutes (75 × 4s)
      let pollCount = 0;

      const interval = setInterval(async () => {
        pollCount++;
        const freshData = await api.getAllProjects();
        setProjects(freshData);

        const stillRunning = hasRunningExecutions(freshData);
        if (!stillRunning || pollCount >= MAX_POLLS) {
          clearInterval(interval);
          if (pollCount >= MAX_POLLS) {
            console.warn('Polling arrêté après 5 minutes sans réponse finale de Jenkins.');
          } else {
            console.log('Build terminé — polling arrêté.');
          }
        }
      }, 4000);

    } catch (err) {
      alert(`Failed to trigger build: ${err.message}`);
    }
  };


  const handleOpenModal = (mode, project = null) => {
    setModalMode(mode);
    setActiveProject(project);
    setModalOpen(true);
  };

  const handleModalSuccess = async (updatedOrNew) => {
    // Recharger la liste complète depuis l'API/LocalStorage
    await loadProjects();
  };

  // Déterminer la page active à afficher
  const renderPage = () => {
    switch (page) {
      case 'projects':
        return (
          <Projects
            projects={projects}
            onOpenModal={handleOpenModal}
            onRunPipeline={handleRunPipeline}
            env={env}
          />
        );
      case 'deployments':
        return (
          <Deployments
            projects={projects}
            onRunPipeline={handleRunPipeline}
            env={env}
          />
        );
      case 'monitoring':
        return <Monitoring env={env} />;
      case 'plugins':
        return <Plugins />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            projects={projects}
            onRunPipeline={handleRunPipeline}
            env={env}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={page} setPage={setPage} />
      
      <div className="main-wrapper">
        <Navbar
          env={env}
          setEnv={setEnv}
          isLightMode={isLightMode}
          toggleTheme={toggleTheme}
        />
        {renderPage()}
      </div>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        project={activeProject}
        onSuccess={handleModalSuccess}
      />

      <RunBuildModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        onSubmit={executePipeline}
        project={runTarget.project}
        pipelineId={runTarget.pipelineId}
      />
    </div>
  );
}
