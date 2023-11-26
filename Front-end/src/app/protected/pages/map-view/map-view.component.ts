import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-map-view',
  standalone: false,
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})

export class MapViewComponent {

  get isUserLocationReady() {
    return this.placesService.isUserLocationReady;
  }

  constructor(
    private placesService: PlacesService
  ) {}

  ngOnInit(): void {
    // console.log(this.placesService.userLocation);
  }
}
