import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { User, Users, 
        UserResponse, UsersResponse, 
        MarkResponse, Marks } from '../../auth/interfaces/interfaces';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class DashService {

    search: string = '';

    private api_key: string = environment.api_key;
    private baseUrl_users: string = environment.baseUrl_users;

    private _usuario!: User;
    private _usuarios!: Users;
    private _totalUsuarios!: number; 

    private _marcadores!: Marks;
    private _totalMarcadores!: Marks;

    get usuario() {
        return { ...this._usuario };
    }

    get usuarios() {
        return { ...this._usuarios };
    }

    get totalUsuarios() {
        return this._totalUsuarios;
    }

    get marcadores() {
        return { ...this._marcadores };
    }

    get totalMarcadores() {
        return this._totalMarcadores;
    }

    constructor( private http: HttpClient ) {}

    // Obtener todos lo usuarios
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

    // Obtener usuario por id
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
                        second_lastname: resp.user.second_surname,
                        root: resp.user.root,
                        active: resp.user.active
                    }

                    return resp.ok;
                }),
                catchError( err => of(false) )
            );
    }

    // Actualizar usuario (id)
    updateUser( _id: string, name: string, first_lastname: string, second_lastname: string, active: boolean, root: boolean ) {
        const url  = `${ this.baseUrl_users }/users/${ _id }`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );
        const body = { name, first_surname: first_lastname, second_surname: second_lastname, active, root, keep_logged: true };
    
        return this.http.patch<any>( url, body, { headers } )
        .pipe(
            tap( resp => {
                // if ( resp.ok ) {}
            }),
            map( resp => resp ),
            catchError( err => of(err.error) )
        );
    }

    // Eliminar usuario
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

    /////////////// MARCADORES ///////////////
    // Obtener usuario por id
    getMarks( complete: boolean = false, limit: number = 10, order: string = 'asc' ): Observable<boolean> {
        const url = `${ this.baseUrl_users }/marks`;
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );
            console.log(complete)
        const params = { complete, limit, order };

        return this.http.get<any>( url, { headers, params } )
            .pipe(
                map( (resp) => {
                    this._marcadores = {
                        total: resp.count,
                        marks: resp.marks
                    }

                    if ( complete ) {
                        this._totalMarcadores = {
                            total: resp.count,
                            marks: resp.marks
                        }
                    }

                    return resp.ok;
                }),
                catchError( err => of(false) )
            );
    }

    // Crear y/o actualizar marcador
    createMark( marcadores: any[], info: string ) {
        const url = `${ this.baseUrl_users }/marks`;
        const body = { marks: marcadores, info };
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.post<MarkResponse>( url, body, { headers } )
        .pipe(
            tap( ( resp ) => {
                // console.log(resp);
            }),
            map( resp => resp ),
            catchError( err => of(err.error[0]) )
        );
    }

    // Eliminar marcador
    deleteMark( color: string, centro: any[] ): Observable<boolean> {
        const url = `${ this.baseUrl_users }/marks/deleted`;
        const body = { color, centro };
        const headers = new HttpHeaders()
            .set('x-token', localStorage.getItem('token') || '' );

        return this.http.post<any>( url, body, { headers } )
            .pipe(
                map( (resp) => {
                    return resp.ok;
                }),
                catchError( err => of(false) )
            );
    }

    logout() {
        localStorage.clear();
    }

} 