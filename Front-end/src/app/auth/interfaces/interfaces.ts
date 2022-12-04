// Company interface
export interface CompanyResponse {
    _id: string,
    key: string,
    name: string,
    address: string,
    phone_number: number,
    rfc: string,
    email: string,
    business_name: string,
    disabled: boolean,
    status: boolean,
    created_at: string
}

export interface Company {
    _id: string;
    name: string;
}

// Branch interface
export interface BranchResponse {
    total: number,
    branches: [
        {
            _id: string,
            company_id: string,
            name: string,
            stole: boolean
            mac_address: [],
            phone_number: number
            address: string,
            email: string
            disabled: boolean,
            status: boolean,
            created_at: string,
            settings: [],
            archives: [],
            company: {
                _id: string,
                name: string
            }
            id: string
        }
    ]
}

export interface Branch {
    _id: string;
    name: string;
}

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
        _id: string,
        name: string,
        user_name: string,
        first_surname: string,
        second_surname: string
    }
}
