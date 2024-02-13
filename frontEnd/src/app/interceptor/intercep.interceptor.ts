import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class IntercepInterceptor implements HttpInterceptor {
  private _snackBar: any;
  router: any;

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    /** @note new interceptor method is below */
    if (token) {
      const tokenReq = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
      try {
        return next.handle(tokenReq);
      } catch (error: any) {
        if (error.status === 403) {
          localStorage.clear();
          this.router.navigate(["/login"]);
        }
        if (error.status === 500) {
          this._snackBar.open('Something went wrong called', 'ok', {
            duration: 3000
          });
        }
        return throwError(error);
      }
    }
    else { /** @note this else block called when user sign up for company */
      const authorizationData = 'Basic ' + btoa('rao-developer' + ':' + 'czIpAL6Ax2t7lvYYq2eubMks');
      const headers = request.headers
        .set('Content-Type', 'application/json')
        .set('Authorization', authorizationData);
      const modifiedRequest = request.clone({ headers });


      if ((!localStorage.getItem("currentUser") || localStorage.getItem("currentUser") === '') && (localStorage.getItem("isLogin") === 'true')) {
        this.router.navigate(["/login"]);
      }
      return next.handle(modifiedRequest);
    }
    // return next.handle(request);
  }
}
