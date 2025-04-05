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
} from "../default.config";

export class HostingService implements ServiceDeploymentConfig {
    SERVICE_IMAGE = "arnavmehta7/auto-ci-cd:v1";
    SERVICE_TYPE = "BACKEND";

    getServiceType(): ServiceType {
        return this.SERVICE_TYPE;
    }

    getDefaultDeploymentConfig(config: Partial<InputConfig>): OutputConfig {
        try {
            if (!config?.appPort) {
                throw new Error(
                    "App port is required for Backend Service"
                );
            }

            const baseConfig: OutputConfig = {
                serviceType: this.SERVICE_TYPE,
                appPort: config?.appPort,
                spheronDeploymentMode: config?.spheronDeploymentMode,
                deploymentDuration: DEPLOYMENT_DURATION,
                appCpuUnits: APP_CPU_UNITS,
                appMemorySize: APP_MEMORY_SIZE,
                appStorageSize: APP_STORAGE_SIZE,
                image: this.SERVICE_IMAGE,
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
                    "App port is required for Backend Service"
                );
            }

            const baseConfig: OutputConfig = {
                serviceType: this.SERVICE_TYPE,
                appPort: config?.appPort,
                spheronDeploymentMode: config?.spheronDeploymentMode,
                deploymentDuration: config?.deploymentDuration,
                appCpuUnits: config?.appCpuUnits,
                appMemorySize: config?.appMemorySize,
                appStorageSize: config?.appStorageSize,
                image: this.SERVICE_IMAGE,
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
