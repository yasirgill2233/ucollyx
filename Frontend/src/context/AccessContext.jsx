import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessContext = createContext();

export const AccessProvider = ({ children }) => {
  const [rolesPermissions, setRolesPermissions] = useState(() => {
    const saved = localStorage.getItem("ucollyx_permissions");
    return saved ? JSON.parse(saved) : {
      dev: [
        { id: 'd1', label: 'Overview', path: '/dev/dashboard', enabled: true },
        { id: 'd2', label: 'Projects', path: '/dev/my-projects', enabled: true },
        { id: 'd3', label: 'Issues', path: '/dev/issues', enabled: true },
        { id: 'd4', label: 'Kanban', path: '/dev/board', enabled: true },
        { id: 'd5', label: 'IDE', path: '/dev/ide', enabled: true },
        { id: 'd6', label: 'Chat', path: '/dev/chat', enabled: true },
        { id: 'd7', label: 'Directories', path: '/dev/projects-dir', enabled: true },
        { id: 'd8', label: 'Meetings', path: '/dev/meetings', enabled: true },
      ],
      manager: [
        { id: 'm1', label: 'Portfolio', path: '/manager/portfolio', enabled: true },
        { id: 'm2', label: 'Team Activity', path: '/manager/activity', enabled: true },
        { id: 'm3', label: 'Project Tasks', path: '/manager/tasks', enabled: true },
        { id: 'm4', label: 'IDE', path: '/manager/ide', enabled: true },
        { id: 'm5', label: 'Chat', path: '/manager/chat', enabled: true },
        { id: 'm6', label: 'Directories', path: '/manager/projects-dir', enabled: true },
        { id: 'm7', label: 'Meetings', path: '/manager/meetings', enabled: true },
      ],
      qa: [
        { id: 'q1', label: 'QA Dashboard', path: '/qa/dashboard', enabled: true },
        { id: 'q2', label: 'Red Alerts', path: '/qa/alerts', enabled: true },
        { id: 'q3', label: 'Report Bug', path: '/qa/report-bug', enabled: true },
        { id: 'q4', label: 'Verification', path: '/qa/verify-task', enabled: true },
        { id: 'q5', label: 'Kanban', path: '/qa/board', enabled: true },
        { id: 'q6', label: 'Chat', path: '/qa/chat', enabled: true },
        { id: 'q7', label: 'Meetings', path: '/qa/meetings', enabled: true },
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem("ucollyx_permissions", JSON.stringify(rolesPermissions));
  }, [rolesPermissions]);

  const togglePermission = (role, featureId) => {
    setRolesPermissions((prev) => ({
      ...prev,
      [role]: prev[role].map((f) =>
        f.id === featureId ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  return (
    <AccessContext.Provider value={{ rolesPermissions, togglePermission }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider!');
  }
  return context;
};