import { useSelector } from 'react-redux';

export const useTheme = () => {
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';
  
  return { mode, isDark };
};