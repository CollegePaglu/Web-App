/**
 * Network Diagnostics Service
 * 
 * Production-grade network diagnostics for debugging connectivity issues.
 * Helps identify if the issue is:
 * - Device offline
 * - Backend unreachable
 * - Specific endpoint issues
 * - DNS resolution issues
 */

import axios from 'axios';
import { env } from '@/config/env';

export interface NetworkDiagnosticsReport {
  timestamp: string;
  deviceOnline: boolean;
  backendReachable: boolean;
  backendHealthy: boolean;
  apiLatency: number | null;
  dnsBroken: boolean;
  diagnostics: string[];
  recommendations: string[];
}

/**
 * Check if device has internet connectivity
 */
export const checkDeviceConnectivity = async (): Promise<boolean> => {
  try {
    // Try to ping a reliable public service
    const response = await axios.get('https://www.google.com/favicon.ico', {
      timeout: 5000,
      validateStatus: () => true, // Accept any status
    });
    return response.status >= 0;
  } catch {
    return false;
  }
};

/**
 * Check if backend is reachable
 */
export const checkBackendReachability = async (): Promise<{
  reachable: boolean;
  latency: number | null;
}> => {
  const startTime = Date.now();
  try {
    const response = await axios.get(`${env.API_BASE_URL}/health`, {
      timeout: 10000,
      validateStatus: () => true,
    });
    const latency = Date.now() - startTime;
    return {
      reachable: response.status < 500,
      latency,
    };
  } catch {
    return {
      reachable: false,
      latency: null,
    };
  }
};

/**
 * Check specific endpoint availability
 */
export const checkEndpointAvailability = async (
  endpoint: string
): Promise<{
  available: boolean;
  status: number | null;
}> => {
  try {
    const response = await axios.get(`${env.API_BASE_URL}${endpoint}`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return {
      available: response.status < 500,
      status: response.status,
    };
  } catch {
    return {
      available: false,
      status: null,
    };
  }
};

/**
 * Run full network diagnostics
 * Use this when debugging connection issues
 */
export const runNetworkDiagnostics = async (): Promise<NetworkDiagnosticsReport> => {
  const diagnostics: string[] = [];
  const recommendations: string[] = [];

  const startTime = new Date().toISOString();

  // Check device connectivity
  console.log('🔍 Checking device connectivity...');
  const deviceOnline = await checkDeviceConnectivity();
  diagnostics.push(`Device online: ${deviceOnline ? '✅' : '❌'}`);

  if (!deviceOnline) {
    recommendations.push('❗ Device is offline. Check WiFi/mobile connection.');
  }

  // Check backend reachability
  console.log('🔍 Checking backend reachability...');
  const backendCheck = await checkBackendReachability();
  diagnostics.push(`Backend reachable: ${backendCheck.reachable ? '✅' : '❌'}`);
  
  if (backendCheck.latency) {
    diagnostics.push(`Backend latency: ${backendCheck.latency}ms`);
    if (backendCheck.latency > 5000) {
      recommendations.push('⚠️  Backend is slow (>5s). Check server performance.');
    }
  }

  if (!backendCheck.reachable) {
    recommendations.push(`❗ Cannot reach backend at ${env.API_BASE_URL}`);
    recommendations.push('Check if backend server is running: npm start or docker-compose up');
    recommendations.push('Verify network firewall allows connection to port 5000');
    recommendations.push('On iOS: Check if you can reach the IP from another device');
  }

  // Check specific endpoints
  console.log('🔍 Checking critical endpoints...');
  const endpoints = ['/auth/health', '/community/posts', '/vendors'];
  for (const endpoint of endpoints) {
    const check = await checkEndpointAvailability(endpoint);
    diagnostics.push(`Endpoint ${endpoint}: ${check.available ? '✅' : '❌'} (${check.status || 'no response'})`);
  }

  // Detect DNS issues
  const dnsBroken = !deviceOnline || !backendCheck.reachable;
  if (dnsBroken) {
    diagnostics.push('DNS/Network: Possible issues detected');
    recommendations.push('Try restarting the app or device');
    recommendations.push('Check your network configuration');
  }

  if (env.ENABLE_API_LOGS) {
    console.log('📊 Network Diagnostics Report:');
    console.log({
      timestamp: startTime,
      deviceOnline,
      backendReachable: backendCheck.reachable,
      backendHealthy: backendCheck.reachable,
      apiLatency: backendCheck.latency,
      dnsBroken,
      diagnostics,
      recommendations,
    });
  }

  return {
    timestamp: startTime,
    deviceOnline,
    backendReachable: backendCheck.reachable,
    backendHealthy: backendCheck.reachable,
    apiLatency: backendCheck.latency,
    dnsBroken,
    diagnostics,
    recommendations,
  };
};

/**
 * Log diagnostics to console in a readable format
 */
export const logDiagnostics = (report: NetworkDiagnosticsReport): void => {
  console.group('📊 Network Diagnostics Report');
  console.log(`⏰ Timestamp: ${report.timestamp}`);
  console.log('');
  console.group('Status:');
  console.log(`  Device Online: ${report.deviceOnline ? '✅ Yes' : '❌ No'}`);
  console.log(`  Backend Reachable: ${report.backendReachable ? '✅ Yes' : '❌ No'}`);
  console.log(`  Backend Healthy: ${report.backendHealthy ? '✅ Yes' : '❌ No'}`);
  if (report.apiLatency) {
    console.log(`  API Latency: ${report.apiLatency}ms`);
  }
  console.groupEnd();
  
  console.group('Diagnostics:');
  report.diagnostics.forEach((d) => console.log(`  ${d}`));
  console.groupEnd();
  
  if (report.recommendations.length > 0) {
    console.group('Recommendations:');
    report.recommendations.forEach((r) => console.log(`  ${r}`));
    console.groupEnd();
  }
  
  console.groupEnd();
};
