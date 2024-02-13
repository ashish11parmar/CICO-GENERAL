import { Component, OnInit, ViewChild, ElementRef, SimpleChanges, AfterContentChecked, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { LogsService } from '../services/logs.service';
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';
import { map, Observable, observable, Subject } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { LocationStrategy, Location, DatePipe } from '@angular/common';
import { WpServiceService } from '../services/wp-service.service';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { EventColor } from 'calendar-utils';
import { UtilityService } from '../services/utility.service';
import { CalendarLeaveModalComponent } from './calendar-leave-modal/calendar-leave-modal.component';
import { HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BubbleDataPoint, Chart, ChartComponentLike, ChartDataset, ChartTypeRegistry, Point } from 'chart.js/auto';
import {MatDrawer} from '@angular/material/sidenav';
import { config } from '../config';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {

  @ViewChild('PresentCountChart', { read: ElementRef }) public PresentCountChart: ElementRef;
  @ViewChild('LateCountChart', { read: ElementRef }) public LateCountChart: ElementRef;
  @ViewChild('OvertimeCountChart', { read: ElementRef }) public OvertimeCountChart: ElementRef;
  @ViewChild('LeaveCountChart', { read: ElementRef }) public LeaveCountChart: ElementRef;
  @ViewChild('EmployeeTypesChart', { read: ElementRef }) public EmployeeTypesChart: ElementRef;
  @ViewChild('GenderRatioChart', { read: ElementRef }) public GenderRatioChart: ElementRef;
  @ViewChild('AvgAttendanceChart', { read: ElementRef }) public AvgAttendanceChart: ElementRef;
  @ViewChild('LocationRatioChart', { read: ElementRef }) public LocationRatioChart: ElementRef;

  protected presentCountChartObj: Chart;
  protected lateCountChartObj: Chart;
  protected overtimeCountChartObj: Chart;
  protected leaveCountChartObj: Chart;
  protected employmentTypeChartObj: Chart;
  protected genderRatioChartObj: Chart;
  protected avgAttendanceChartObj: Chart;
  protected locationRatioChartObj: Chart;

  AvgAttendanceCount: number = 0;
  isAttendance = false;
  displayedColumns: string[] = [
    'sr no',
    'name',
    'clock-in',
    'clock-out',
    'break-start',
    'break-stop',
    'work-duration',
    'break-duration',
    'toggle1',
    'toggle2',
    'status',
    'action',
    'expand',
  ];
  pageSizeOptions: number[] = [25, 50, 100];
  paginator: MatPaginator;
  logs: any[] = [];
  logsCopy: any[] = [];
  selectDate = new Date(moment().toDate());
  form: FormGroup;
  present = 0;
  absent = 0;
  isLateCount = false;
  lateCount = 0;
  totalCount = 0;
  leaveCount = 0;
  isLeaveCount = false;
  selectedCard: any;
  filterString: any;
  isLoading = true;
  userList = [];
  maxDate = new Date();
  table_List = false;
  timeline_list = false;
  userLeaves: any
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  // activeDayIsOpen: boolean = true;
  ismapLocation = false;
  CalendarView = CalendarView;
  events: CalendarEvent<{ incrementsBadgeTotal: boolean }>[] = [];
  // actions: CalendarEventAction[] = [
  //   {
  //     label: '',
  //     a11yLabel: 'Edit',
  //     onClick: ({ event }: { event: CalendarEvent }): void => {
  //       this.handleEvent('Edited', event);
  //     },
  //   },
  // ];
  refresh = new Subject<void>();
  modalData: any;
  startDate: any;
  endDate: any;
  name: any;
  leaveStatus: any;
  dailyLogsRef: any;
  genderList: any;
  isGenderRatio =false;
  employmentTypes: any;
  isEmployeetype = false;
  isPresentFilter: boolean = false;
  isLateFilter: boolean = false;
  locationData: any;
  @ViewChild('dashboardDrawer') dashboardHistoryDrawer: MatDrawer;
  /** @note Leave detail side drawer. */
  @ViewChild('leaveDetailDrawer') leaveDetailDrawer: MatDrawer;
  leaveDetails: any;

  presentLogLoaded: boolean = false;
  isOvertimeLogLoaded: boolean = false;
  holidayEventList: any[] = [];
  constructor(
    private _logsService: LogsService,
    private locationStrategy: LocationStrategy,
    private _location: Location,
    private router: Router,
    public route: ActivatedRoute,
    private _wpService: WpServiceService,
    public _utilityService: UtilityService,
    private datepipe: DatePipe,
    private _snackBar: MatSnackBar,
    public _cd: ChangeDetectorRef
  ) { }

  getEmployeeLeaves(start_date: any, end_date: any, type?: any, weekLeaves?: any) {
    console.log("start_date :: ", start_date);
    console.log("end_date :: ", end_date);
    this._wpService.employeeLeaves1(start_date, end_date).subscribe((res: HttpResponse<any>) => {
      let leaveList = []
      leaveList = JSON.parse(res.body);
      console.log('leaveList ', leaveList)
      if(!weekLeaves){
        if (leaveList && leaveList.length) {
          this.setEvents(leaveList, type);
        } else this.leaveCount = 0;
      } else {
        let leaveData: any = [];
        let now = moment(start_date).clone();
        while (now.isSameOrBefore(moment(end_date))) {
          let count = 0;
          leaveList.forEach((leave: any) => {
            if (leave.status !== 3 && moment(now.format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) count += 1;
          })
          leaveData.push(count);
          now = now.add(1, 'days');
        }
        this.isLeaveCount = true;
        this._cd.detectChanges();
        this.renderLeaveCountChart(leaveData);
      }
    })
  }

  ngOnInit(): void {
    console.log('this.selectDate ', this.selectDate);
    this.getCurrentDateLogs();
    this.getHolidaylist();
    this.getDateRangeLogs(28);
    this.getDateRangeLogs(7);
    // this.getUpdates();
    this.form = new FormGroup({
      dateSelect: new FormControl(this.selectDate),
    });
    this.table_List = !this.table_List;

    let date = this.getDates(null, null, this.view);
    if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar'); /** @note current month */
    this.getEmployeeLeaves(moment().subtract(7, 'd').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), null, true); /** @note Leaves of last 7 days. */
    this.getGenderRatio();
    this.getEmployeeTypeCount();
    this.getLocationsCount();
  }

  getGenderRatio() {
    this._wpService.getGenderRatio().subscribe(res => {
      this.isGenderRatio = true;
      this._cd.detectChanges();
      this.genderList = res;
      this.renderGenderRatioChart();
    })
  }

  getEmployeeTypeCount() {
    this._wpService.getEmployeeTypeCount().subscribe((res: any) => {
      this.isEmployeetype = true;
      this.employmentTypes = res;
      console.log('this.employmentTypes:', this.employmentTypes);


      let dataset: any = [];
      let count = 0.2;
      for (const key in this.employmentTypes) {
        count += 0.1;
        dataset.push({
          label: key,
          data: [res[key]],
          backgroundColor: [`rgba(255, 255, 255, ${count.toFixed(1)})`],
          borderColor: ['rgba(255, 255, 255, 0.5)'],
          borderWidth: 1,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          fill: {
            target: 'origin',
          }
        });
      }
      this._cd.detectChanges();
      this.renderEmploymentTypeChart(dataset);
    })
  }

  getLocationsCount() {
    this._wpService.getlocations().subscribe((res: any) => {
      this.locationData = res;
      let locationData: any = [];
      let labels: any = [];
      for (const [key, value] of Object.entries(res)) {
        locationData.push(value);
        labels.push(key);
      }
      this._cd.detectChanges();
      console.log('locationData locationData ',locationData, labels)
      this.renderLocationRatioChart(locationData, labels);
    })
  }

  /**
   * Get Holiday list and set evets in the Dashboard calendar.
   */
  getHolidaylist() {
    this._wpService.getHolidays().subscribe((res) => {
      let holiday = JSON.parse(res);
      console.log("DASHBOARD holiday : ", holiday);
      this.setHolidayEvent(holiday)
    }, err => {
      console.log("Error while getting holiday list : ", err);
    })
  }

  setHolidayEvent(holidayList: any) {
    console.log("setHolidayEvent called");
    holidayList.forEach((holiday: any) => {
      let obj = {
        start: new Date(holiday.start_date),
        end: new Date(holiday.end_date),
        title: `${holiday.name}
                <br>
                ${holiday.start_date === holiday.end_date ?
            holiday.start_date :
            moment(holiday.start_date).format('dd-MM-YYYY') + ' to ' + moment(holiday.end_date).format('dd-MM-YYYY')}
                <br>
                ${holiday.description}
                `,
        color: colors['yellow'],
        meta: {
          incrementsBadgeTotal: true,
        },
        holidayData: holiday
      }
      this.holidayEventList.push(obj);
      this.events.push(obj);
    })
    this.refresh.next();
  }

  ngOnDestroy() {
    this.dailyLogsRef?.unsubscribe();
  }

  // UTILITY
  updateQueryParams(obj: any) {
    this._location.replaceState(
      this.router
        .createUrlTree(
          [this.locationStrategy.path().split('?')[0]], // Get uri
          {
            relativeTo: this.route,
            queryParams: obj,
          }
        )
        .toString()
    );
  }

  filterList(filterType: string) {
    switch (filterType) {
      case 'present':
        return this.logsCopy.filter((x) => x.status == 'Present');
      case 'absent':
        return this.logsCopy.filter((x) => x.status == 'Absent');
      default:
        return this.logsCopy.filter((x) => x.status == 'Present');
    }
  }

  filterDataonCard(filter: any) {
    this.selectedCard = filter;
    this.logs = this.logsCopy;
    console.log('LOGS DATA', this.logs, filter, this.selectedCard);
    console.log('LOGS CHEKING', this.logs.filter);
    console.log('this.selectedCard filter ', this.selectedCard, filter)
    this.updateQueryParams({ isView: this.selectedCard });
    switch (filter) {
      case 'isPresent':
        this.logs = this.logs.filter((x) => {
          return x.status == 'Present';
        });
        this.getEmployeeLeaves(moment(this.selectDate).format('YYYY-MM-DD'), moment(this.selectDate).format('YYYY-MM-DD'));
        break;
      case 'isAbsent':
        this.logs = this.logs.filter((x) => {
          return x.status == 'Absent';
        });
        this.getEmployeeLeaves(moment(this.selectDate).format('YYYY-MM-DD'), moment(this.selectDate).format('YYYY-MM-DD'));
        break;
      case 'isLeaves':
        this.logs = this.logs.filter((x) => {
          // console.log('leaves -----', this.userLeaves)
          return x.status == '';
        });
        let date = this.getDates(null, null, this.view);
        if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar');
        break;
      default:
        this.getEmployeeLeaves(moment(this.selectDate).format('YYYY-MM-DD'), moment(this.selectDate).format('YYYY-MM-DD')); // display count if isTotal is selectedcard
        break;
    }
  }

  //search on name column
  filterName(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterString = filterValue;
  }

  // API CALL

  /**
   * Get Current Date logs for all users
   */
  async getCurrentDateLogs() {
    this.presentLogLoaded = true;
    const userList = await this.getUserlist();
    const logs = await this.getUpdates();
    // let calculatedLogs = await this._logsService.calculateLogs(logs, userList);
    // this.displayLogs(calculatedLogs);
  }

  //retrieves data from logsService and sorts them using unixtime
  getUpdates() {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      console.log('Before', this.selectDate);
      let currDate = moment(this.selectDate).format('DD/MM/YYYY');
      this.viewDate = this.selectDate;
      let logs: any[] = [];
      if (currDate && (moment(currDate).isSame(moment().format('DD/MM/YYYY')) || moment(moment(currDate).format('DD/MM/YYYY')).isSame(moment().format('DD/MM/YYYY')) || moment(moment(currDate, 'DD/MM/YYYY').format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD')))) {
        this.dailyLogsRef = this._logsService.getLogsFromFirebase(null).snapshotChanges().pipe(
          map((changes) =>
            // changes.map((c: any) => ({ key: c.payload.key, ...c.payload.val() }))
            changes.map((c: any) => ({ ...c.payload.val() }))
          )
        ).subscribe(async (logList) => {
          console.log('daily logs list : ', logList);
          logs = [];
          if (logList && logList.length) {
            const iterator = logList.values();
            for (const value of iterator) {
              console.log('iterator value ', value, typeof value);
              for (const val of Object.values(value)) {
                console.log('iterator inside value ', val);
                logs.push(val);
                // if(typeof val === 'object' && val !== null) {
                //   if(val.date === currDate) logs.push(val);
                // }
              }
            }
            console.log('final logs ---- ', logs)
            let calculatedLogs = await this._logsService.calculateLogs(
              logs,
              this.userList,
              currDate
            );
            setTimeout(() => { this.displayLogs(calculatedLogs); this.createMapLocationData() }, 150)
            console.log('calculatedLogs IN DASHBOARD', calculatedLogs)
          } else {
            let calculatedLogs = await this._logsService.calculateLogs(
              logs,
              this.userList,
              currDate
            );
            setTimeout(() => { this.displayLogs(calculatedLogs); this.createMapLocationData() }, 150)
          }
        });
      } else {
        this._logsService.getLogsFromSheets(null, currDate).subscribe(async (res) => {
          const entries = res.split(',')
          const chunkSize = 8;
          let diffEntry: any[] = [];
          for (let i = 0; i < entries.length; i += chunkSize) {
            const chunk = entries.slice(i, i + chunkSize);
            diffEntry.push(chunk)
          }
          const dataForUniq = JSON.parse(JSON.stringify(diffEntry))
          console.log('dataForUniq', diffEntry)
          const uniq = await this._logsService.getUniwData(dataForUniq);
          console.log('uniquniq', uniq)
          let uniqSingleEntry: any[] = [];
          uniq.forEach((ent: any) => {
            uniqSingleEntry.push(ent[0]);
          })
          console.log('sheet res', uniqSingleEntry, diffEntry);
          const finalLogs = this._logsService.getFinalLogs(uniqSingleEntry, diffEntry);
          console.log('finalLogs', finalLogs);
          logs = finalLogs.filter((x) => {
            x.unixTime = moment(
              x.date.concat('|').concat(x.time),
              'DD/MM/YYYY|hh:mm:ss'
            ).unix();
            return x;
          }).sort((a, b) => {
            return a.unixTime - b.unixTime;
          });
          console.log('PREVIOUS DATE LOGS', logs, this.userList);
          if (this.userList && this.userList.length) {
            console.log("Logs and userlist before calling calculateLogs()", logs, this.userList)
            let calculatedLogs = await this._logsService.calculateLogs(
              logs,
              this.userList,
              currDate
            );
            setTimeout(() => { this.displayLogs(calculatedLogs); this.createMapLocationData() }, 150)
          }
          resolve(logs);
          this.isLoading = false;
        }, err => {
          console.log('sheet error', err);
        })
      }
    });
  }



  displayLogs(calculatedLogs: any) {
    this.logs = [...calculatedLogs.logPresent, ...calculatedLogs.logsArray];
    this.logsCopy = [...calculatedLogs.logPresent, ...calculatedLogs.logsArray];
    console.log("logs data inside displayLogs()", this.logs)
    this.present = calculatedLogs.present;
    this.absent = calculatedLogs.absentCount;
    this.lateCount = calculatedLogs.lateCount;
    // this.isLateCount = true;
    this.totalCount = this.present + this.absent;
    this.route.queryParams.subscribe((params) => {
      console.log('params in admin time sheet page', params);
      if (params['isView'] != undefined) {
        this.selectedCard = params['isView'];
        console.log('this.selectedCard', this.selectedCard)
        // setTimeout(() => { this.filterDataonCard(this.selectedCard); }, 150)  //
      } else {
        this.selectedCard = 'isTotal';
        this.updateQueryParams({ isView: 'isTotal' });
        console.log('is total =====')
        // this.getEmployeeLeaves(moment(this.selectDate).format('YYYY-MM-DD'), moment(this.selectDate).format('YYYY-MM-DD'));
      }
      console.log('this.selectedCard in display logs ', this.selectedCard)
    });
    this.isLoading = false;
  }

  // Get employees from wordpress
  getUserlist() {
    return new Promise((resolve, reject) => {
      this._wpService.getEmployeeList().subscribe((res: any) => {
        this.userList = res.sort((a: any, b: any) => {
          return a.full_name.localeCompare(b.full_name);
        });
        resolve(res);
      })
    });
  }

  tableList() {
    this.timeline_list = false;
    this.table_List = !this.table_List;
  }

  timeline() {
    this.table_List = false;
    this.timeline_list = !this.timeline_list;
  }

  setEvents(leaveList: any, type?: any) {
    console.log("CHECKING holiday list : ", this.holidayEventList);
    /** @note To avoid duplicate values appedning in the calendar events. */
    if (this.events && this.events.length) this.events = [];

    /** @note Adding default Holidays list in the Calendar events. */
    this.events = [...this.holidayEventList];
    let leaveCount = this.leaveCount;
    let dateExist = false;
    this.leaveCount = 0;
    leaveList.forEach((leave: any) => {
      if (type) {
        let obj = {
          // start: subDays(startOfDay(new Date(leave.start_date)), 0),
          start: new Date(leave.start_date),
          // end: addDays(startOfDay(new Date(leave.end_date)), 0),
          end: new Date(leave.end_date),
          title: leave.employee_name + "'s Leave",
          color: ((leave.status === 1) ? colors['green'] : (leave.status === 3) ? colors['red'] : colors['yellow']),
          meta: {
            incrementsBadgeTotal: true,
          },
          leaveData: leave
        }
        this.events.push(obj);
        if (moment(moment(this.selectDate).format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) dateExist = true;
        if (leave.status !== 3 && moment(moment(this.selectDate).format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) {
          console.log('set events leave count ')
          this.leaveCount += 1;
        }
      } else {
        console.log('leave.status ', leave.status, typeof leave.status)
        if (leave.status !== 3) this.leaveCount += 1;
      }
    })
    if (!dateExist && type) this.leaveCount = leaveCount;
    this.refresh.next();
    this.isLeaveCount = true;
    this._cd.detectChanges();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log('date is ', date, 'event is', events)
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

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log('event Times changed---', event, newStart, newEnd)
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
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: any): void {
    /** @note if event if for leave then open modal. */
    if (event.leaveData) {
      this.leaveDetails = event.leaveData;
      this.leaveDetails['title'] = event.title;
      this.leaveDetailDrawer.open();
      console.log("leaveDetails : ", this.leaveDetails);
      this._cd.detectChanges();
      // this.modalData = { event, action };
      // this._utilityService.commonDialogBoxOpen(CalendarLeaveModalComponent, this.modalData).afterClosed().subscribe((data) => {
      //   if (data) {
      //     this.modalData.event.leaveData.status = data.status;
      //     this.modalData.event.color = ((data.status === 1) ? colors['green'] : (data.status === 3) ? colors['red'] : colors['yellow']);
      //     if (data.comment) this.modalData.event.leaveData.admin_comment = data.comment;
      //     this._snackBar.open('Leave status updated successfully.', 'Ok', { duration: 2000 });
      //   }
      // });
    }
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  onChange(view: any) {
    console.log('viewDate ', view, this.viewDate);
    let date;
    switch (view) {
      case 'week':
        date = this.getDates(this.datepipe.transform(this.viewDate, 'w'), new Date(this.viewDate).getFullYear(), view)
        if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar');
        console.log('start_date ', date);
        break;
      case 'month':
        date = this.getDates(null, null, view);
        console.log('month moment() ', this.viewDate, date);
        if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar');
        break;
      case 'day':
        this.getEmployeeLeaves(moment(this.viewDate).format('YYYY-MM-DD'), moment(this.viewDate).format('YYYY-MM-DD'), 'calendar');
        break
    }
  }

  getDates(w: any, y: any, view: any) {
    console.log('w, y ', w, y)

    switch (view) {
      case 'week':
        let simple = new Date(y, 0, 1 + (w - 1) * 7);
        let dow = simple.getDay();
        let ISOweekStart = simple;
        if (dow <= 4)
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
          ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        let date = moment(ISOweekStart).format('YYYY-MM-DD');

        console.log('ISOweekStart ', ISOweekStart, ISOweekStart.getDate())
        console.log('date.setDate(date.getDate() + 1) ')
        return { start_date: moment(moment(date).subtract(1, 'days')).format('YYYY-MM-DD'), end_date: moment(moment(date).add(5, 'days')).format('YYYY-MM-DD') };
      case 'month':
        let firstDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        let lastDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
        return { start_date: moment(firstDay).format('YYYY-MM-DD'), end_date: moment(lastDay).format('YYYY-MM-DD') };
      default:
        return;
    }
    // return {start_date: date.setDate(date.getDate() + 1), end_date: date.setDate(date.getDate() + 7)};
  }



  async ngAfterViewInit() {
    this.isOvertimeLogLoaded = true;
    this._cd.detectChanges();
    await this.fetchDashboardCharts();
  }

  async fetchDashboardCharts() {
    const data1 = [8, 9, 6, 7, 8, 9, 1];
    // await this.renderPresentCountChart(data1);

    // const lateData = [2, 3, 0, 2, 2, 3, 1];
    // await this.renderLateCountChart(lateData);

    const overTimeData = [2, 1, 2, 2, 1, 3, 1];
    // const overTimeData = [0, 0, 0, 0, 0, 0, 0];
    await this.renderOverTimeCountChart(overTimeData);

    // const leaveCountData = [2, 3, 1, 0, 3, 2, 9];
    // await this.renderLeaveCountChart(leaveCountData);

    // const employmentTypeData = [7, 2, 1];
    // await this.renderEmploymentTypeChart(employmentTypeData);

    // const genderRatioData = [6, 4];
    // await this.renderGenderRatioChart();

    // const locationData = [6, 3, 1];
    // await this.renderLocationRatioChart(locationData);

    // const avgAttendanceData = [9, 9, 5, 6, 6, 7, 3, 8, 7, 9, 6, 9, 9, 5, 9, 7, 7, 7, 8, 9, 4, 8, 9, 6, 7, 8, 9, 1];
    // this.AvgAttendanceCount = Number((avgAttendanceData.reduce((pre, cur) => pre + cur) / avgAttendanceData.length).toFixed(2));
    // await this.renderAvgAttendanceChart(avgAttendanceData);
  }

  renderChart(chartType: keyof ChartTypeRegistry, elementHolder: ElementRef, labels: Array<string>, datasets: Array<ChartDataset<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint | null)[]>>, options: Object): Chart {
    return new Chart(elementHolder.nativeElement, {
      type: chartType,
      data: {
        labels,
        datasets,
      },
      options,
    });
  }

  async renderPresentCountChart(data: Array<number>) {
    try {

      if (this.presentCountChartObj) {
        this.presentCountChartObj.destroy();
      }

      // const labels = ['04-06', '05-06', '06-06', '07-06', '08-06', '09-06', '10-06'];
      const labels = this.getPastDates(7);

      const datasets = [
        {
          label: '',
          data,
          backgroundColor: [
            'rgba(255, 255, 255, 0.3)',
          ],
          borderColor: [
            'rgba(255, 255, 255, 0.5)',
          ],
          borderWidth: 1,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          fill: {
            target: 'origin',

          },
        },
      ];

      const options = {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              display: false,
            },
            border: {
              display: false,
            },
            stacked: true,

          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              display: false,
            },
            border: {
              display: false,
            },
            stacked: true,
          },
        }
      };
      console.log('PresentCountChart ', this.PresentCountChart)

      this.presentCountChartObj = this.renderChart('bar', this.PresentCountChart, labels, datasets, options);
    } catch (renderChartError: Error | any) {
      /** @fixme Should render a message display on page instead of alert. */
      console.log('renderChartError', renderChartError);
      // this.helper.presentAlert('Error rendering reports', renderChartError.message || 'Please try again in some time.');
    }
  }

  async renderLateCountChart(data: Array<number>) {

    if (this.lateCountChartObj) {
      this.lateCountChartObj.destroy();
    }
    const labels = this.getPastDates(7);
    // const labels = ['04-06', '05-06', '06-06', '07-06', '08-06', '09-06', '10-06'];

    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.3)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.5)',
        ],
        borderWidth: 1,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',

        },
      },
    ];
    const options = {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
      }
    };
    this.lateCountChartObj = this.renderChart('line', this.LateCountChart, labels, datasets, options);
    this.isLateCount = true;
  }

  async renderOverTimeCountChart(data: Array<number>) {

    if (this.overtimeCountChartObj) {
      this.overtimeCountChartObj.destroy();
    }
    const labels = this.getPastDates(7);
    // const labels = ['04-06', '05-06', '06-06', '07-06', '08-06', '09-06', '10-06'];

    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.3)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.5)',
        ],
        borderWidth: 1,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',

        },
      },
    ];
    const options = {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
      }
    };
    this.overtimeCountChartObj = this.renderChart('bar', this.OvertimeCountChart, labels, datasets, options);
  }

  async renderLeaveCountChart(data: Array<number>) {

    if (this.leaveCountChartObj) {
      this.leaveCountChartObj.destroy();
    }
    // const labels = ['21-06', '22-06', '23-06', '24-06', '25-06', '26-06', '27-06'];
    const labels = this.getPastDates(7);
    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.3)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.5)',
        ],
        borderWidth: 1,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',

        },
      },
    ];
    const options = {
      borderJoinStyle: 'miter', // "round", "bevel", and "miter"
      borderWidth: '15',
      fill: {
        below: 'rgb(0, 0, 255)'
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
      }
    };
    this.leaveCountChartObj = this.renderChart('line', this.LeaveCountChart, labels, datasets, options);
  }

  async renderEmploymentTypeChart(dataset = []) {

    if (this.employmentTypeChartObj) {
      this.employmentTypeChartObj.destroy();
    }
    const labels: Array<string> = ['', '', ''];

    const options = {
      indexAxis: 'y',
      layout: {
        padding: {
          bottom: -40
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
          stacked: true,
        },
        y: {
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
          stacked: true,
        },
      }
    };
    this.employmentTypeChartObj = this.renderChart('bar', this.EmployeeTypesChart, labels, dataset, options);
  }

  async renderGenderRatioChart() {

    if (this.genderRatioChartObj) {
      this.genderRatioChartObj.destroy();
    }

    const labels: Array<string> = [];
    const data: Array<number> = [];

    this.genderList.filter((elem: any) => {
      if (elem.gender.toLowerCase() != 'total') {
        labels.push(elem.gender);
        data.push(elem.count);
      }
    })

    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.8)',
          'rgba(255, 255, 255, 0.6)',
          'rgba(255, 255, 255, 0.4)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 0.7)',
          'rgba(255, 255, 255, 0.3)',
        ],
        borderWidth: 1,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',

        },
      },
    ];
    const options = {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
      },
    };
    console.log('this.GenderRatioChart ', this.GenderRatioChart)
    this.genderRatioChartObj = this.renderChart('pie', this.GenderRatioChart, labels, datasets, options);
  }

  async renderLocationRatioChart(data: Array<number>, labels: Array<string>) {
    if (this.locationRatioChartObj) {
      this.locationRatioChartObj.destroy();
    }
    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 0.6)',
          'rgba(255, 255, 255, 0.3)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 0.7)',
          'rgba(255, 255, 255, 0.4)',
        ],
        borderWidth: 1,
        borderAlign: 'center',
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',
        },
      },
    ];
    const options = {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          },
        },
      },
      borderAlign: 'center',
      borderDashOffset: 5.5
    };
    this.locationRatioChartObj = this.renderChart('pie', this.LocationRatioChart, labels, datasets, options);
  }

  async renderAvgAttendanceChart(data: Array<number>) {
    if (this.avgAttendanceChartObj) {
      this.avgAttendanceChartObj.destroy();
    }
    const labels = this.getPastDates(28);
    // const labels = ['14-05', '15-05', '16-05', '17-05', '18-05', '19-05', '20-05', '21-05', '22-05', '23-05', '24-05', '25-05', '26-05', '27-05', '28-05', '29-05', '30-05', '31-05', '01-06', '02-06', '03-06', '04-06', '05-06', '06-06', '07-06', '08-06', '26-06', '27-06'];

    const datasets = [
      {
        label: '',
        data,
        backgroundColor: [
          'rgba(255, 255, 255, 0.3)',
          // 'rgba(0, 0, 0, 0.3)',
          // 'rgba(255, 132, 0, 1)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.5)',
          // 'rgba(255, 132, 0, 1)',
        ],
        borderWidth: 1,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        fill: {
          target: 'origin',

        },
      },
    ];

    const options = {
      borderJoinStyle: 'miter', // "round", "bevel", and "miter"
      borderWidth: '15',
      fill: {
        below: 'rgb(0, 0, 255)'
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          border: {
            display: false,
          }
        },
      }
    };

    this.avgAttendanceChartObj = this.renderChart('bar', this.AvgAttendanceChart, labels, datasets, options);
  }

  mapLocationData: any = [
    // {
    //   user: 'Himesh Suthar',
    //   img: 'https://drive.google.com/thumbnail?id=1cihxk25eAaDnwIQ-SrPy0hVrbVS3V6rZ',
    //   lat: 22.294660765639650,
    //   lng: 70.74605780825004,
    //   clock_in_time: '12:18:58',
    // },
    // {
    //   user: 'Mehul Bhatt',
    //   img: 'https://images.unsplash.com/photo-1682905926517-6be3768e29f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    //   lat: 22.3171103,
    //   lng: 73.1328684,
    //   clock_in_time: '11:20:14',
    // },
    // {
    //   user: 'Vivek Bharda',
    //   img: 'https://drive.google.com/thumbnail?id=1cihxk25eAaDnwIQ-SrPy0hVrbVS3V6rZ',
    //   lat: 22.294660765639645,
    //   lng: 70.74605780825004,
    //   clock_in_time: '10:17 AM',
    // },
    // {
    //   user: 'Maharshi Mehta',
    //   img: 'https://drive.google.com/thumbnail?id=1cihxk25eAaDnwIQ-SrPy0hVrbVS3V6rZ',
    //   lat: 22.294660765639665,
    //   lng: 70.74605780825004,
    //   clock_in_time: '10:05 AM',
    // },
  ]

  createMapLocationData() {
    let present = this.filterList('present');
    console.log('present', present);

    present.forEach((user) => {
      this.ismapLocation = true;
      this.mapLocationData.push({
        user: user.name,
        img: user.worklogsList[0]['clockIn']['image'] || user.name,
        lat: user.worklogsList[0]['clockIn']['location']['lat'], //22.294660765639650,
        lng: user.worklogsList[0]['clockIn']['location']['lng'], //70.74605780825004,
        clock_in_time: user.clockIn,
      })
    })
    // this.mapLocationData
  }

  getPastDates(numDays: number) {
    const pastDates = [];
    const today = new Date(); // Get the current date

    for (let i = 0; i < numDays; i++) {
      const pastDate = new Date(today); // Create a new date object for each iteration
      pastDate.setDate(today.getDate() - i - 1); // Subtract the number of days

      pastDates.push(pastDate.toDateString()); // Add the formatted date to the array
    }
    return pastDates.reverse();
  }

  getDateRangeLogs(numDays: number) {
    let setOfDates = new Set();
    let dateRange = {
      end: moment().format('DD/MM/YYYY'),
      start: moment().subtract(numDays, 'd').format('DD/MM/YYYY')
    }

    this._logsService.getLogsFromSheets(null, null, dateRange).subscribe(async (res) => {
      // console.log("numDays response : ", numDays);
      // console.log("logs response : ", res);
      const entries = res.split(',')
      const chunkSize = 8;
      let logs: any;
      let diffEntry: any[] = [];
      for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = entries.slice(i, i + chunkSize);
        diffEntry.push(chunk)
      }
      const dataForUniq = JSON.parse(JSON.stringify(diffEntry))
      // console.log('dataForUniq', diffEntry, dataForUniq)
      const uniq = await this._logsService.getUniwData(dataForUniq);
      // console.log('uniquniq', uniq)
      let uniqSingleEntry: any[] = [];
      uniq.forEach((ent: any) => {
        uniqSingleEntry.push(ent[0]);
      })
      // console.log('sheet res', uniqSingleEntry, diffEntry);
      const finalLogs = this._logsService.getFinalLogs(uniqSingleEntry, diffEntry);
      // console.log('finalLogs', finalLogs);
      logs = finalLogs.filter((x) => {
        setOfDates.add(x.date);
        x.unixTime = moment(
          x.date.concat('|').concat(x.time),
          'DD/MM/YYYY|hh:mm:ss'
        ).unix();
        return x;
      }).sort((a, b) => {
        return a.unixTime - b.unixTime;
      });

      let tempDate = moment(dateRange.start, 'DD/MM/YYYY')
      while (tempDate.format('DD/MM/YYYY') != dateRange.end) {
        if (!setOfDates.has(tempDate.format('DD/MM/YYYY'))) {
          logs.push({
            date: tempDate.format('DD/MM/YYYY')
          })
        }
        tempDate = tempDate.add(1, 'd');
      }
      const data = logs
      logs = data.sort((a: any, b: any) => {
        return moment(a.date, "DD/MM/YYYY").unix() - moment(b.date, "DD/MM/YYYY").unix()
      });
      // console.log("logs ::: ", logs);
      const avgAttendanceData: any = [];
      const lateAttendanceData: any = [];
      let dateArray: any = [];
      let emailArray: any = [];
      let lateAttArray: any = [];
      logs.filter((elem: any, i: number) => {
        if(dateArray.length === 0) {
          dateArray.push(elem.date);
        } else if(!dateArray.includes(elem.date)) {
          let array = [...emailArray]
          avgAttendanceData.push(array && array.length ? array.length : 0);
          lateAttendanceData.push(lateAttArray.length)
          emailArray = [];
          lateAttArray = [];
          dateArray.push(elem.date);
        }
        if (elem.email && elem.type && elem.action && !emailArray.includes(elem.email) && elem.type === 'clock' && elem.action === 'start') {
          emailArray.push(elem.email);
          if (moment(`${elem.date} ${elem.time}`, 'DD/MM/YYYY HH:mm:ss').isAfter(moment(`${elem.date} ${config.clockStartTime}`, 'DD/MM/YYYY HH:mm:ss'))) {
            lateAttArray.push(elem.email);
          }
        }
      })
      avgAttendanceData.push(emailArray.length);
      lateAttendanceData.push(lateAttArray.length);
      if(numDays === 28) {
        this.AvgAttendanceCount = Number((avgAttendanceData.reduce((pre: any, cur: any) => pre + cur) / avgAttendanceData.length).toFixed(2));
        this.isAttendance = true;
        this._cd.detectChanges();
        this.renderAvgAttendanceChart(avgAttendanceData);
      } else if(numDays === 7) {
        this.presentLogLoaded = false;
        this.isLateCount = true;
        this._cd.detectChanges();
        this.renderPresentCountChart(avgAttendanceData);
        this.renderLateCountChart(lateAttendanceData);
      }
    }, err => {
      console.log('sheet error', err);
    })
  }

  closeDrawer() {
    this.isPresentFilter = false;
    this.isLateFilter = false;
    this.dashboardHistoryDrawer.close();
    this.leaveDetailDrawer.close();
  }

  opentDashboardHistoryDrawer(filterType: string) {
    if (filterType === 'present') {
      this.isPresentFilter = true;
      this.isLateFilter = false;
    } else if (filterType === 'lateClockIn') {
      this.isLateFilter = true;
      this.isPresentFilter = false;
    }
    this.dashboardHistoryDrawer.open();
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  /** @note handle (Approve/Reject) leaves */
  handleLeave(event: any) {
    this.updateCalendarEvent(event.data, event.event);
  }

  /** @note update Calendar event with appropriate status (Approve/Reject) */
  updateCalendarEvent(leaveData: any, status: number) {
    for (let i = 0; i < this.events.length; i++) {
      let _event: any = this.events[i];
      /** @note get particular event inorder to update status */
      if (_event['leaveData'] && _event['leaveData'].id === leaveData.id) {
        if (status === 3) { /** @note rejected leave */
          _event.color = colors['red'];
          _event['leaveData'].status = status;
          _event['leaveData'].admin_comment = leaveData.admin_comment;
        } else if (status === 1) { /** @note approved leave */
          _event.color = colors['green'];
          _event['leaveData'].status = status;
        }
      }
    }
  }
}
