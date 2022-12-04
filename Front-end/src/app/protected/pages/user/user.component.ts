import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';

import { DashService } from '../../services/dashboard.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styles: []
})

export class UserComponent implements OnInit {

    emailEdit: boolean = true; // Can you edit email?
    returnButton: boolean = true;
    get usuario() {
        return this.dashService.usuario;
    }

    constructor( private fb: FormBuilder, 
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private dashService: DashService,
        private authService: AuthService  ) {}

    miFormulario: FormGroup = this.fb.group({
        name: [ , [ Validators.required ] ],
        first_lastname: [ , [ Validators.required ] ],
        second_lastname: [ , [ Validators.required ] ],
        email: [ , [ Validators.required, Validators.email ] ],
    });

    ngOnInit(): void {
        if( !this.router.url.includes('user') ) {
            this.returnButton = false;
            this.activatedRoute.params
            .pipe(
                switchMap( ({ id }) => this.dashService.getUser( id ) )
            )
            .subscribe( user => console.log(user) );
            return;
        }
    
        this.activatedRoute.params
        .pipe(
            switchMap( ({ id }) => this.dashService.getUser( id ) )
        )
        .subscribe( user => console.log(user) );
    }

    updateUser() {
        let user = {
            name: '',
            first_lastname: '',
            second_lastname: '',
            email: ''
        };
        const { name, first_lastname, second_lastname, email } = this.miFormulario.value;

        // console.log(this.miFormulario);
        // console.log(this.miFormulario.controls.name.touched)
        // return;
        user.name = this.miFormulario.controls.name.touched ? name : this.usuario.name;
        user.first_lastname = this.miFormulario.controls.first_lastname.touched ? first_lastname : this.usuario.first_lastname;
        user.second_lastname = this.miFormulario.controls.second_lastname.touched ? second_lastname : this.usuario.second_lastname;
        user.email = this.miFormulario.controls.email.touched ? this.usuario.email : this.usuario.email;
    
        this.dashService.updateUser( this.usuario._id, user.name, user.first_lastname, user.second_lastname )
        .subscribe( (resp)  => {
            if ( resp.ok === true ) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Datos actualizados correctamente!',
                    text: resp.msg_es,
                    showConfirmButton: false,
                    timer: 1500
                });
                // Swal.fire('Datos actualizados correctamente!',resp.msg_es,'success');
            } else {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Error al guardar los datos',
                    text: resp.msg_es,
                    showConfirmButton: false,
                    timer: 1500
                });
                // Swal.fire('Error al guardar los datos', resp.msg_es, 'error');
            }
        });
    }

    returnUsers() {
        this.router.navigateByUrl('/dashboard/users');
    }

}