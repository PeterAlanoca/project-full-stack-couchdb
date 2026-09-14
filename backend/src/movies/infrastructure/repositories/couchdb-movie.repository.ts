import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import {
  IMovieRepository,
  MovieSearchCriteria,
} from '../../domain/repositories/movie.repository.interface.js';
import { Movie, MovieId, MovieProps } from '../../domain/entities/movie.entity.js';
import { Oscar } from '../../domain/value-objects/oscar.value-object.js';

interface MovieDocument {
  _id: string;
  _rev?: string;
  type: 'movie';
  title: string;
  alternativeTitles: string[];
  durationMinutes: number;
  genres: string[];
  year: number;
  actors: string[];
  oscars: { category: string; year: number; won: boolean }[];
  unitCostBs: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CouchdbMovieRepository implements IMovieRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<MovieDocument>,
  ) {}

  private toEntity(doc: MovieDocument): Movie {
    return Movie.reconstitute({
      id: MovieId.from(doc._id),
      title: doc.title,
      alternativeTitles: doc.alternativeTitles || [],
      durationMinutes: doc.durationMinutes,
      genres: doc.genres || [],
      year: doc.year,
      actors: doc.actors || [],
      oscars: (doc.oscars || []).map((o) => Oscar.create(o.category, o.year, o.won)),
      unitCostBs: doc.unitCostBs,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    } as MovieProps);
  }

  private toDocument(movie: Movie): Omit<MovieDocument, '_rev'> {
    return {
      _id: movie.id.value,
      type: 'movie',
      title: movie.title,
      alternativeTitles: movie.alternativeTitles,
      durationMinutes: movie.durationMinutes,
      genres: movie.genres,
      year: movie.year,
      actors: movie.actors,
      oscars: movie.oscars.map((o) => o.toPlain()),
      unitCostBs: movie.unitCostBs,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<Movie | null> {
    try {
      const doc = await this.db.get(id);
      return this.toEntity(doc);
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Movie[]> {
    const result = await this.db.find({
      selector: { type: 'movie' },
    });
    return result.docs.map((d) => this.toEntity(d));
  }

  async search(criteria: MovieSearchCriteria): Promise<Movie[]> {
    const conditions: any[] = [{ type: 'movie' }];

    if (criteria.title) {
      conditions.push({
        $or: [
          { title: { $regex: `(?i)${criteria.title}` } },
          { alternativeTitles: { $elemMatch: { $regex: `(?i)${criteria.title}` } } },
        ],
      });
    }
    if (criteria.genre) {
      conditions.push({ genres: { $elemMatch: { $regex: `(?i)${criteria.genre}` } } });
    }
    if (criteria.actor) {
      conditions.push({ actors: { $elemMatch: { $regex: `(?i)${criteria.actor}` } } });
    }
    if (criteria.oscarCategory) {
      conditions.push({
        oscars: { $elemMatch: { category: { $regex: `(?i)${criteria.oscarCategory}` } } },
      });
    }

    const result = await this.db.find({
      selector: conditions.length > 1 ? { $and: conditions } : { type: 'movie' },
    });
    return result.docs.map((d) => this.toEntity(d));
  }

  async save(movie: Movie): Promise<Movie> {
    const doc = this.toDocument(movie);
    await this.db.insert(doc as MovieDocument);
    return movie;
  }

  async update(movie: Movie): Promise<Movie> {
    const existing = await this.db.get(movie.id.value);
    const doc = { ...this.toDocument(movie), _rev: existing._rev };
    await this.db.insert(doc as MovieDocument);
    return movie;
  }
}
