import { Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RejectLeaveModalComponent } from 'src/app/hrms/reject-leave-modal/reject-leave-modal.component';
import { UtilityService } from 'src/app/services/utility.service';
import { WpServiceService } from 'src/app/services/wp-service.service';
import * as moment from "moment";
import { Output, EventEmitter } from '@angular/core';
import { DialogOverviewExampleDialog } from 'src/app/common/log/log.component';
import { LeaveAttatchmentPreviewModalComponent } from 'src/app/common/leave-attatchment-preview-modal/leave-attatchment-preview-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Observer } from "rxjs";
@Component({
  selector: 'app-calendar-leave-modal',
  templateUrl: './calendar-leave-modal.component.html',
  styleUrls: ['./calendar-leave-modal.component.scss']
})
export class CalendarLeaveModalComponent implements OnInit {
  @Input('leaveDetail') leaveDetail: any;
  @Output() handleRejection = new EventEmitter<any>();
  leaveDetailForm: FormGroup;
  isAttatchment: boolean = false;
  isLoading = false
  constructor(
    public dialogRef: MatDialogRef<CalendarLeaveModalComponent>,
    public dialog: MatDialog,
    public _utilityService: UtilityService,
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar
    // @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    // console.log('event is', this.data, 'id is', this.data.event)
  }

  formatReason(reason: any) {
    return reason.replace(/\\'/g, "\'").replace(/\\"/g, '\"').replace(/&amp;/g, "&");
  }

  ngOnChanges(event: SimpleChanges) {
    if (event && event['leaveDetail'] && event['leaveDetail'].currentValue) {
      this.leaveDetail = event['leaveDetail'].currentValue;
      console.log("this.leaveDetail : ", this.leaveDetail);
      this.generateForm();
      this.checkAttatchment();
    }
  }

  checkAttatchment() {
    if (Object.keys(this.leaveDetail.leave_attachments).length) {
      this.isAttatchment = true;
      console.log("this.leaveDetail.leave_attachments : ", this.leaveDetail.leave_attachments[Object.keys(this.leaveDetail.leave_attachments)[0]])
    } else {
      this.isAttatchment = false;
    }
  }

  /** @note Generate form group and set default values to the form-field. */
  generateForm() {
    console.log("THIS IS THE LEAVE DETAILS", this.leaveDetail)
    this.leaveDetailForm = new FormGroup({
      'employeeName': new FormControl(this.leaveDetail.employee_name),
      'leaveType': new FormControl(this.leaveDetail.policy_name),
      'leavePeriod': new FormControl(this.leaveDetail.days),
      'fromDate': new FormControl(moment(this.leaveDetail.start_date, "YYYY-MM-DD").format("DD-MM-YYYY")),
      'toDate': new FormControl(moment(this.leaveDetail.end_date, "YYYY-MM-DD").format("DD-MM-YYYY")),
      'reason': new FormControl(this.leaveDetail.reason),
      'halfDay': new FormControl(this.getHalfDayData(this.leaveDetail.day_status_id)),
      'adminComment': new FormControl(this.leaveDetail.admin_comment),
      'createdAt': new FormControl(moment(this.leaveDetail.created_at).format("DD-MM-YYYY")),
    });
    console.log("adminComment ::: ", this.leaveDetailForm.value);
  }

  getHalfDayData(dayStatusId: string) {
    if (dayStatusId === '2') {
      return 'Morning'
    } else if (dayStatusId === '3') {
      return 'Afternoon'
    } else {
      return 'Full Day'
    }
  }

  action(event: number) {
    /** @note Rejecting leave with motes. */
    if (event === 3) {
      // element.status = 3
      this._utilityService.commonDialogBoxOpen(RejectLeaveModalComponent).afterClosed().subscribe((submit) => {
        if (submit) {
          this.leaveDetail['admin_comment'] = submit;

          this._wpService.updateLeave(event, submit, this.leaveDetail.id).subscribe((res) => {
            this.handleRejection.emit({
              event: event,
              data: this.leaveDetail
            })
          }, (error: any) => { /** @note error handling */
            console.log("Error : ", error);
            this._snackBar.open('Something went wrong!', 'Ok', { duration: 10000 });
          })
        }
      });
    }
    if (event === 1) { /** @note Approve leave */
      this.isLoading = true
      this._wpService.updateLeave(event, '', this.leaveDetail.id).subscribe((res) => {
        this.handleRejection.emit({ event: event, data: this.leaveDetail })
        this._snackBar.open('Leave Approved Successfully', 'ok', { duration: 3000 });
        this.isLoading = false
      }, (error: any) => { /** @note error handling */
        this._snackBar.open('Something went wrong!', 'Ok', { duration: 2000 });
        this.isLoading = false
      })
    }
  }

  close() {
    this.dialog.closeAll()
  }

  getAttatchmentUrl() {
    const attatchmentData = this.leaveDetail.leave_attachments[Object.keys(this.leaveDetail.leave_attachments)[0]].split('.')
    if (attatchmentData && attatchmentData.length && attatchmentData[attatchmentData.length - 1] === 'pdf') return 'assets/images/pdf.png'
    else return this.leaveDetail.leave_attachments[Object.keys(this.leaveDetail.leave_attachments)[0]]
  }


  openAttatchment(): void {
    let imageUrl = this.leaveDetail.leave_attachments[Object.keys(this.leaveDetail.leave_attachments)[0]];
    /** @note Open Leave attatchment to new window. */
    window.open(imageUrl, '_blank');
  }
}
