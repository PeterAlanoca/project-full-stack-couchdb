import { Oscar } from '../value-objects/oscar.value-object.js';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.value-object.js';

export class MovieId extends UniqueId {
  static create(): MovieId {
    return new MovieId(UniqueId.generateCouchId('movie'));
  }

  static from(value: string): MovieId {
    return new MovieId(value);
  }

  protected constructor(value: string) {
    super(value);
  }
}

export interface MovieProps {
  id: MovieId;
  title: string;
  alternativeTitles: string[];
  durationMinutes: number;
  genres: string[];
  year: number;
  actors: string[];
  oscars: Oscar[];
  unitCostBs: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Movie {
  private constructor(private readonly props: MovieProps) {}

  static create(params: {
    title: string;
    alternativeTitles: string[];
    durationMinutes: number;
    genres: string[];
    year: number;
    actors: string[];
    oscars: Oscar[];
    unitCostBs: number;
  }): Movie {
    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Movie title cannot be empty.');
    }
    if (params.durationMinutes <= 0) {
      throw new Error('Duration must be greater than 0.');
    }
    if (params.unitCostBs < 0) {
      throw new Error('Unit cost cannot be negative.');
    }
    const now = new Date();
    return new Movie({
      id: MovieId.create(),
      title: params.title.trim(),
      alternativeTitles: params.alternativeTitles.map((t) => t.trim()),
      durationMinutes: params.durationMinutes,
      genres: params.genres,
      year: params.year,
      actors: params.actors.map((a) => a.trim()),
      oscars: params.oscars,
      unitCostBs: params.unitCostBs,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MovieProps): Movie {
    return new Movie(props);
  }

  get id(): MovieId {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get alternativeTitles(): string[] {
    return this.props.alternativeTitles;
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get genres(): string[] {
    return this.props.genres;
  }
  get year(): number {
    return this.props.year;
  }
  get actors(): string[] {
    return this.props.actors;
  }
  get oscars(): Oscar[] {
    return this.props.oscars;
  }
  get unitCostBs(): number {
    return this.props.unitCostBs;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(params: Partial<Omit<MovieProps, 'id' | 'createdAt'>>): Movie {
    return new Movie({
      ...this.props,
      ...params,
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return {
      _id: this.props.id.value,
      id: this.props.id.value,
      title: this.props.title,
      alternativeTitles: this.props.alternativeTitles,
      durationMinutes: this.props.durationMinutes,
      genres: this.props.genres,
      year: this.props.year,
      actors: this.props.actors,
      oscars: this.props.oscars.map((o) => o.toPlain()),
      unitCostBs: this.props.unitCostBs,
      createdAt: this.props.createdAt ? this.props.createdAt.toISOString() : '',
      updatedAt: this.props.updatedAt ? this.props.updatedAt.toISOString() : '',
    };
  }
}
