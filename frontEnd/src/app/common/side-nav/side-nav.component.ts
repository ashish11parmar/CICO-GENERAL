import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef, ViewChild, Input, SimpleChanges } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { config } from '../../config';
import * as moment from 'moment';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  // shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));
  @Input('isMenu') menuValue: any
  tabName: string = 'dashboard';
  dashboard: boolean = true;
  userList: boolean = false;
  isMenuOpened: boolean = true;
  contentMargin = 200;
  currentUser = localStorage.getItem('currentUser');
  isView: boolean = false;
  pendingCount: any;
  appVersion = config.version;
  regulariseList: any[] = [];
  payload = {
    "pageSize":25,
    "pageIndex": 0
  }
  pendingRegularizationCount: number = 0;
  reguarizationCountSubscriber: any;
  @Output() toggleClicked: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    public router: Router,
    public _cd: ChangeDetectorRef,
    public observer: BreakpointObserver,
    public _userService: UserService,
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar,
  ) {

    // this._userService.getLoggedInUser().subscribe((res: any) => {
    //   console.log("RES OF LOGIN ", res, this.isView);
    //   if (res && res.currentUser) {
    //     this.currentUser = localStorage.getItem('currentUser')
    //     // this.isView = true
    //     // console.log(" this.currentUser", this.isView);
    //     // this._cd.detectChanges()
    //     this.ngOnInit()
    //   }
    // })

    // this._logService.getPendingcount
    this._wpService.previousUrlSubject.subscribe(count => {
      console.log('count-----', count)
      this.pendingCount = count
    })
    
    this.reguarizationCountSubscriber = this._wpService.getRegularizeCount().subscribe(count => {
      this.pendingRegularizationCount = count;
    });
  }

  ngOnInit(): void {
    if (this.currentUser != null || this.currentUser != undefined) {
      this.isView = true
      console.log("CURRENT USER VALUE", this.currentUser, this.isView);
      this._cd.detectChanges()
      this.getRegularizeCount();
    }
    /** @fixme this api is calling when user on sign in / login page and giving error  */

    // this._wpService.getLeaveRequest().subscribe((response: any) => {
    //   console.log('Leave Request is-----', JSON.parse(response))
    //   const jsonObj = JSON.parse(response);
    //   const countValue = jsonObj["count"];

    //   console.log(countValue + "count value"); // Output: 3

    //   this._wpService.getPendingcount(Number(countValue))
    // })
  }

  ngOnDestroy() {
    this.reguarizationCountSubscriber.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("CHANGES IN SIDE MENU", changes);
    if (changes['menuValue'] && (changes['menuValue'].currentValue || !changes['menuValue'].currentValue)) {
      this.isMenuOpened = changes['menuValue'].currentValue
      console.log("MENU VALUE", this.isMenuOpened);
    }
  }

  /**
   * @note this function is used to display the pending counts on the side nav bar 
   */
  getRegularizeCount() {
    let startdate = moment().startOf('month').format('YYYY-MM-DDT00:00:00')
    let enddate = moment().endOf('month').format('YYYY-MM-DDT23:59:00')
    console.log("this is ending date", enddate, startdate);
    this._wpService.getRegularizeData(startdate, enddate, this.payload).subscribe((data:any)=>{
      console.log("filterData called : ", data);
      let filterData = data.body.filter((element: any) => element['regularization-status'][0] === 3);
      this._wpService.setRegularizeCount(filterData && filterData.length ? filterData.length : 0)
    });
  }

  changeTab(tab: string) {
    // this.toggleClicked.emit({ contentMargin: this.contentMargin, isMenuOpened: false })
    this.toggleClicked.emit({ contentMargin: this.contentMargin, isMenuOpened: this.isMenuOpened })
    // this.router.navigate([tab]);
    // this.tabName = tab
  }
  onToggle() {
    this.isMenuOpened = !this.isMenuOpened;
    if (!this.isMenuOpened) {
      this.contentMargin = 70;
      // $(".bottom-toolbar").addClass("close_toolbar")
    } else {
      this.contentMargin = 200;
      // $(".bottom-toolbar").removeClass("close_toolbar")
    }
    this.toggleClicked.emit({ contentMargin: this.contentMargin, isMenuOpened: this.isMenuOpened })
    this._cd.detectChanges();
  }

  logOut() {
    this._wpService.signOut().subscribe((message) => {
      console.log("MESSAGE", message);
      localStorage.setItem("isLogin", 'false');
      this._userService.setLoggedInUser(null); // removing username from the session
      this.router.navigate(['login']);
    }, error => {
      this._snackBar.open('Something went wrong!', 'ok', {
        duration: 3000
      });
    })
  }
}
function clickHoverMenuTrigger(clickHoverMenuTrigger: any) {
  throw new Error('Function not implemented.');
}

