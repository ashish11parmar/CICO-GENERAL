import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { WpServiceService } from './services/wp-service.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isMenuOpened: boolean = false
  contentMargin = 200;
  @ViewChild(MatSidenav) sideNav: MatSidenav;
  @ViewChild('drawer') drawer: MatDrawer;
  title = 'rao-attendance';
  isView = false
  isLoggedIn = false;
  currentUser = false
  constructor(
    public _cd: ChangeDetectorRef,
    public observer: BreakpointObserver,
    public router: Router,
    public _userService: UserService,
    private _wpService: WpServiceService
  ) {
    this._wpService.getLoggedInUser().subscribe((res: any) => {
      console.log("RES OF LOGIN ", res);
      if (res && res.currentUser) {
        this.currentUser = true
      } else {
        this.currentUser = false
      }
    })


  }


  ngOnInit() {
    let currentUser = localStorage.getItem('currentUser')
    console.log("WHAT IS IN THE CURRENT USER", currentUser);

    this.router.navigate(['/login']) /** @note when user refreshing page then we are navigate to login page */

    if (currentUser != null) this.currentUser = true

  }

  ngOnChanges() { }
  ngAfterViewInit() {
    if (this.currentUser != null) {
      this.observer
        .observe(['(max-width: 800px)'])
        .pipe(delay(1))
        .subscribe((res) => {
          if (res.matches) {
            this.sideNav.mode = 'over';
            this.sideNav.close();
          }
          else {
            this.sideNav.mode = 'side';
            this.sideNav.open();
          }
        })
    }
  }
  contentEvent(event: any) {
    this.contentMargin = event.contentMargin;
    this.isMenuOpened = event.isMenuOpened;
    this._cd.detectChanges();
  }
}
