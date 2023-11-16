import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})

export class LoginComponent {

  miFormulario: UntypedFormGroup = this.fb.group({
    email:    ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
  });

  constructor( private fb: UntypedFormBuilder,
              private router: Router, 
              private authService: AuthService) {}

  login() {  
    const { email, password } = this.miFormulario.value;

    this.authService.login( email, password )
      .subscribe( resp => {
        if ( resp.ok === true ) {
          this.router.navigateByUrl('/dashboard');
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Inicio de sesión exitoso!',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          this.miFormulario.reset()
          Swal.fire('ERROR', resp.msg_es, 'error');
        }
      });
  }

}