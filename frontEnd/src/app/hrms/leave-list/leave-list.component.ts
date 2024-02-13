import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  SimpleChange,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { UtilityService } from 'src/app/services/utility.service';
import { RejectLeaveModalComponent } from '../reject-leave-modal/reject-leave-modal.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AddHolidayComponent } from 'src/app/holiday/add-holiday/add-holiday.component';
import { DeleteHolidayComponent } from 'src/app/holiday/delete-holiday/delete-holiday.component';
import { MatTab } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { ImagePreviewModalPageComponent } from 'src/app/common/image-preview-modal-page/image-preview-modal-page.component';
import { MatDrawer } from '@angular/material/sidenav';
import {
  CalendarEvent,
  CalendarView,
  CalendarEventTimesChangedEvent,
} from 'angular-calendar';
import { isSameMonth, isSameDay } from 'date-fns';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CalendarLeaveModalComponent } from 'src/app/dashboard/calendar-leave-modal/calendar-leave-modal.component';
import { EventColor } from 'calendar-utils';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
// import {
//   CalendarEvent,
//   CalendarEventAction,
//   CalendarEventTimesChangedEvent,
//   CalendarView,
// } from 'angular-calendar';
// import {
//   startOfDay,
//   endOfDay,
//   subDays,
//   addDays,
//   endOfMonth,
//   isSameDay,
//   isSameMonth,
//   addHours,
// } from 'date-fns';
// import { Subject } from 'rxjs';
const colors: Record<string, EventColor> = {
  red: {
    primary: '#dc4e42',
    secondary: '#FAE3E3',
  },
  yellow: {
    primary: '#f3a112',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#64c595',
    secondary: '#FDF1BA',
  },
};
@Component({
  selector: 'leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed, void',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
      transition(
        'expanded <=> void',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class LeaveListComponent implements OnInit {
  displayedColumns: string[] = [
    'sr no',
    'name',
    'start_date',
    'end_date',
    'description',
    'action',
  ];
  empLeave = [];
  holidayList = new MatTableDataSource<any>([]);
  users = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('reject') reject: any;
  singleLeaveId: any;
  leaveStatus: any;
  pageSize = 5;
  pageSizeOptions: number[] = [25, 50, 100];
  userLeaveStatus: any = 2;
  leaveList: any;
  userLeave: any = [];
  userList: any = [];
  searchInput: any;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent<{ incrementsBadgeTotal: boolean }>[] = [];
  modalData: any;
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = false;
  totalLeavesCount: any = 0;
  @ViewChild('drawer1') drawer: MatDrawer;

  /** @note Leave detail side drawer. */
  @ViewChild('leaveDetailDrawer') leaveDetailDrawer: MatDrawer;
  leaveDetails: any;
  loading: boolean = true;

  constructor(
    private _wpService: WpServiceService,
    public _utilityService: UtilityService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    // this.getEmployeeLeaves();
  }

  /** @deprecated */
  getEmployeeLeaves() {
    console.log('getEmployeeLeaves called : ');
    this.loading = true;
    this._wpService.employeeLeaves().subscribe((res: HttpResponse<any>) => {
      const headers = res.headers;
      console.log('ALL USERS LEAVES', res.body);
      // Now you can access specific headers by name
      const headerValue = headers.get('X-Wp-Total');
      console.log('Header Value:', headerValue);
      this.totalLeavesCount = headerValue;
      this.empLeave = res.body;
      this.userLeave = this.empLeave.filter((leave: any) => {
        // return leave.status === 2
        return leave.status === this.userLeaveStatus;
      });

      this.users = new MatTableDataSource<any>(this.empLeave);
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
      this.setEvents();
      console.log('result is', this.users.filteredData);
      this.users.filteredData.forEach((res) => {
        localStorage.setItem('id', res.user_id);
        this.leaveStatus = res.status;
      });
      this.leaveList = [
        ...new Set(this.users.filteredData.map((item: any) => item.status)),
      ];
      console.log(
        'THIS IS THE LEAVE LIST TO BE DISPLAY',
        this.leaveList,
        this.users.filteredData
      );
      this.userList = [...this.users.filteredData];
      this.loading = false;
    });
  }

  /**
   * @param daterange if Date-range is present then get data with that date-range.
   * Else default current month date-range.
   */
  getAllLeave(dateRange?: any) {
    console.log("getAllLeave called : ", dateRange);
    if (!dateRange) {
      dateRange = {
        start_date: moment().startOf('month').format('YYYY-MM-DD'),
        end_date: moment().endOf('month').format('YYYY-MM-DD'),
      };
    }
    console.log("Date range : ", dateRange);
    this.loading = true;
    this._wpService
      .employeeLeaves1(dateRange.start_date, dateRange.end_date)
      .subscribe(
        (res: HttpResponse<any>) => {
          this.loading = false;
          let leaveList = [];
          const headers = res.headers;
          leaveList = JSON.parse(res.body);
          console.log('leaveList : ', leaveList);
          let headerValue: number = Number(headers.get('X-Wp-Total'));
          this.totalLeavesCount =
            headerValue && headerValue > 0 ? headerValue : 0;
          this.userLeave = leaveList;
          this.empLeave = leaveList;
          console.log('empLeave called : ', this.empLeave);
          this.userLeave = this.empLeave.filter((leave: any) => {
            // return leave.status === 2
            return leave.status === this.userLeaveStatus;
          });
          this.users = new MatTableDataSource<any>(this.empLeave);
          this.users.paginator = this.paginator;
          this.users.sort = this.sort;
          this.setEvents();
          console.log('result is', this.users.filteredData);
          this.users.filteredData.forEach((res) => {
            localStorage.setItem('id', res.user_id);
            this.leaveStatus = res.status;
          });
          this.leaveList = [
            ...new Set(this.users.filteredData.map((item: any) => item.status)),
          ];
          this.userList = [...this.users.filteredData];
        },
        (error) => {
          this.totalLeavesCount = 0;
          this.loading = false;
        }
      );
  }

  setEvents() {
    this.events = [];
    this.empLeave.forEach((leave: any) => {
      let obj = {
        // start: subDays(startOfDay(new Date(leave.start_date)), 0),
        start: new Date(leave.start_date),
        // end: addDays(startOfDay(new Date(leave.end_date)), 0),
        end: new Date(leave.end_date),
        title: leave.employee_name + "'s Leave",
        color:
          leave.status === 1
            ? colors['green']
            : leave.status === 3
            ? colors['red']
            : colors['yellow'],
        meta: {
          incrementsBadgeTotal: true,
        },
        leaveData: leave,
      };
      this.events.push(obj);
    });
    this.refresh.next();
  }

  ngOnInit(): void {
    this.getAllLeave();
  }

  closeDrawer() {
    this.drawer.close();
    this.leaveDetailDrawer.close();
  }
  openDrawer() {
    this.drawer.open();
    this.leaveDetailDrawer.close();
  }

  getHolidaylist() {
    this._wpService.getHolidays().subscribe(
      (res) => {
        let holiday = JSON.parse(res);
        this.holidayList = new MatTableDataSource<any>(holiday);
        let employeeList = JSON.parse(res);

        this.holidayList.paginator = this.paginator;
        this.holidayList.sort = this.sort;

        console.log(JSON.stringify(res) + 'holiiiii');

        this.holidayList.filteredData.forEach((res) => {
          localStorage.setItem('holiday_id', res.id);
        });
      },
      (err) => {
        console.log(err + 'holiiiii');
      }
    );
  }
  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('expandedDetail');
  expandedElement: null;

  applyFilter() {
    if (
      typeof this.userLeaveStatus === 'string' &&
      this.userLeaveStatus != ''
    ) {
      this.userLeaveStatus = Number(this.userLeaveStatus);
    }

    if (this.searchInput && this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        if (leave.employee_name)
          return (
            leave.employee_name
              .toLowerCase()
              .includes(this.searchInput.toLowerCase()) &&
            leave.status === this.userLeaveStatus
          );
      });
    } else if (this.searchInput && !this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        console.log(
          'event && !this.userleavestatus called ',
          this.searchInput,
          this.userLeaveStatus,
          ' --- ',
          leave.employee_name
        );
        if (leave.employee_name)
          return leave.employee_name
            .toLowerCase()
            .includes(this.searchInput.toLowerCase());
      });
    } else if (!this.searchInput && this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        // console.log('!event && this.userleavestatus called ',this.searchInput, this.userLeaveStatus)
        return leave.status === this.userLeaveStatus;
      });
    } else {
      // console.log('else called', this.userLeaveStatus, this.searchInput)
      this.userLeave = this.empLeave;
    }

    // this.users.filter = filterValue.trim().toLowerCase();
    // console.log('filter data ', filteredData)

    // if (this.users.paginator) {
    //   this.users.paginator.firstPage();
    // }
  }

  action(event: number, id: number, element: any) {
    console.log('event', event, id);
    if (event === 3) {
      // element.status = 3
      this._utilityService
        .commonDialogBoxOpen(RejectLeaveModalComponent)
        .afterClosed()
        .subscribe((submit) => {
          console.log('USER CONFIRM OR NOT', submit);
          if (submit) {
            element.status = 3;
            element.admin_comment = submit;
            // this._wpService.updateLeave(event, submit, id).subscribe((res) => {
            //   console.log('result for update leave is', res);
            //   this.reloadBadge();
            //   element.status = 3;
            //   element.admin_comment = submit;
            //   this._snackBar.open('Leave status updated successfully.', 'Ok', {
            //     duration: 2000,
            //   });
            // });
          }
        });
    }
    if (event === 1) {
      // element.status = 1
      element.status = 1;
      // this._wpService.updateLeave(event, '', id).subscribe((res) => {
      //   console.log('result for update leave is', res);
      //   this.reloadBadge();
      //   this._snackBar.open('Leave status updated successfully.', 'Ok', {
      //     duration: 2000,
      //   });
      //   element.status = 1;
      // });
    }
  }

  reloadBadge() {
    this._wpService.getLeaveRequest().subscribe((response: any) => {
      console.log('Leave Request is-----', JSON.parse(response));
      const jsonObj = JSON.parse(response);
      const countValue = jsonObj['count'];

      console.log(countValue + 'count value'); // Output: 3

      this._wpService.getPendingcount(Number(countValue));
    });
  }

  addHoliday() {
    const dialogRef = this.dialog.open(AddHolidayComponent, {});
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  applyLeave() {
    const dialogRef = this.dialog.open(ApplyLeaveComponent, {});
    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }

  // displayedColumns2: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  editHoliday(holidayData: any) {
    console.log('EDIT USER DATA', holidayData);
    let obj = {
      user: holidayData,
      isEdit: true,
    };
    const dialogRef = this.dialog.open(AddHolidayComponent, { data: obj });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  deleteHoliday(holidayData: any) {
    console.log('USer removed', holidayData);
    this._utilityService
      .commonDialogBoxOpen(DeleteHolidayComponent)
      .afterClosed()
      .subscribe((confirm) => {
        console.log('USER CONFIRM OR NOT', confirm);
        if (confirm == undefined) return;
        else if (confirm == 'yes') {
          this._wpService
            .removeHoliday(holidayData.id)
            .subscribe((res: any) => {
              this.getHolidaylist();
              console.log('result for delete holiday is', res);
            });
        } else {
          console.log('THIS IS FOR NO OPTION');
        }
      });
  }

  reloadPage() {
    //window.location.reload();
  }

  imageAttachment(link: any) {
    const imgStr: string = Object.values(link).toString();

    return imgStr;
  }

  async previewImage(imagedata: string) {
    let obj = {
      strImage: imagedata,
    };

    const dialogRef = this.dialog.open(ImagePreviewModalPageComponent, {
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  isPdf(file: string) {
    const extension = file.substr(file.lastIndexOf('.') + 1);

    return /(pdf)$/gi.test(extension);
  }
  opePdf(pdfUrl: string) {
    window.open(pdfUrl);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log('date is ', date, 'event is', events);
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  onChange(viewDate: any, view?: any) {
    let daterange = {
      start_date: moment(viewDate).startOf('month').format('YYYY-MM-DD'),
      end_date: moment(viewDate).endOf('month').format('YYYY-MM-DD'),
    };
    this.getAllLeave(daterange);
    if (this.userLeaveStatus) {
      this.userLeave = this.userList.filter((user: any) => {
        return user.status === this.userLeaveStatus;
      });
    } else {
      this.userLeave = this.userList;
    }
  }

  handleEvent(event: any): void {
    this.leaveDetails = event.leaveData;
    this.leaveDetails['title'] = event.title;
    this.leaveDetailDrawer.open();
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log('event Times changed---', event, newStart, newEnd);
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent(event);
  }

  /** @note open Leave detail drawer while clicking on leave from leave-list. */
  openLeaveDetail(leaveDetail: any) {
    this.leaveDetails = leaveDetail;
    this.leaveDetailDrawer.open();
  }
  /** @note handle (Approve/Reject) leaves */
  handleLeave(event: any) {
    console.log('handleLeave in parent class : ', event);
    console.log('CHECKING userLeave : ', this.empLeave);
    this.updateCalendarEvent(event.data, event.event);
  }

  /** @note update Calendar event with appropriate status (Approve/Reject) */
  updateCalendarEvent(leaveData: any, status: number) {
    for (let i = 0; i < this.events.length; i++) {
      let _event: any = this.events[i];
      /** @note get particular event inorder to update status */
      if (_event['leaveData'] && _event['leaveData'].id === leaveData.id) {
        if (status === 3) {
          /** @note rejected leave */
          _event.color = colors['red'];
          _event['leaveData'].status = status;
          _event['leaveData'].admin_comment = leaveData.admin_comment;
        } else if (status === 1) {
          /** @note approved leave */
          _event.color = colors['green'];
          _event['leaveData'].status = status;
        }
      }
    }

    /** @note to handle leave-list */
    let index = this.userLeave.findIndex(
      (leave: any) => leave.id === leaveData.id
    );
    /** @note Delete particular leave from leave-list */
    if (index > -1) {
      this.userLeave.splice(index, 1);
    }
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
