// Register user interface
export interface RegisterResponse {
    ok: boolean,
    msg: string,
    msg_es: string,
    user: {
        company_id: string,
        _id: string,
        name: string,
        user_name: string,
        password: string,
        created_by?: string,
        updated_by: string,
    }
}

export interface User {
    _id: string;
    name: string;
    email: string;
    first_lastname: string;
    second_lastname: string;
    root: boolean;
    active: boolean;
}

// Auth user
export interface AuthResponse {
    ok: boolean
    msg: string,
    msg_es: string,
    user: {
        old_id: number,
        _id: string,
        company_id: string,
        branch_id: string,
        account_id: string,
        name: string,
        first_surname: string,
        second_surname: string,
        gender: string,
        user_name: string,
        thumbnail_image_name: string,
        thumbnail_image_url: string,
        image_name: string,
        image_url: string,
        validation_code: string,
        validated: boolean,
        validation_date: string,
        authorize: boolean,
        authorize_code: string,
        check_in_require: boolean,
        last_check_in: string,
        password_change_date: string,
        root: boolean,
        permissions: [],
        profiles: [],
        all_permissions: [],
        active: boolean,
        last_login: string,
        session_expire: string,
        created_at: string,
        updated_at: string,
        deleted_at: string,
        created_by: {},
        updated_by: {}
    },
    token: string
}

// Get users
export interface UsersResponse {
    ok: boolean,
    count: number,
    msg: string,
    msg_es: string,
    users: any[]
}

// Users
export interface Users {
    total: number,
    users: any[]
}

// Get user by id
export interface UserResponse {
    ok: boolean,
    msg: string,
    msg_es: string,
    user: {
        active: boolean;
        root: boolean;
        _id: string,
        name: string,
        user_name: string,
        first_surname: string,
        second_surname: string
    }
}

// Get Marks
export interface Marks {
    total: number,
    marks: any[]
}

// Create Mark
export interface MarkResponse {
    ok: boolean,
    msg: string,
    msg_es: string,
    mark: any[]
}
