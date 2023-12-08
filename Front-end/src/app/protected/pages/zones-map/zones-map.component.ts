import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { DashService } from '../../services/dashboard.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-zones-map',
  standalone: false,
  templateUrl: './zones-map.component.html',
  styleUrl: './zones-map.component.css'
})

export class ZonesMapComponent {

  getInfo: boolean = false;

  get totalMarcadores() {
    return this.dashService.totalMarcadores;
  }

  constructor( private dashService: DashService) {}

  ngOnInit(): void {
    this.getMarks();
  }

  getMarks() { 
    this.dashService.getMarks( true, 10, 'desc' )
    .subscribe( resp => {
        if ( resp === true ) {
          // console.log(resp);
          this.getInfo = true;
        } else {
            Swal.fire('ERROR', 'Error al obtener los marcadores', 'error');
        }
    });
  }

}
