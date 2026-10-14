import {defineConfig} from 'vite';
import vinext from 'vinext';
import {cloudflare} from '@cloudflare/vite-plugin';

// Separate public hosting from the retained Sites/local preview configuration.
export default defineConfig({plugins:[vinext(),cloudflare({
 viteEnvironment:{name:'rsc',childEnvironments:['ssr']},
 config:{name:'ai-frontier',main:'./worker/cloudflare.ts',compatibility_date:'2026-05-15',compatibility_flags:['nodejs_compat'],
  d1_databases:[{binding:'DB',database_name:'ai-frontier-news',database_id:process.env.CLOUDFLARE_D1_DATABASE_ID||'00000000-0000-4000-8000-000000000000',migrations_dir:'drizzle'}]},
})]});
