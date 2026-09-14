import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface LatLng {
  lat: number;
  lng: number;
}

// Fix default marker icon paths broken by Webpack/Angular bundler
const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss',
})
export class MapPickerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  /** Initial / externally controlled latitude (default: La Paz, Bolivia) */
  @Input() lat = -16.5;
  /** Initial / externally controlled longitude (default: La Paz, Bolivia) */
  @Input() lng = -68.15;

  /** Emits every time the user clicks on the map */
  @Output() locationSelected = new EventEmitter<LatLng>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  displayAddress = signal<string>('Haz clic en el mapa para seleccionar una ubicación');

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['lat'] || changes['lng']) && this.map) {
      const latlng: L.LatLngExpression = [this.lat, this.lng];
      this.map.setView(latlng, this.map.getZoom());
      this.placeMarker(L.latLng(this.lat, this.lng));
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const container = this.mapContainer.nativeElement;
    if (!container) return;

    this.map = L.map(container, {
      center: [this.lat, this.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Place an initial marker
    this.placeMarker(L.latLng(this.lat, this.lng));

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng);
      this.locationSelected.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  private placeMarker(latlng: L.LatLng): void {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, { draggable: true }).addTo(this.map);

      this.marker.on('dragend', (e: L.LeafletEvent) => {
        const pos = (e.target as L.Marker).getLatLng();
        this.locationSelected.emit({ lat: pos.lat, lng: pos.lng });
        this.reverseGeocode(pos.lat, pos.lng);
      });
    }
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.display_name) {
          this.displayAddress.set(data.display_name);
        }
      })
      .catch(() => {
        this.displayAddress.set(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      });
  }
}
