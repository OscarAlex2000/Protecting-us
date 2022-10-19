import { Component, OnInit } from '@angular/core';
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

    get usuarios() {
        return this.dashService.usuarios;
    }

    get totalUsuarios() {
        return this.dashService.totalUsuarios;
    }

    constructor( private dashService: DashService ) {}

    ngOnInit(): void {
        this.getUsers();
    }

    async getUsers() {  
        await this.dashService.getUsers()
            .subscribe( resp => {
                if ( resp === true ) {  
                    console.log('Good')
                    this.getInfo = true;
                } else {
                    Swal.fire('ERROR', 'Error al obtener los usuarios', 'error');
                }
            });
    }

}