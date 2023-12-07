import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SocketService } from '../../services/socket.service';
import { DashService } from '../../services/dashboard.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styles: [
    `
        nav {
            margin: 0px;
        }

        .sm-not {
            display: none; 
        }

        .nav-not {
            margin-left: auto;
        }

        .notMark {
            width: 200px;
        }

        @media only screen and (max-width: 991px) { 
            .sm-not {
                display: flex; 
                margin-left: auto;
            }
        }
    `
    ]
})

export class MenuComponent {

    notifications: any[] = [];

    get marcadores() { 
        return this.dashService.marcadores;
    }

    get usuario() {
        return this.authService.usuario;
    }

    constructor( 
        private router: Router,
        private authService: AuthService,
        private dashService: DashService,
        private socketService: SocketService ) {}

    ngOnInit(): void {
        this.getMarks( false ); // Traer los marcadores activos
    }

    getMarks( complete: boolean = false ) { 
        this.dashService.getMarks( complete, 5, 'desc' )
        .subscribe( resp => {
            if ( resp === true ) {
                console.log(resp);
                this.notifications = this.dashService.marcadores.marks; 
            }
        });
    }

    navigate( rute: string ) {
        this.router.navigateByUrl(`${ rute }`);
    }

    navigateUser( id: string ) {
        this.router.navigateByUrl(`/dashboard/own/${ id }`);
    }

    logout() {
        this.router.navigateByUrl('/auth');
        this.authService.logout();
    }

}