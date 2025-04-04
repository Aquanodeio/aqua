import {
    ServiceType,
    ServiceDeploymentConfig,
    InputConfig,
    OutputConfig,
} from "../types";
import {
    JUPYTER_DEFAULT_IMAGE,
    JUPYTER_DEFAULT_CPU,
    JUPYTER_DEFAULT_MEMORY,
    JUPYTER_DEFAULT_STORAGE,
    JUPYTER_DEFAULT_PORT,
    JUPYTER_DEFAULT_DURATION,
    SPHERON_DEPLOYMENT_MODE
} from "./default.config";

export class JupyterService implements ServiceDeploymentConfig {
    getServiceType(): ServiceType {
        return ServiceType.JUPYTER;
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
                appPort: JUPYTER_DEFAULT_PORT,
                spheronDeploymentMode: SPHERON_DEPLOYMENT_MODE,
                deploymentDuration: JUPYTER_DEFAULT_DURATION,
                appCpuUnits: JUPYTER_DEFAULT_CPU,
                appMemorySize: JUPYTER_DEFAULT_MEMORY,
                appStorageSize: JUPYTER_DEFAULT_STORAGE,
                image: JUPYTER_DEFAULT_IMAGE,
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
