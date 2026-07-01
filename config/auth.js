import { defineConfig } from '@adonisjs/auth';
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session';
const authConfig = defineConfig({
    default: 'web',
    guards: {
        web: sessionGuard({
            useRememberMeTokens: false,
            provider: sessionUserProvider({
                model: () => import('#models/user'),
            }),
        }),
        client: sessionGuard({
            useRememberMeTokens: false,
            provider: sessionUserProvider({
                model: () => import('#models/client_account'),
            }),
        }),
    },
});
export default authConfig;
