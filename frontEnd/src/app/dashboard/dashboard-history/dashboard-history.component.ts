import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { map } from 'rxjs';
import { WpServiceService } from 'src/app/services/wp-service.service';

@Component({
  selector: 'app-dashboard-history',
  templateUrl: './dashboard-history.component.html',
  styleUrls: ['./dashboard-history.component.scss'],
})
export class DashboardHistoryComponent implements OnInit {
  currentMonth = moment().format('MM');
  currentYear = moment().format('YYYY');
  currenDate = moment().utc().format('YYYY-MM-DD');
  @Input('presentFilter') presentFilter: boolean;
  @Input('lateFilter') lateFilter: boolean;
  range = new FormGroup({
    filterDate: new FormControl(moment().utc().format()),
  });
  displayedColumns: string[] = ['sr no', 'name', 'clockIn', 'clockOut', 'breakStart', 'breakStop', 'workDuration', 'breakDuraion', 'status']
  displayLogs: any = [];
  maxDate = new Date();
  dailyLogsRef: any;
  userLogs: any = [];
  isLoading: boolean = false;
  pageSizeOptions: number[] = [25, 50, 75, 100];
  responseLength = 0;
  userList: any = [];
  payload = {
    "pageSize": this.pageSizeOptions[0],
    "pageIndex": 0
  }
  calculatedLogs: any = [];
  noDataMsg: string = '';
  selectedFilterOption: string = '';
  filterOptions: any = [
    { title: 'All', value: 'all' },
    { title: 'Present', value: 'present' },
    { title: 'Absent', value: 'absent' },
    { title: 'Late clock in', value: 'late' },
  ]
  constructor(
    private _wpService: WpServiceService,
    private _snackbar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    if (this.presentFilter) {
      this.noDataMsg = `No one is present on mentioned date.`;
      this.selectedFilterOption = 'present';
      this.getAttendanceData(this.selectedFilterOption, this.currenDate, this.payload);
    } else {
      this.noDataMsg = `No late clock-in found on mentioned date.`;
      this.getAttendanceData(this.selectedFilterOption, this.currenDate, this.payload);
      this.selectedFilterOption = 'late';
    }
  }

  /**
   * Get data of selected date from the Date-picker.
   */
  dateChange(event: MatDatepickerInputEvent<any>) {
    let selectedDate = new Date(event.value)
    // let startDate = moment(selectedDate).utc().format('YYYY-MM-DD')
    let startDate = moment.utc(selectedDate).toDate();
    let finalDate = moment(startDate).format('YYYY-MM-DD')
    this.displayLogs = [];
    this.getAttendanceData(this.selectedFilterOption, finalDate, this.payload)
  }

  /** @note assign value to displayLogs variable according to the filter apply from the Drop-down. */
  onChange(event?: any) {
    let currentDate: any = this.range.value.filterDate;
    let selectedDate = new Date(currentDate)
    let startDate = moment.utc(selectedDate).toDate();
    let finalDate = moment(startDate).format('YYYY-MM-DD')
    this.displayLogs = [];
    this.selectedFilterOption = event.value;
    this.getAttendanceData(event.value, finalDate, this.payload)
  }

  onPaginate(event: any) {
    let payload = {
      "pageSize": event.pageSize,
      "pageIndex": event.pageIndex
    }
    let currentDate: any = this.range.value.filterDate;
    let selectedDate = new Date(currentDate)
    let startDate = moment.utc(selectedDate).toDate();
    let finalDate = moment(startDate).format('YYYY-MM-DD')
    this.getAttendanceData(this.selectedFilterOption, finalDate, payload)
  }


  // /*********************** || GENERAL VERSIONS CODE START HERE || ***********************/

  /**
  * 
  * @param status C=Getting data using status wise in using status params. 
  * @param date   This params take date for the logs.
  * @param payload payload take pageSize and pageIndex in Api.
  */
  getAttendanceData(status: any, date: any, payload: any) { /**@note This function will get the logs from present and past date. */
    this.isLoading = true;
    this._wpService.getAttendanceList(status, date, payload).subscribe((res: any) => {
      this.responseLength = res.headers.get('X-Wp-Total')
      this.displayLogs = res.body;
      this.isLoading = false;
    }, (error: any) => {
      this.displayLogs = []
      this._snackbar.open(`${error.error['message']}` || 'Something went wrong!', 'ok', {
        duration: 3000
      });
      this.isLoading = false;

    })
  }


}
