import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  serverConfig: {
    host: 'localhost',
    port: 3306,
    database: 'metin2',
    username: 'root',
    password: ''
  },
  currentProject: null,
  recentFiles: [],
  settings: {
    theme: 'dark',
    language: 'tr',
    autoSave: true,
    backupEnabled: true
  },
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SERVER_CONFIG':
      return {
        ...state,
        serverConfig: { ...state.serverConfig, ...action.payload }
      };
    
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload
      };
    
    case 'ADD_RECENT_FILE':
      return {
        ...state,
        recentFiles: [
          action.payload,
          ...state.recentFiles.filter(file => file.path !== action.payload.path)
        ].slice(0, 10)
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), ...action.payload }
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    // Helper functions
    setServerConfig: (config) => dispatch({ type: 'SET_SERVER_CONFIG', payload: config }),
    setCurrentProject: (project) => dispatch({ type: 'SET_CURRENT_PROJECT', payload: project }),
    addRecentFile: (file) => dispatch({ type: 'ADD_RECENT_FILE', payload: file }),
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    addNotification: (notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}