// config/plugins.ts
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
    // ✅ عطّل الـ cloud-cronjob-runner
    'cloud-cronjob-runner': {
        enabled: false,
    },
});

export default config;