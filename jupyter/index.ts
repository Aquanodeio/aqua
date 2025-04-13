import {
    ServiceType,
    ServiceDeploymentConfig,
    InputConfig,
    OutputConfig,
} from "../types";
import {
    JUPYTER_DEFAULT_CPU,
    JUPYTER_DEFAULT_MEMORY,
    JUPYTER_DEFAULT_STORAGE,
    JUPYTER_DEFAULT_PORT,
    JUPYTER_DEFAULT_DURATION,
} from "../default.config";

export class JupyterService implements ServiceDeploymentConfig {
    SERVICE_IMAGE = "jupyter/minimal-notebook";
    SERVICE_TYPE = "JUPYTER";

    getServiceType(): ServiceType {
        return this.SERVICE_TYPE;
    }

    getDefaultDeploymentConfig(config: Partial<InputConfig>): OutputConfig {
        try {
            const baseConfig: OutputConfig = {
                serviceType: this.SERVICE_TYPE,
                appPort: JUPYTER_DEFAULT_PORT,
                spheronDeploymentMode: config?.spheronDeploymentMode,
                deploymentDuration: JUPYTER_DEFAULT_DURATION,
                appCpuUnits: JUPYTER_DEFAULT_CPU,
                appMemorySize: JUPYTER_DEFAULT_MEMORY,
                appStorageSize: JUPYTER_DEFAULT_STORAGE,
                image: this.SERVICE_IMAGE,
                repoUrl: config?.repoUrl,
                branchName: config?.branchName || "main",
                env: {
                    JUPYTER_ENABLE_LAB: "yes",
                    JUPYTER_TOKEN: "password", 
                    JUPYTER_PASSWORD: "password",
                    ...config?.envVars
                },
            };

            return baseConfig;
        } catch (error: any) {
            throw new Error(
                `Failed to create default jupyter deployment config: ${error.message}`
            );
        }
    }

    getCustomDeploymentConfig(config: Partial<InputConfig>): OutputConfig {
        try {
            if (!config?.appPort) {
                throw new Error(
                    "App port is required for Jupyter Service"
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
                `Failed to create custom jupyter deployment config: ${error.message}`
            );
        }
    }
}
