import { Component, OnInit, OnChanges, Input, Inject, AfterViewInit, SimpleChanges, ViewChild, ChangeDetectorRef, Output, EventEmitter, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LogsService } from '../../services/logs.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent, MatDateRangeInput, MatDateRangePicker, } from '@angular/material/datepicker';
import * as moment from 'moment';
import { map, range, single } from 'rxjs';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { UtilityService } from 'src/app/services/utility.service';
import { RejectLeaveModalComponent } from '../../hrms/reject-leave-modal/reject-leave-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import * as L from 'leaflet';

@Component({
  selector: 'single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.scss'],
})
export class SingleUserComponent implements OnInit, OnChanges {
  @Input('user') userDetails: any;
  @Input('loading') isLoading: boolean = false;
  @Output() editUser = new EventEmitter<any>();
  @Output() deleteUser = new EventEmitter<any>();
  @Output() historyUser = new EventEmitter<any>();

  /** @fixme need to fix columns name with sorting keys */
  displayedColumns: string[] = ['date', 'clockIn', 'clockOut', 'breakStart', 'breakStop', 'workDuration', 'breakDuraion', 'status', 'expand'];
  payload = {
    "pageSize": 25,
    "pageIndex": 0
  }

  dateRange = {
    startDate: moment().utc().format('YYYY-MM-DD'),
    endDate: moment().utc().format('YYYY-MM-DD')
  }

  userId: any;
  singleUserDetailsWP: any;
  userLogs: any = [];
  displayLogs: any = [];
  averageTime: any;
  avarageBreakTime: any;
  loading: boolean = true;
  dateLogs: any = [];
  setOfDates = new Set();
  currentMonth = moment().format('MM');
  currentYear = moment().format('YYYY');
  dateStart: any = '01/' + this.currentMonth + '/' + this.currentYear;
  dateEnd: any = moment().format('DD/MM/YYYY');
  range = new FormGroup({
    // start: new FormControl(moment("01/" + this.currentMonth + "/" + this.currentYear, "DD/MM/YYYY").toDate()),
    // end: new FormControl(moment().toDate()),
    start: new FormControl(),
    end: new FormControl(),
  });
  maxDate = new Date();
  singleUserLeave: any;
  leaveBalance: any;
  casualBalance: any;
  casualSpent: any;
  leaveWithoutPayBalance: any;
  leaveWithoutPaySpent: any;
  emergencyBalance: any;
  emergencySpent: any;
  sickBalance: any;
  sickSpent: any;
  userLeaveStatus = '';
  leaveList: any;
  userList: any = [];
  designations: any;
  role: any;
  dailyLogsRef: any;

  currentStatus: any;

  todayDate: Date = new Date();

  timelineToday: any = [];
  TodayLog: any;
  isSalaryProcessing: boolean = false;
  reportingManagerOf = [
    {
      full_name: 'Akshay Zala',
    },
    {
      full_name: 'Rashmi Budha',
    },
    {
      full_name: 'Mira Ladani',
    },
    {
      full_name: 'Bhushan Kalvani',
    },
  ];

  workingHour: any;
  breakHour: any;
  totalHour = 8.5;
  salaryMonth: any;
  salaryLogs: any = [];

  /** @note Leave detail side drawer. */
  @ViewChild('leaveDetailDrawer') leaveDetailDrawer: MatDrawer;
  leaveDetails: any;
  constructor(
    public route: ActivatedRoute,
    public _userService: UserService,
    public _logService: LogsService,
    private _wpService: WpServiceService,
    private router: Router,
    public _utilityService: UtilityService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    // this.inIt();
  }

