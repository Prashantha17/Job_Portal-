import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Cpu, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { healthService } from '../../services/healthService';
import { HealthResponse } from '../../types/health';

export const BackendStatusBanner: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthService.getHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: any) {
      console.warn('Backend currently unreachable:', err);
      setError(err.message || 'Unable to connect to Spring Boot backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (loading && !health) return 'bg-amber-500';
    if (error || !health) return 'bg-rose-500';
    if (health.status === 'UP') return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  const getStatusText = () => {
    if (loading && !health) return 'Connecting to Backend...';
    if (error || !health) return 'Backend Offline';
    return `System Status: ${health.status === 'UP' ? 'Operational' : health.status}`;
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-sm group"
        title="Click to view detailed Spring Boot & MySQL diagnostics"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor()}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getStatusColor()}`}></span>
        </span>
        <span className="font-mono text-slate-800 font-semibold">{getStatusText()}</span>
        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">↗</span>
      </button>

      {/* Diagnostics Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Backend Health & Infrastructure</h3>
                  <p className="text-xs text-slate-500">Live diagnostics from Spring Boot 3.4 & MySQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  health?.status === 'UP'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {health?.status === 'UP' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">
                      Overall Health: {health ? health.status : 'OFFLINE'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {health?.status === 'UP'
                        ? 'All backend microservices and MySQL connection pool are healthy.'
                        : error || 'Service degraded. Ensure Spring Boot server is started on port 8080.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchHealth}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {health && (
                <>
                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Database Box */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-brand-600" /> Database Pool
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            health.databaseStatus.startsWith('UP')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {health.databaseStatus}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{health.databaseProduct}</p>
                      <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                        <span>Pool Provider</span>
                        <span className="font-medium text-slate-700">HikariCP</span>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>Database Engine</span>
                        <span className="font-medium text-slate-700">MySQL 8.4 InnoDB</span>
                      </div>
                    </div>

                    {/* Server Info */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Server className="w-4 h-4 text-brand-600" /> Runtime Environment
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {health.environment.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {health.applicationName} v{health.version}
                      </p>
                      <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                        <span>Java Runtime</span>
                        <span className="font-medium text-slate-700">Java {health.systemInfo?.javaVersion || '25+'}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>Uptime</span>
                        <span className="font-medium text-slate-700">{health.uptimeSeconds} seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* System Resources */}
                  {health.systemInfo && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-brand-600" /> System Resources & JVM Memory
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {health.systemInfo.availableProcessors} CPU Cores
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600 font-medium">
                          <span>JVM Heap Allocation</span>
                          <span>
                            {health.systemInfo.usedMemoryMb} MB used / {health.systemInfo.totalMemoryMb} MB allocated (Max: {health.systemInfo.maxMemoryMb} MB)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((health.systemInfo.usedMemoryMb / health.systemInfo.totalMemoryMb) * 100)
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Microservice Subsystems */}
                  <div className="border-t border-slate-100 pt-4">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                      Recruitment Subsystems
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">Auth & JWT</span>
                        <span className="text-xs font-semibold text-emerald-600">Active / RBAC</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">Job Engine</span>
                        <span className="text-xs font-semibold text-emerald-600">v1 Ready</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">ATS Pipeline</span>
                        <span className="text-xs font-semibold text-indigo-600">10 Stages</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">Smart Match</span>
                        <span className="text-xs font-semibold text-blue-600">Cosine Matrix</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              <a
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Open Swagger UI ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
