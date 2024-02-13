import { Component, OnInit, SimpleChange, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { WpServiceService } from '../services/wp-service.service';
import { combineLatest } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpResponse } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-attendance-regularize',
  templateUrl: './attendance-regularize.component.html',
  styleUrls: ['./attendance-regularize.component.scss'],
})

export class AttendanceRegularizeComponent implements OnInit {
  @ViewChild('regularizationDetail') dashboardHistoryDrawer: MatDrawer;
  @ViewChild('myPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['sr_number', 'name', 'date', 'symbol', 'action'];
  dataSource: any;
  isLoading: boolean = true;
  loading: boolean = false;
  dateLogs: any = [];
  setOfDates = new Set();
  currentMonth = moment().format('MM');
  currentYear = moment().format('YYYY');
  dateStart: any = '01/' + this.currentMonth + '/' + this.currentYear;
  dateEnd: any = moment().format('DD/MM/YYYY');
  range = new FormGroup({
    start: new FormControl(moment().startOf('month').format('YYYY-MM-DD')),
    end: new FormControl(moment().format('YYYY-MM-DD')),
  });
  startdate = `${this.range.value.start}T00:00:00`;
  enddate = `${this.range.value.end}T23:59:00`;
  maxDate = new Date();
  requestDetail: any;
  data: any;
  searchInput: any;
  todayString: string = new Date().toDateString();
  regularizationStatus: any = [];
  regularizationRequestList: any = [];
  requestStatus = 3;
  statusCount: any;
  noDataMsg = 'No Regularize Request Found';
  logValid = false;
  selectedIndex: number = -1
  pageSizeOptions: number[] = [25, 50, 75, 100];
  reguarizationCountSubscriber: any;
  regularizePendingCount: number = 0;
  responseLength: number = 0;
  pendingCount: any = [];
  regularizationList: any = [];
  payload = {
    "pageSize": this.pageSizeOptions[0],
    "pageIndex": 0
  }

  constructor(private _wpService: WpServiceService) { this.getRegularizeCount(this.startdate, this.enddate, this.payload) }



  // UTILITY

  ngOnInit(): void {
    this.getAllRegularizeData(this.startdate, this.enddate, this.payload);
  }



  /**@note validate the date formate using regex */
  validateLogs(event: any) {
    let regex = new RegExp(/^([1-9]|1[0-9]|2[0-9]|3[0-1])\/([1-9]|1[0-2])\/202[0-5]$/g)
    let matches = regex.test(event.target.value);
    console.log(matches);

    if (matches) {
      this.logValid = false;
    } else {
      this.logValid = true;
    }
  }

  /**@note user can not add char in date input field */
  numberOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**@note open the support request drawer. */
  openRegularizationReqDetail(requestDetail: any) {
    this.requestDetail = requestDetail;
    this.dashboardHistoryDrawer.open();
  }

  /**@note close the support request drawer. */
  closeDrawer() {
    this.dashboardHistoryDrawer.close();
  }

  /** @note if both range start and end are selected then call API. */
  dateRangeChange() {
    if (this.range.value && this.range.value.end) {
      const startdate = `${moment(this.range.value.start).format(
        'YYYY-MM-DD'
      )}T00:00:00`;
      const enddate = `${moment(this.range.value.end).format(
        'YYYY-MM-DD'
      )}T23:59:00`;
      this.getAllRegularizeData(startdate, enddate, this.payload);
      this.getRegularizeCount(startdate, enddate, this.payload);

    }
  }

  /**@note on paginator change then they */
  onPaginateChange(event: any) {
    let payload = {
      "pageSize": event.pageSize,
      "pageIndex": event.pageIndex
    }
    if (this.range.value && this.range.value.end) {
      const startdate = `${moment(this.range.value.start).format(
        'YYYY-MM-DD'
      )}T00:00:00`;
      const enddate = `${moment(this.range.value.end).format(
        'YYYY-MM-DD'
      )}T23:59:00`;
      this.getAllRegularizeData(startdate, enddate, payload);
    }
  }

  /**@note Filter data status wise. */
  applyFilter() {
    console.log("regularization status : ", this.requestStatus);
    if (this.range.value && this.range.value.end) {
      const startdate = `${moment(this.range.value.start).format(
        'YYYY-MM-DD'
      )}T00:00:00`;
      const enddate = `${moment(this.range.value.end).format(
        'YYYY-MM-DD'
      )}T23:59:00`;
      console.log("DATE START : ", startdate);
      console.log("DATE END : ", enddate);
      this.getAllRegularizeData(startdate, enddate, this.payload);
    }
  }

  onChange() {
    if (this.searchInput && this.requestStatus) {
      let statusName = this.regularizationStatus.filter((element: any) => element.id === this.requestStatus);
      var filterData = this.regularizationRequestList.filter((element: any) => {
        if (element.name.toLowerCase().includes(this.searchInput.trim().toLowerCase()) && element.status === statusName[0].name) {
          this.loading = false;
          return element;
        }
        else {
          this.loading = true;
        }
      })
      this.dataSource = new MatTableDataSource(filterData);
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource = new MatTableDataSource(this.regularizationRequestList);
      this.dataSource.sort = this.sort;

    }
    if (this.dataSource.data.length === 0) {
      this.loading = true
    } else {
      this.loading = false
    }
  }

  requestApproved(event: any) {
    console.log('EVENT OF REQUEST APPROVED', event);
    let startdate = `${moment(this.range.value.start).format(
      'YYYY-MM-DD'
    )}T00:00:00`;
    let enddate = `${moment(this.range.value.end).format(
      'YYYY-MM-DD'
    )}T23:59:00`;
    this.getAllRegularizeData(startdate, enddate, this.payload);
    if (this.regularizePendingCount > 0) { this.regularizePendingCount--; }
    this._wpService.setRegularizeCount(this.regularizePendingCount);
    this.dashboardHistoryDrawer.close();
  }

  // API CALL

  /**@note get all regularizeData from wp. */
  getAllRegularizeData(startdate: any, enddate: any, payload: any) {
    this.isLoading = true;
    combineLatest([this._wpService.getRegularizeData(startdate, enddate, payload, this.requestStatus), this._wpService.getStatusList()]).subscribe((res: any) => {
      this.regularizationList = [];
      this.isLoading = false;
      this.regularizationRequestList = res[0].body;
      this.responseLength = res[0].headers.get('X-WP-Total')
      this.regularizationStatus = res[1];
      // console.log("this.regularizationStatus : ",this.regularizationStatus);
      let pendingStatus = this.regularizationStatus.find(
        (status: any) => status.id === this.requestStatus
      );

      if (this.regularizationRequestList && !this.regularizationRequestList.length) {
        this.dataSource = new MatTableDataSource();
        this.dataSource.sort = this.sort;
        this.statusCount = this.dataSource.data.length;

      }

      this.regularizationRequestList.filter((element: any) => {
        if (element['regularization-status'][0] === pendingStatus.id) {
          element['status'] = pendingStatus.name;
          this.regularizationList.push(element);
        }
        this.dataSource = new MatTableDataSource(this.regularizationList);
        this.dataSource.sort = this.sort;
        this.statusCount = this.dataSource.data.length;
      });

      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      if (this.dataSource.data.length === 0) {
        this.loading = true;
      }
      else {
        this.loading = false
      }
    },
      (error) => {
        this.isLoading = false;
        console.log('error while fetching data from wp');
      }
    );
  }

  /**
   * @note this function is used to display the status wise count in regularize page. 
   */
  getRegularizeCount(startdate: any, enddate: any, payload: any) {
    this._wpService.getRegularizeData(startdate, enddate, payload).subscribe((data: any) => {
      let filterData = data.body.filter((element: any) => element['regularization-status'][0] === 3);
      this.statusCount = filterData.length
    });
  }


  /**@note HERE TO GET THE STATUS LIST FROM THE WORDPRESS*/
  getStatusList() {
    this.isLoading = true;
    this._wpService.getStatusList().subscribe(
      (data: any) => {
        this.isLoading = false;
      },
      (err) => {
        console.log('Error while getting status: ', err);
      }
    );
  }
}