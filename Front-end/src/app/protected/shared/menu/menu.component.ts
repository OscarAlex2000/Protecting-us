import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styles: [
    `
        nav {
            margin: 5px;
        }
    `
    ]
})

export class MenuComponent {

    get usuario() {
        return this.authService.usuario;
    }

    constructor( private router: Router,
            private authService: AuthService ) {}

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