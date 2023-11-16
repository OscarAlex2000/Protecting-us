import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})

export class RegisterComponent {

  miFormulario: UntypedFormGroup = this.fb.group({
    name:     ['', [ Validators.required ]],
    email:    ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
  });

  constructor( private fb: UntypedFormBuilder,
              private router: Router,
              private authService: AuthService ) {}

  registro() {
    const { name, email, password } = this.miFormulario.value;

    this.authService.register( name, email, password )
      .subscribe( (resp)  => {
        if ( resp.ok === true ) {
          Swal.fire('Datos guardados correctamente!',resp.msg_es,'success')
          this.router.navigateByUrl('/login');
        } else {
          Swal.fire('Error al guardar los datos', resp.msg_es, 'error');
        }
      });
  }

}