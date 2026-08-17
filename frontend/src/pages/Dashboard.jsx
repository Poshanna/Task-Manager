import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
    high_priority: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        taskAPI.getDashboardStats(),
        taskAPI.getTasks({ limit: 4 })
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (taskData) => {
    await taskAPI.createTask(taskData);
    fetchDashboardData();
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Hello, {user?.name || 'Developer'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Overview of your task management metrics and project activities.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.todo}</div>
            <div className="stat-label">Pending (TODO)</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <PlayCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.high_priority}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Tasks</h3>
          </div>
          <Link to="/tasks" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>Loading dashboard activities...</p>
        ) : recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <p>No tasks created yet. Click "New Task" to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentTasks.map((task) => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className={`badge badge-${task.status.toLowerCase()}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};

export default Dashboard;
