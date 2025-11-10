import { useEffect } from 'react';
import { useTheme } from './useTheme';

export const useScrollbar = () => {
  const { isDark } = useTheme();
  
  useEffect(() => {
    const applyScrollbarStyles = () => {
      const style = document.createElement('style');
      style.id = 'global-scrollbar-styles';
      
      style.textContent = `
        html {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#036f4dff #1c222d83' : '#0b7c56ff #f1f5f9'};
        }
        html::-webkit-scrollbar { width: 8px; }
        html::-webkit-scrollbar-track { background: ${isDark ? '#1c222d83' : '#f1f5f9'}; border-radius: 10px; }
        html::-webkit-scrollbar-thumb { background: ${isDark ? '#036f4dff' : '#0b7c56ff'}; border-radius: 10px; }
        html::-webkit-scrollbar-thumb:hover { background: ${isDark ? '#0e8462d8' : '#0a664aff'}; }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#036f4dff #1c222d83' : '#0b7c56ff #f1f5f9'};
        }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: ${isDark ? '#1c222d83' : '#f1f5f9'}; border-radius: 10px; }
        *::-webkit-scrollbar-thumb { background: ${isDark ? '#036f4dff' : '#0b7c56ff'}; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: ${isDark ? '#0e8462d8' : '#0a664aff'}; }
      `;

      const existingStyle = document.getElementById('global-scrollbar-styles');
      if (existingStyle) existingStyle.remove();
      
      document.head.appendChild(style);
    };

    applyScrollbarStyles();
  }, [isDark]);
};