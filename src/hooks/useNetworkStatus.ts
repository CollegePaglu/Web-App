/**
 * useNetworkStatus Hook
 * 
 * Monitors network connectivity status.
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifi: boolean;
  isCellular: boolean;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: NetInfoStateType.unknown,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
      });
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
};

export default useNetworkStatus;
