import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { CompanyResponse, Company,
        BranchResponse, Branch,
        RegisterResponse, User,
        AuthResponse } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private api_key: string = environment.api_key;
  private baseUrl_users: string = environment.baseUrl_users;
  private baseUrl_companies: string = environment.baseUrl_companies;

  private _company!: Company;
  private _branch!: Branch;
  private _usuario!: User;

  get usuario() {
    return { ...this._usuario };
  }

  constructor( private http: HttpClient ) {}

  register( name: string, email: string, password: string ) {
    const url  = `${ this.baseUrl_users }/users/register`;
    const body = { name, user_name: email, password };

    return this.http.post<RegisterResponse>( url, body )
      .pipe(
        tap( ( resp ) => {
          console.log(resp);
        }),
        map( resp => resp ),
        catchError( err => of(err.error[0]) )
      );
  }

  login( email: string, password: string ) {
    const url  = `${ this.baseUrl_users }/auth/login`;
    const body = { user_name: email, password, keep_logged: true };

    return this.http.post<AuthResponse>( url, body )
      .pipe(
        tap( resp => {
          if ( resp.ok ) {
            localStorage.setItem('token', resp.token! );
          }
        }),
        map( resp => resp ),
        catchError( err => of(err.error) )
      );
  }

  validarToken(): Observable<boolean> {
    const url = `${ this.baseUrl_users }/auth/validate`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '' );

    return this.http.get<AuthResponse>( url, { headers } )
        .pipe(
          map( resp => {
            // localStorage.setItem('token', resp.token! );
            // console.log(resp)
            this._usuario = {
              _id: resp.user._id,
              name: resp.user.name,
              email: resp.user.user_name,
              first_lastname: resp.user.first_surname,
              second_lastname: resp.user.second_surname
            }

            return resp.ok;
          }),
          catchError( err => of(false) )
        );
  }

  logout() {
    localStorage.clear();
  }

} 