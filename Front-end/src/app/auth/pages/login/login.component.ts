import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})

export class LoginComponent {

  miFormulario: FormGroup = this.fb.group({
    email:    ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
  });

  constructor( private fb: FormBuilder,
              private router: Router, 
              private authService: AuthService) { }

  login() {  
    const { email, password } = this.miFormulario.value;

    this.authService.login( email, password )
      .subscribe( resp => {
        if ( resp.ok === true ) {
          this.router.navigateByUrl('/dashboard');
          Swal.fire('Buen trabajo!',resp.msg_es,'success');
        } else {
          Swal.fire('ERROR', resp.msg_es, 'error');
        }
      });
  }

}