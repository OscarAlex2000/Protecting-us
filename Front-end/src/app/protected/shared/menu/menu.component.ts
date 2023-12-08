import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SocketService } from '../../services/socket.service';
import { DashService } from '../../services/dashboard.service';
import { baseApiUrl } from 'mapbox-gl';
import { environment } from 'src/environments/environment';

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
    private baseUrl_users: string = environment.baseUrl_users;

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
        this.obtenerNotification()
    }

    getMarks( complete: boolean = false ) { 
        this.dashService.getMarks( complete, 5, 'desc' )
        .subscribe( resp => {
            if ( resp === true ) {
                // console.log(resp);
                this.notifications = this.dashService.marcadores.marks; 
            }
        });
    }

    obtenerNotification() {
        const node  = new EventSource(`${ this.baseUrl_users }/socket?complete=false&limit=5&order=desc`);
        node.addEventListener('message', message => {
            let data = JSON.parse(message.data);
            // console.log(data);
            this.notifications = data.marks;
        })
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