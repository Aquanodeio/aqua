export enum ServiceType {
    JUPYTER = "JUPYTER",
    BACKEND = "BACKEND",
}

export interface InputConfig {
    appCpuUnits: number;
    appMemorySize: string;
    appPort: number;
    appStorageSize: string;
    deploymentDuration: string;
    image: string;
    repoUrl: string;
    branchName: string;
    envVars: Record<string, string>;
    runCommands: string;
}

export interface OutputConfig {
    serviceType: ServiceType;
    appCpuUnits?: number;
    appMemorySize?: string;
    appPort?: number;
    appStorageSize?: string;
    deploymentDuration?: string;
    image?: string;
    repoUrl: string | undefined;
    branchName: string;
    env: Record<string, string>;
    runCommands?: string;
    spheronDeploymentMode?: string;
}

export interface ServiceDeploymentConfig {
    getServiceType(): ServiceType;
    getDefaultDeploymentConfig(config?: Partial<InputConfig>): OutputConfig;
    getCustomDeploymentConfig(config?: Partial<InputConfig>): OutputConfig;
}