  inIt() {
    this.userId = this.userDetails.id;
    this._wpService.getEmployee(this.userId).subscribe((result: any) => {
      this.singleUserDetailsWP = result;
      this._wpService.employeeDesignation().subscribe((res: any) => {
        if (res && res.length) {
          res.map((des: any) => {
            if (des.id == this.singleUserDetailsWP.designation)
              this.role = des.title;
          });
        }
      });
    });
    if (this.userId) {
      localStorage.setItem('singleUserId', this.userId);
      this._wpService.singleUserLeave(this.userId).subscribe((res) => {
        this.singleUserLeave = JSON.parse(res);
        this.leaveList = [...new Set(this.singleUserLeave.map((item: any) => item.status))];
        this.userList = [...this.singleUserLeave];
      });
      this._wpService.getLeaveBalance(this.userId).subscribe((res: any) => {
        this.leaveBalance = Object.entries(res[this.userId]).map(([type, value]) => ({ type, value }));
        this.leaveBalance.forEach((x: any) => {
          if (x.value.policy == 'Casual Leave') {
            this.casualBalance = x.value.total;
            this.casualSpent = x.value.day_out;
          }
          if (x.value.policy == 'Leave Without Pay') {
            this.leaveWithoutPayBalance = x.value.total;
            this.leaveWithoutPaySpent = x.value.day_out;
          }
          if (x.value.policy == 'Emergency Leave') {
            this.emergencyBalance = x.value.total;
            this.emergencySpent = x.value.day_out;
          }
          if (x.value.policy == 'Sick Leave') {
            this.sickBalance = x.value.total;
            this.sickSpent = x.value.day_out;
          }
        });
      });
    }
  }

  ngOnInit(): void {
    this.getAttendanceData(this.userId, this.dateRange);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reportingManagerOf = this.userDetails.reportingManagerOf;
    this.inIt();
  }
  ngOnDestroy() {
    this.dailyLogsRef?.unsubscribe();
  }
  formatReason(reason: any) {
    return reason.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/&amp;/g, '&');
  }
  action(event: number, id: number, element: any) {
    if (event === 3) {
      this._utilityService.commonDialogBoxOpen(RejectLeaveModalComponent).afterClosed().subscribe((submit) => {
        if (submit) {
          this._wpService.updateLeave(event, submit, id).subscribe((res) => {
            this._snackBar.open('Leave status updated successfully.', 'Ok', { duration: 2000 });
            element.status = 3;
            element.admin_comment = submit;
          });
        }
      });
    }
    if (event === 1) {
      this._wpService.updateLeave(event, '', id).subscribe((res) => {
        this._snackBar.open('Leave status updated successfully.', 'Ok', { duration: 2000 });
        element.status = 1;
      });
    }
  }


  diff_hours(dt1: any, dt2: any) {
    var diff = (dt1.getTime() - dt2.getTime()) / 1000;
    diff /= 60 * 60;
    return Math.abs(Number(diff.toFixed(1)));
  }

  // UTILITY
  getDateLogs() {
    this.dateLogs = [];
    this.userLogs.filter((element: any) => {
      if (moment(element.date, 'DD/MM/YYYY').isSameOrAfter(moment(this.dateStart, 'DD/MM/YYYY')) && moment(element.date, 'DD/MM/YYYY').isSameOrBefore(moment(this.dateEnd, 'DD/MM/YYYY'))) {
        return this.dateLogs.push(element);
      }
    });
  }
  transform(value: string): number {
    // Assuming value is in the format HH:mm:ss

    const timeParts = value.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    // Convert time to decimal hours
    const decimalHours = hours + minutes / 60 + seconds / 3600;

    // Round to one decimal place
    return Math.round(decimalHours * 10) / 10;
  }

  openDialog(type: string, data: any, latLong?: any): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog1, {
      width: '600px',
      data: {
        type,
        data,
        latLong
      },
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getLocation(lat: any, lng: any) {
    return this._utilityService.calcCrow(lat, lng);
  }



  calculateAverage(logs: any) {
    this.averageTime = this.formateAvgTime(logs[logs.length - 1].totalHours);
    this.avarageBreakTime = this.formateAvgTime(
      logs[logs.length - 1].totalBreakHours
    );
  }

  formateAvgTime(total: any) {
    const totalDays = this.displayLogs.filter((o: any) => o.status == 'Present').length;
    let avgTime = this._logService.getTotalSeconds(total) / totalDays;
    let avgFormate = this._logService.convertSecToTime(avgTime);
    return avgFormate.split(':')[0] + ':' + avgFormate.split(':')[1];
  }


  onChange() {
    if (this.userLeaveStatus) {
      this.singleUserLeave = this.userList.filter((user: any) => {
        return user.status === this.userLeaveStatus;
      });
    } else {
      this.singleUserLeave = this.userList;
    }
  }

  onEdit() {
    this.editUser.emit(true);
  }

  onDelete() {
    this.deleteUser.emit(true);
  }

  showHistory() {
    this.historyUser.emit(true);
  }

  closeDrawer() {
    this.leaveDetailDrawer.close();
  }

  openLeaveDetail(leaveDetail: any) {
    this.leaveDetails = leaveDetail;
    this.leaveDetailDrawer.open();
  }

  /** @note handle (Approve/Reject) leaves */
  handleLeave(event: any) {
    for (let i = 0; i < this.singleUserLeave.length; i++) {
      if (this.singleUserLeave[i].id === event.data.id) {
        this.singleUserLeave[i].status = event.event;
      }
    }
  }


  // /*********************** || GENERAL VERSIONS CODE START HERE || ***********************/

  /**
   * 
   * @param status Current status is default count present in this signle user 
   * @param date   This params take currnt date for the today logs.
   * @param payload payload take pageSize and pageIndex in Api.
   */
  getAttendanceData(userid: any, dateRange: any) { /**@note This function will get the current day logs for display on single user page. */
    this.loading = true;
    this._wpService.getSingleUserList(userid, dateRange).subscribe((res: any) => {
      for (let i in res) {
        if (res[i].workLogs.length > 0) { /**@Note If workLogs are present then loop will execute  */
          let logs = [];
          this.currentStatus = res[i].workLogs[res[i].workLogs.length - 1] /**@note current status is for display icon in avtar. */
          logs.push(res[i])
          for (let i = 0; i < logs.length; i++) {
            this.workingHour = this.transform(logs[i].workData.workDuration)
            this.breakHour = this.transform(logs[i].workData.breakDuration)
            this.displayLogs = logs[i].workLogs
          }
        } else {
          this.displayLogs = [];
          this.currentStatus = 'leave'
        }
      }
      this.loading = false;
    }, (error: any) => {
      this.displayLogs = []
      this.currentStatus = 'leave'
      // this._snackBar.open(`${error.error['message']}` || 'Something went wrong!', 'ok', { duration: 2000 });
      this.loading = false;
    })
  }
}

