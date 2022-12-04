import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { User, Users, 
    UserResponse, UsersResponse } from '../../auth/interfaces/interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class DashService {

    search: string = '';

    private api_key: string = environment.api_key;
    private baseUrl_users: string = environment.baseUrl_users;
    private baseUrl_companies: string = environment.baseUrl_companies;

    private _usuario!: User;
    private _usuarios!: Users;
    private _totalUsuarios!: number; 

    get usuario() {
        return { ...this._usuario };
    }

    get usuarios() {
        return { ...this._usuarios };
    }

    get totalUsuarios() {
        return this._totalUsuarios  ;
    }

    constructor( private http: HttpClient ) {}

    getUsers( search: string = '' ): Observable<boolean> {
        const url = `${ this.baseUrl_users }/users`;
        const params = { search };
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.get<UsersResponse>( url, { headers, params } )
            .pipe(
            map( (resp) => {
                this._usuarios = {
                    total: resp.count,
                    users: resp.users
                }

                return resp.ok;
            }),
            catchError( err => of(false) )
            );
    }

    getUser( id: string ): Observable<boolean> {
        const url = `${ this.baseUrl_users }/users/${ id }`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.get<UserResponse>( url, { headers } )
            .pipe(
                map( (resp) => {
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

    updateUser( _id: string, name: string, first_lastname: string, second_lastname: string ) {
        const url  = `${ this.baseUrl_users }/users/${ _id }`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );
        const body = { name, first_surname: first_lastname, second_surname: second_lastname, keep_logged: true };
    
        return this.http.patch<any>( url, body, { headers } )
        .pipe(
            tap( resp => {
                if ( resp.ok ) {}
            }),
            map( resp => resp ),
            catchError( err => of(err.error) )
        );
    }

    deleteUser( id: string ): Observable<boolean> {
        const url = `${ this.baseUrl_users }/users/${ id }`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.delete<any>( url, { headers } )
            .pipe(
                map( (resp) => {
                    // console.log(resp);

                    return resp.ok;
                }),
                catchError( err => of(false) )
            );
    }

    logout() {
        localStorage.clear();
    }

} 