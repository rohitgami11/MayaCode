import React, { useEffect, useRef, useContext } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SocketContext } from '@/context/SocketContext';

const AppStateListener: React.FC = () => {
  const appState = useRef(AppState.currentState);
  const socketContext = useContext(SocketContext);

  useEffect(() => {
    if (!socketContext) return;
    // Connect socket on mount if app is active
    if (appState.current === 'active') {
      socketContext.connectSocket?.();
    }
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        socketContext.disconnectSocket?.();
      }
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        socketContext.connectSocket?.();
      }
      appState.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [socketContext]);
  return null;
};

export default AppStateListener;