@Component({
  selector: 'dialog-overview-example-dialog1',
  templateUrl: './meta-data-dialog-1.html',
  styleUrls: ['./single-user.component.scss'],
})
export class DialogOverviewExampleDialog1 {
  dailogData: any;
  map: any;
  id: any = localStorage.getItem('singleUserId');
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog1>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (data.type === 'image' && !(data.data).includes('base64') && !data.data.includes('thumbnail')) {
      this.dailogData = data
    } else {
      this.dailogData = data;
    }

    this.id = localStorage.getItem('singleUserId');
  }

  ngOnInit() {
    this.initializeMap(this.dailogData);
  }

  /**
   * @Note Employee location map render.
   */
  initializeMap(present: any) {
    if (!this.map && present.type === 'location') {
      this.map = L.map('map').setView([present.data, present.latLong], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.addEmployeeMarker(present);
    }
  }
  // This function will get the present employee clock in lat and lng 
  addEmployeeMarker(present: any) {
    // let employeeMarker = L.marker([22.293923, 70.745786]);
    let employeeMarker = L.marker([present.data, present.latLong]);

    let customIcon = L.icon({
      iconUrl: '../assets/icon/orange_marker.png',
      iconSize: [32, 32]
    });
    employeeMarker.setIcon(customIcon);
    employeeMarker.addTo(this.map);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}


