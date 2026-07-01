declare const loggerConfig: import("@adonisjs/logger/types").LoggerManagerConfig<{
    app: {
        enabled: true;
        name: string | undefined;
        level: string;
        destination: import("pino").DestinationStream | undefined;
        transport: {
            targets: import("pino").TransportTargetOptions<Record<string, any>>[];
        };
    };
}>;
export default loggerConfig;
declare module '@adonisjs/core/types' {
    interface LoggersList extends InferLoggers<typeof loggerConfig> {
    }
}
