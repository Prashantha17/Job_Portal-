export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface SystemInfo {
  javaVersion: string;
  javaVendor: string;
  osName: string;
  osArch: string;
  availableProcessors: number;
  totalMemoryMb: number;
  freeMemoryMb: number;
  usedMemoryMb: number;
  maxMemoryMb: number;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  applicationName: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  databaseStatus: string;
  databaseProduct: string;
  services: {
    database: {
      status: string;
      product?: string;
      latencyMs?: number;
    };
    authentication?: {
      status: string;
      mode: string;
    };
    jobEngine?: {
      status: string;
      version: string;
    };
    smartMatchingEngine?: {
      status: string;
      algorithm: string;
    };
  };
  systemInfo: SystemInfo;
}

