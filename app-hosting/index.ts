import {
    ServiceType,
    ServiceDeploymentConfig,
    InputConfig,
    OutputConfig,
} from "../types";
import {
    APP_CPU_UNITS,
    APP_MEMORY_SIZE,
    APP_STORAGE_SIZE,
    DEPLOYMENT_DURATION,
    SPHERON_DEPLOYMENT_MODE,
} from "../default.config";
import { USER_APP_IMAGE } from "./image.config";

export class BackendService implements ServiceDeploymentConfig {
    getServiceType(): ServiceType {
        return ServiceType.BACKEND;
    }

    getDefaultDeploymentConfig(config: Partial<InputConfig>): OutputConfig {
        try {
            if (!config?.appPort) {
                throw new Error(
                    "App port is required for Aqua Backend Service"
                );
            }

            const baseConfig: OutputConfig = {
                serviceType: ServiceType.BACKEND,
                appPort: config?.appPort,
                spheronDeploymentMode: SPHERON_DEPLOYMENT_MODE,
                deploymentDuration: DEPLOYMENT_DURATION,
                appCpuUnits: APP_CPU_UNITS,
                appMemorySize: APP_MEMORY_SIZE,
                appStorageSize: APP_STORAGE_SIZE,
                image: USER_APP_IMAGE,
                repoUrl: config?.repoUrl,
                branchName: config?.branchName || "main",
                env: config?.envVars || {},
            };

            return baseConfig;
        } catch (error: any) {
            throw new Error(
                `Failed to create default backend deployment config: ${error.message}`
            );
        }
    }

    getCustomDeploymentConfig(config: Partial<InputConfig>): OutputConfig {
        try {
            if (!config?.appPort) {
                throw new Error(
                    "App port is required for Aqua Backend Service"
                );
            }

            const baseConfig: OutputConfig = {
                serviceType: ServiceType.BACKEND,
                appPort: config?.appPort,
                spheronDeploymentMode: SPHERON_DEPLOYMENT_MODE,
                deploymentDuration: config?.deploymentDuration,
                appCpuUnits: config?.appCpuUnits,
                appMemorySize: config?.appMemorySize,
                appStorageSize: config?.appStorageSize,
                image: config?.image,
                repoUrl: config?.repoUrl,
                branchName: config?.branchName || "main",
                env: config?.envVars || {},
            };

            return baseConfig;
        } catch (error: any) {
            throw new Error(
                `Failed to create custom backend deployment config: ${error.message}`
            );
        }
    }
}
