export interface GeoPoint {
  type: 'Point';
  coordinates: [longitude: number, latitude: number];
}

export class Geolocation {
  private constructor(
    private readonly _longitude: number,
    private readonly _latitude: number,
  ) {}

  static create(longitude: number, latitude: number): Geolocation {
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}`);
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}`);
    }
    return new Geolocation(longitude, latitude);
  }

  static fromGeoPoint(point: GeoPoint): Geolocation {
    return new Geolocation(point.coordinates[0], point.coordinates[1]);
  }

  get longitude(): number {
    return this._longitude;
  }

  get latitude(): number {
    return this._latitude;
  }

  toGeoPoint(): GeoPoint {
    return {
      type: 'Point',
      coordinates: [this._longitude, this._latitude],
    };
  }
}
