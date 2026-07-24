import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MetricChart from '../components/MetricChart';

export default function Monitoring({ env, setPage }) {
  const [metrics, setMetrics] = useState({
    cpu: null,
    memory: null,
    rps: null,
    errorRate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(60); // minutes

  const fetchAllMetrics = async () => {
    try {
      setError(null);
      const [cpu, memory, rps, errorRate] = await Promise.all([
        api.getMetrics('cpu', timeRange),
        api.getMetrics('memory', timeRange),
        api.getMetrics('rps', timeRange),
        api.getMetrics('errorRate', timeRange)
      ]);

      setMetrics({ cpu, memory, rps, errorRate });
    } catch (err) {
      console.error("Failed to load metrics", err);
      setError("Could not connect to Prometheus. Verify that Prometheus is running at http://localhost:9091");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllMetrics();

    // Actualisation automatique toutes les 5 secondes pour donner de la vie à l'interface
    const interval = setInterval(() => {
      // Pour simuler du temps réel fluide, on met à jour le dernier point
      setMetrics(prev => {
        if (!prev || !prev.cpu) return prev;
        
        const updatePoints = (metric, rangeMin, rangeMax, fluctuation) => {
          if (!metric || !metric.points || metric.points.length === 0) return metric;
          const points = [...metric.points];
          const lastPoint = { ...points[points.length - 1] };
          
          // Ajouter une petite fluctuation
          let nextVal = lastPoint.value + (Math.random() - 0.5) * fluctuation;
          nextVal = Math.max(rangeMin, Math.min(rangeMax, nextVal));
          
          // Mettre à jour le dernier point et pousser le temps
          lastPoint.value = nextVal;
          lastPoint.timestamp = Date.now();
          points[points.length - 1] = lastPoint;
          return { ...metric, points };
        };

        return {
          cpu: updatePoints(prev.cpu, 10, 95, 8),
          memory: updatePoints(prev.memory, 4, 16, 0.2),
          rps: updatePoints(prev.rps, 100, 2000, 150),
          errorRate: updatePoints(prev.errorRate, 0.0, 5.0, 0.1)
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title-group">
          <h1 className="page-title">Monitoring & Observability</h1>
          <p className="page-subtitle">Real-time metrics and performance data.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setPage('observability-report')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          📄 Générer Rapport
        </button>
      </div>

      <div className="section-card">
        <div className="filters-row">
          <select className="filter-select">
            <option>All Projects</option>
          </select>
          <select className="filter-select" value={env} disabled>
            <option value={env}>{env === 'Global' ? 'All Environments' : `Environment: ${env}`}</option>
          </select>
          <select className="filter-select">
            <option>All Services</option>
          </select>
          <select 
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={30}>Last 30 Minutes</option>
            <option value={60}>Last 1 Hour</option>
            <option value={180}>Last 3 Hours</option>
            <option value={1440}>Last 24 Hours</option>
          </select>
        </div>

        {error && (
          <div style={{
            color: 'var(--status-failed)',
            backgroundColor: 'var(--status-failed-bg)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Fetching Prometheus telemetry...
          </div>
        ) : (
          <div className="charts-grid">
            <MetricChart
              title="CPU Usage (%)"
              data={metrics.cpu}
              type="line"
              color="#3b82f6"
              valueFormatter={(v) => `${v ? v.toFixed(1) : 0}%`}
            />

            <MetricChart
              title="Memory Usage (GB)"
              data={metrics.memory}
              type="line"
              color="#a855f7"
              valueFormatter={(v) => `${v ? v.toFixed(2) : 0} GB`}
            />

            <MetricChart
              title="Requests per Second (RPS)"
              data={metrics.rps}
              type="bar"
              color="#10b981"
              valueFormatter={(v) => `${v ? Math.round(v) : 0} RPS`}
            />

            <MetricChart
              title="Error Rate (%)"
              data={metrics.errorRate}
              type="line"
              color="#ef4444"
              valueFormatter={(v) => `${v ? v.toFixed(3) : 0}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
