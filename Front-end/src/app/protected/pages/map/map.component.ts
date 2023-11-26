import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import Swal from 'sweetalert2';

import { DashService } from '../../services/dashboard.service';
import { PlacesService } from '../../services/places.service';

interface MarcadorColor {
  _id?: string,
  id: string;
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
  location?: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styles: [
    `
    .mapa-container {
      height: 100%;
      width: 100%; 
    }

    .list-group-own {
      position: fixed;
      top: 100px;
      left: 20px;
      z-index: 99;
    }

    .list-group {
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 99;
    }
    
    li {
      cursor: pointer;
    }

    @media screen and (max-width: 991px){
      .list-group-own {
        position: fixed;
        top: 700px;
        left: 10px;
        z-index: 99;
      }

      .list-group {
        position: fixed;
        top: 270px;
        right: 10px;
        z-index: 99;
      }
    }
    `
  ]
})

export class MapComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;

  prueba: boolean = true; 

  mapa!: mapboxgl.Map;
  zoomLevel: number = 16;
  // center: [number, number] = [ -102.76457, 20.81449 ];
  center: [number, number] = [ -102.78239, 20.847367 ];
  userLocation: [number, number] = this.placesService.userLocation || [ -102.78239, 20.847367 ];

  // Arreglo de marcadores
  marcadoresArr: MarcadorColor[] = [];

  get marcadores() { 
    return this.dashService.marcadores;
  }

  get totalMarcadores() {
    return this.dashService.totalMarcadores;
  }

  get isUserLocationReady() {
    return this.placesService.userLocation;
  }

  constructor(
    private router: Router,
    private dashService: DashService,
    private placesService: PlacesService
  ) {}

  ngOnInit(): void {
    // if( !this.placesService.userLocation ) throw Error('No hay placesService');
    this.getMarks( false ); // Traer los marcadores activos
  }

  ngAfterViewInit(): void { 
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    const popup = new mapboxgl.Popup()
    .setHTML(`
      <h6>Aqui estoy yo</h6>
      <spam>En algun lugardel mundo</spam>
      `)
    const color = "#FF0000";
    const ubicacionPrueba: [number,number] = ( !this.prueba ) ? this.userLocation : [ -102.78239, 20.847367 ];
    const geolocalizacion = new mapboxgl.Marker({
      draggable: false,
      color,
    })
      .setLngLat( ubicacionPrueba )
      .setPopup( popup )
      .addTo( this.mapa );

    geolocalizacion.on('dragend', () => {});
  }

  getMarks( complete: boolean = false ) { 
    this.dashService.getMarks( complete )
    .subscribe( resp => {
        if ( resp === true ) {
          console.log(resp);
          this.leerLocalStorage();
        } else {
            Swal.fire('ERROR', 'Error al obtener los marcadores', 'error');
        }
    });
  }

  agregarMarcador() {
    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
    // const color = "#FF0000"

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color
    })
      .setLngLat( this.center )
      .addTo( this.mapa );
      
    this.marcadoresArr.push({
      id: "",
      color,
      marker: nuevoMarcador
    });

    // this.guardarMarcadores()
    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadores();
    });
  }

  // Ir a mi ubicacion
  irUbicacion() {
    const ubicacionPrueba: [number,number] = ( !this.prueba ) ? this.userLocation : [ -102.78239, 20.847367 ];
    this.mapa.flyTo({
      center: ubicacionPrueba
    });
  }

  // Centrar marcador
  irMarcador( marcador: any ) {
    if ( !marcador.centro ) {
      this.mapa.flyTo({
        center: marcador.marker.getLngLat()
      });
    } else {
      this.mapa.flyTo({
        center: [marcador.centro[0], marcador.centro[1]]
      });
    }
  }

  // Guardar y/o actualizar marcadores en BD
  guardarMarcadores( deleteId: string = '', i: number = 0 ) {
    let lngLatArr: MarcadorColor[] = [];

    if ( this.marcadoresArr.length === 0 ){
      return;
    }

    this.marcadoresArr.forEach( m => {
      const id = m.id
      const color = m.color;
      let lng_aux = 0;
      let lat_aux = 0;

      if ( !m.centro ) {
        const { lng, lat } = m.marker!.getLngLat();
        lng_aux = lng;
        lat_aux = lat;
      } else {
        lng_aux = m.centro[0];
        lat_aux = m.centro[1];
      }

      console.log(m.marker)

      lngLatArr.push({
        id: id,
        color: color,
        centro: [ lng_aux, lat_aux ],
        //location: JSON.stringify(m.marker!)
      });

    });

    if ( lngLatArr.length === 0 ){
      return;
    }
    // Petición a BD
    this.dashService.createMark( lngLatArr )
      .subscribe( (resp)  => {
        if ( resp.ok === false ) {
          Swal.fire('Error al guardar los datos', resp.msg_es, 'error');
        } else {
          this.marcadoresArr = resp.mark;
          // lngLatArr = resp.marks;
        }
      });

    // Guardar en Local Storage
    // localStorage.setItem('marcadores', JSON.stringify(lngLatArr) );
  }

  leerLocalStorage() {
    // if ( !localStorage.getItem('marcadores') ) {
    //   return;
    // }
    if (this.dashService.marcadores.marks.length === 0) {
      return;
    }

    // const lngLatArr: MarcadorColor[] = JSON.parse( localStorage.getItem('marcadores')! );
    const lngLatArr: MarcadorColor[] = this.dashService.marcadores.marks;

    lngLatArr.forEach( m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
        .setLngLat( m.centro! )
        .addTo( this.mapa );

      this.marcadoresArr.push({
        id: (!m._id) ? "" : m._id,
        marker: newMarker,
        color: m.color,
        location: m.location
      });

      newMarker.on('dragend', () => {
        this.guardarMarcadores();
      });
    });
  }

  // Borrar marcador de mapa y de BD
  borrarMarcador( i: number ) {
    const marcador_to_delete = this.marcadoresArr[i];
    
    if ( !marcador_to_delete.id ) {
      this.marcadoresArr[i].marker?.remove();
      this.marcadoresArr.splice(i, 1);
      this.guardarMarcadores();
    } else {
      this.dashService.deleteMark( marcador_to_delete.id )
        .subscribe( (resp)  => {
          if ( resp === true ) {
            const markerOld = JSON.parse(this.marcadoresArr[i].location!);
            console.log(markerOld);
            
            // makerOld.remove();
            this.marcadoresArr.splice(i, 1);
            this.guardarMarcadores(marcador_to_delete.id, i);
          } else {
              Swal.fire('ERROR', 'No se pudo eliminar marcador', 'error');
          }
        });
    }
  }

}
