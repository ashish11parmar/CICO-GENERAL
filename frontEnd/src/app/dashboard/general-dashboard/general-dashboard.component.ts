// IMPORT ANGULAR CORE MODULES
import { Component, OnInit } from '@angular/core';

// IMPORT SERVICES
import { WpServiceService } from '../../services/wp-service.service';

// IMPORT EXTERNAL LIBRARIES
import * as moment from 'moment';


@Component({
  selector: 'app-general-dashboard',
  templateUrl: './general-dashboard.component.html',
  styleUrls: ['./general-dashboard.component.scss']
})
export class GeneralDashboardComponent implements OnInit {
  todayDate = moment().utc().format('YYYY-MM-DD');;
  pageSizeOptions = [25, 50, 75, 100];
  payload = {
    "pageSize": this.pageSizeOptions[0],
    "pageIndex": 0
  }
  constructor(
    public _wpService: WpServiceService
  ) { }

  ngOnInit(): void {
    this.getCurrentDateLogs('present', '2023-12-26', this.payload)
  }



  // UTILITY




  // API CALL


  /**
   * Get today logs from wordpress for specific company
   */
  getCurrentDateLogs(date: any, status: any, payload: any) {
    this._wpService.getAttendanceList(date, status, payload).subscribe((res: any) => {
      console.log("response: ", res);
    }, (error: any) => {
      console.log("ERORR::", error);
    })

  }

}
