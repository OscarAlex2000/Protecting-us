import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import Swal from 'sweetalert2';

import { DashService } from '../../services/dashboard.service';

interface MarcadorColor {
  id: string;
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
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
      .list-group {
        position: fixed;
        top: 300px;
        right: 20px;
        z-index: 99;
      }
    }
    `
  ]
})

export class MapComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 16;
  // center: [number, number] = [ -102.76457, 20.81449 ];
  center: [number, number] = [ -102.78239, 20.847367 ];

  // Arreglo de marcadores
  marcadores: MarcadorColor[] = [];

  constructor(
    private dashService: DashService
  ) {}

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.leerLocalStorage();
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
      
    this.marcadores.push({
      id: "",
      color,
      marker: nuevoMarcador
    });

    // this.guardarMarcadores()

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadores();
    });
  }

  // Centrar marcador
  irMarcador( marcador: any ) {
    console.log(marcador)
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
  guardarMarcadores() {
    let lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach( m => {
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

      lngLatArr.push({
        id: id,
        color: color,
        centro: [ lng_aux, lat_aux ]
      });
    });

    // Petición a BD
    this.dashService.createMark( lngLatArr )
      .subscribe( (resp)  => {
        if ( resp.ok === false ) {
          Swal.fire('Error al guardar los datos', resp.msg_es, 'error');
        } else {
          this.marcadores = resp.mark;
          // lngLatArr = resp.marks;
        }
      });

    // Guardar en Local Storage
    // localStorage.setItem('marcadores', JSON.stringify(lngLatArr) );
  }

  leerLocalStorage() {
    if ( !localStorage.getItem('marcadores') ) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse( localStorage.getItem('marcadores')! );

    lngLatArr.forEach( m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
        .setLngLat( m.centro! )
        .addTo( this.mapa );

      this.marcadores.push({
        id: "",
        marker: newMarker,
        color: m.color
      });

      newMarker.on('dragend', () => {
        this.guardarMarcadores();
      });
    });
  }

  // Borrar marcador de mapa y de BD
  borrarMarcador( i: number ) {
    const marcador_to_delete = this.marcadores[i];
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);

    if ( marcador_to_delete.id ) {
      console.log('inside'); 
    }
    // this.guardarMarcadores();
  }

}
