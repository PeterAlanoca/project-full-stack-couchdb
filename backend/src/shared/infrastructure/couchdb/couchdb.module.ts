import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nano from 'nano';

export const COUCHDB_CLIENT = 'COUCHDB_CLIENT';
export const COUCHDB_DATABASE = 'COUCHDB_DATABASE';

@Module({
  providers: [
    {
      provide: COUCHDB_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('COUCHDB_HOST', 'localhost');
        const port = configService.get<number>('COUCHDB_PORT', 5984);
        const user = configService.get<string>('COUCHDB_USER', 'admin');
        const password = configService.get<string>('COUCHDB_PASSWORD', 'admin_password');
        return nano.default(`http://${user}:${password}@${host}:${port}`);
      },
      inject: [ConfigService],
    },
    {
      provide: COUCHDB_DATABASE,
      useFactory: async (client: nano.ServerScope, configService: ConfigService) => {
        const dbName = configService.get<string>('COUCHDB_DATABASE', 'club_videos');
        try {
          await client.db.create(dbName);
        } catch (err: any) {
          // Database already exists — this is expected
          if (err?.error !== 'file_exists') {
            throw err;
          }
        }
        return client.db.use(dbName);
      },
      inject: [COUCHDB_CLIENT, ConfigService],
    },
  ],
  exports: [COUCHDB_CLIENT, COUCHDB_DATABASE],
})
export class CouchdbModule {}
