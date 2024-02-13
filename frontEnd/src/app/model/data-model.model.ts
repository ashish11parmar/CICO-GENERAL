import { Time } from "@angular/common";
import { Timestamp } from "rxjs";


export class Users {
    userName: string;
    email: string;
    password: string;
    role: string;
}

export class Logs {
    date: string;
    time: string;

    //true for start and false for stop
    action: string;

    type: string;
    email: string;
}

export class Types {
    typeId: number;

    //type name i.e. clock,break etc
    name: string;
}

export class Roles {
    role: string;
    displayName: string;
    // pendign => access : ? 
}



let roles = [
    "Admin",
    "Developer",
    "Designer",
    "Intern"
]


export class userRoles {} roles

