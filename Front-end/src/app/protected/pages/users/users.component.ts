import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { DashService } from '../../services/dashboard.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styles: []
})

export class UsersComponent implements OnInit {

    getInfo: boolean = false;
    @Input() search: string = '';
    @Output('ngModelChange') update = new EventEmitter();

    get usuario() {
        return this.authService.usuario;
    }

    get usuarios() {
        return this.dashService.usuarios;
    }

    get totalUsuarios() {
        return this.dashService.totalUsuarios;
    }

    constructor( private router: Router,
                private dashService: DashService,
                private authService: AuthService ) {}

    ngOnInit(): void {
        this.getUsers('');
    }

    getUsers( search: any = '' ) { 
        ( search.target === undefined || search.target === null ) ? search = '' : search = search.target.value;
        this.dashService.getUsers( search )
            .subscribe( resp => {
                if ( resp === true ) {
                    this.getInfo = true;
                } else {
                    Swal.fire('ERROR', 'Error al obtener los usuarios', 'error');
                }
            });
    }

    deleteUser( id: string ) {
        if ( id === this.usuario._id ) {
            Swal.fire(
                'ERROR', 
                'No se puede eliminar un usuario activo', 
                'error'
            );
        } else {
            Swal.fire({
                title: '¿Estas seguro?',
                text: "¡No se podrá revertir el proceso!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#7D7F7D',
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.dashService.deleteUser( id )
                    .subscribe( (resp)  => {
                        if ( resp === true ) {
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Usuario Eliminado',
                                showConfirmButton: false,
                                timer: 1500
                            })
                            this.getUsers();
                        } else {
                            Swal.fire('ERROR', 'No se pudo eliminar usuario', 'error');
                        }
                    });
                }
            })
        }
    }
}