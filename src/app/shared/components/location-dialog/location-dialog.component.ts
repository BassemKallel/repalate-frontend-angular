import { Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef } from '@angular/core';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

declare var google: any;

@Component({
  selector: 'app-location-picker-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss']
})
export class LocationPickerDialogComponent implements OnInit {
  @Input() initialLocation: string = '';
  @Output() locationSelected = new EventEmitter<LocationData>();
  @Output() closed = new EventEmitter<void>();
  
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  map: any;
  marker: any;
  geocoder: any;
  selectedAddress: string = '';
  isLoading = true;
  
  ngOnInit() {
    this.loadGoogleMaps();
  }
  
  loadGoogleMaps() {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => this.initializeMap();
      document.head.appendChild(script);
    } else {
      this.initializeMap();
    }
  }
  
  initializeMap() {
    this.geocoder = new google.maps.Geocoder();
    const initialCenter = { lat: 36.8065, lng: 10.1815 }; // Default to Tunisia
    
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: initialCenter,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });
    
    // Add click listener
    this.map.addListener('click', (e: any) => {
      this.placeMarker(e.latLng);
      this.getAddressFromLatLng(e.latLng);
    });
    
    // Initialize marker if we have an initial location
    if (this.initialLocation) {
      this.geocodeAddress(this.initialLocation);
    }
    
    this.isLoading = false;
  }
  
  placeMarker(location: any) {
    if (this.marker) {
      this.marker.setMap(null);
    }
    
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      draggable: true
    });
    
    // Update position on marker drag
    this.marker.addListener('dragend', (e: any) => {
      this.getAddressFromLatLng(e.latLng);
    });
    
    // Center the map on the marker
    this.map.panTo(location);
  }
  
  getAddressFromLatLng(latLng: any) {
    this.geocoder.geocode({ location: latLng }, (results: any, status: string) => {
      if (status === 'OK' && results[0]) {
        this.selectedAddress = results[0].formatted_address;
      }
    });
  }
  
  geocodeAddress(address: string) {
    this.geocoder.geocode({ address }, (results: any, status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        this.placeMarker(location);
        this.map.setCenter(location);
        this.selectedAddress = results[0].formatted_address;
      }
    });
  }
  
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 3) {
      this.geocodeAddress(input.value);
    }
  }
  
  selectLocation() {
    if (this.marker) {
      const location = this.marker.getPosition();
      this.locationSelected.emit({
        address: this.selectedAddress,
        lat: location.lat(),
        lng: location.lng()
      });
    }
  }
  
  closeDialog() {
    this.closed.emit();
  }
}
