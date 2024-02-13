import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './services/user.service';
import { WpServiceService } from './services/wp-service.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    public _userService: UserService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let currentUser = this._userService.currentUserValue
    console.log("WHAT IS IN THE USER", currentUser);
    let user = localStorage.getItem('currentUser')
    if (user != null) {
      return true;
    } else {
      this.router.navigate(['/login'])
      return false
    }
  }
}

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private _userService: UserService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let currentUser = this._userService.currentUserValue;
    console.log("currentUser : ", currentUser);
    if (currentUser) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  }
}