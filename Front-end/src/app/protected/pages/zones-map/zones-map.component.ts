import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { DashService } from '../../services/dashboard.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-zones-map',
  standalone: false,
  templateUrl: './zones-map.component.html',
  styleUrl: './zones-map.component.css'
})

export class ZonesMapComponent {

  getInfo: boolean = false;

  get usuario() {
    localStorage.setItem('_id', this.authService.usuario._id );
    return this.authService.usuario;
  }

  get totalMarcadores() {
    return this.dashService.totalMarcadores;
  }

  constructor( private dashService: DashService,
              private authService: AuthService,
              private router: Router, ) {}

  ngOnInit(): void {
    if ( !this.authService.usuario.root ) {
      Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Tu usuario no puede acceder a este apartado!',
          showConfirmButton: false,
          timer: 1500
      });
      this.router.navigateByUrl('/dashboard');
    }
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
