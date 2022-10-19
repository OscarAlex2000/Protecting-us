import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { User, Users, UsersResponse } from '../../auth/interfaces/interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class DashService {

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

    getUsers(): Observable<boolean> {
        const url = `${ this.baseUrl_users }/users`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.get<UsersResponse>( url, { headers } )
            .pipe(
            map( (resp) => {
                console.log(resp);
                this._usuarios = {
                    total: resp.count,
                    users: resp.users
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