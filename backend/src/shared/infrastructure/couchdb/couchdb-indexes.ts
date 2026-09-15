import { Logger } from '@nestjs/common';
import * as nano from 'nano';

const logger = new Logger('CouchdbIndexes');

/**
 * All Mango indexes for the club_videos database.
 * Called during application bootstrap to ensure indexes exist.
 */
export const MANGO_INDEXES = [
  {
    name: 'idx_type',
    index: { fields: ['_type'] },
  },
  {
    name: 'idx_movie_title_genres_actors',
    index: { fields: ['_type', 'title', 'genres', 'actors'] },
  },
  {
    name: 'idx_copy_movie_status',
    index: { fields: ['_type', 'movieId', 'status'] },
  },
  {
    name: 'idx_customer_status_email',
    index: { fields: ['_type', 'status', 'email'] },
  },
  {
    name: 'idx_rental_customer_status',
    index: { fields: ['_type', 'customerId', 'status'] },
  },
  {
    name: 'idx_rental_status_duedate',
    index: { fields: ['_type', 'status', 'dueDate'] },
  },
  {
    name: 'idx_admin_username',
    index: { fields: ['type', 'username'] },
  },
];

export async function ensureIndexes(db: nano.DocumentScope<any>): Promise<void> {
  for (const idx of MANGO_INDEXES) {
    try {
      await db.createIndex({ name: idx.name, index: idx.index });
      logger.log(`Index '${idx.name}' ensured.`);
    } catch (err: any) {
      logger.warn(`Could not create index '${idx.name}': ${err?.message}`);
    }
  }
}
