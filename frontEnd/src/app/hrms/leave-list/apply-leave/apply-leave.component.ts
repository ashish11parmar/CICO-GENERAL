import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, ElementRef, ViewChild, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WpServiceService } from 'src/app/services/wp-service.service';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  uploadFile: any;
  leavePeriod = ["Morning", "Afternoon"];
  isLoading = false;
  reason = '';
  checkedValue: any;
  isChecked = false;
  users: any;
  mediaUrl: any;
  leave_Period: any;
  leaves: any = [];
  empid: any;
  policyId: any;
  fromDate: any;
  toDate: any;
  logValid = false;
  isSickLeave: boolean = false;
  @Input('emplUserLeave') emplUserLeave: any;
  @Output() leave = new EventEmitter<any>();
  @ViewChild("img", { static: false }) img: any;
  constructor(private _wpService: WpServiceService,
    private cf: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {
    this.getEmployee();
  }

  async getEmployee() {
    this._wpService.getEmployeeList().subscribe((res: any) => {
      this.isLoading = false;
      this.users = res;
    });
  }
  async getLeavePolice(uid: any) {
    console.log(uid + "uid")
    this._wpService.leavePolicy(uid).subscribe((res: any) => {
      this.leaves = res;
      console.log('leave policy ', this.leaves)
    })
  }
  onSelectionLeaveChange(event: MatSelectChange) {
    this.uploadFile = null; /** @note reset upload file while changing Leaves from drop-down */
    this.policyId = event.value;
    let findLavetype = this.leaves.find((e: any) => e.policy_id === this.policyId);
    if (findLavetype) {
      /** @note if selected leave is Sick-leave then need to show upload attatchment button. */
      if (findLavetype.policy === 'Sick Leave') {
        this.isSickLeave = true;
      } else { /** @note user chanegs leave-type from drop-down */
        this.isSickLeave = false;
      }
    }
  }
  onSelectionPeriodChange(event: MatSelectChange) {
    this.leave_Period = event.value;
    console.log('leave period:', event.value);
  }
  async onSelectionChange(event: MatSelectChange) {
    this.isSickLeave = false; /** @note after changing user need to reset attatchment condition. */
    this.empid = event.value;
    this.getLeavePolice(event.value);
  }

  validateLogs(event: any) {
    let regex = new RegExp(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/g)
    let matches = regex.test(event.target.value);
    console.log("validate", event.target.value);
    console.log("validate date", matches);
    if (matches) {
      this.logValid = false;
    } else {
      this.logValid = true;
    }
  }

  onDateSelect(selectedDate: any, strDate: string) {
    if (strDate === "from") {
      this.fromDate = selectedDate;
      this.toDate = selectedDate;
    } else {
      this.toDate = selectedDate;
    }
    console.log('Selected date:', selectedDate, this.toDate);
    // other logic here
  }

  onCheckboxChange() {
    console.log(this.isChecked + "ischeck")
    if (this.isChecked == false) {
      this.isChecked = true;
      if (this.fromDate) this.toDate = this.fromDate;
    } else {
      this.isChecked = false;
    }
  }
  ApplyLeave() {
    if (this.isChecked) {
      if (this.leave_Period === "Morning") {
        this.checkedValue = 2;
      } else {
        this.checkedValue = 3;
      }
    } else {
      this.checkedValue = 1;
    }
    console.log(this.empid + "empid")

    let isRunning = true;
    console.log(this.emplUserLeave + "empleave")
    this.emplUserLeave.forEach((res: any) => {
      console.log(res.user_id, this.empid, res.start_date, this.fromDate, res.end_date, this.toDate, res.status, this.checkedValue)
      if (res.user_id == this.empid && res.start_date == this.fromDate && res.end_date == this.toDate && res.status !== '3') {
        isRunning = false;
        this._snackBar.open("Existing Leave Record found within selected range!", 'ok', {
          duration: 3000
        });
        //  return alert()

      }
    })
    if (isRunning) {
      if (this.uploadFile) {
        let formData = new FormData();
        formData.append("file", this.uploadFile);
        this._wpService.uploadImage(formData).subscribe((res: any) => {
          console.log('media url ', res, res.id);
          this.mediaUrl = res.id;
          this.applyData();
        }, (err) => {
          console.log('error while uploading picture ', err)
          this._snackBar.open('Something went wrong.', 'ok', {
            duration: 3000
          });
        })
      } else {
        this.mediaUrl = null;
        this.applyData();
      }
    }
    console.log(this.isChecked + "reason")
  }

  applyData() {
    this.isLoading = true;
    this._wpService.ApplyLeave(this.empid, this.policyId, this.fromDate, this.toDate, this.reason, this.checkedValue, this.mediaUrl).subscribe(async (res) => {
      console.log('Leave applied succesfully', res)
      this.isLoading = false;
      this.uploadFile = '';
      this.reason = '';
      this.mediaUrl = null;
      this.checkedValue = null;
      this.isChecked = false;
      this.leave_Period = null;
      this.leaves = [];
      this.empid = null;
      this.policyId = null;
      this.fromDate = null;
      this.toDate = null;
      this.emplUserLeave = [];
      if (this.img) { this.img.nativeElement.value = ""; }
      else { this.img = '' }
      console.log("apply leave response : ", res);
      this.leave.emit(res);
      this._snackBar.open('Leave Applied Successfully', 'ok', {
        duration: 3000
      });
    },
      async (error: any) => {
        console.log('apply user leave error ', error)
        this._snackBar.open(error.message, 'ok', {
          duration: 3000
        });
      })
  }
  selectedFile(event: any) {
    console.log('file select ', event)
    if (event.target.files && event.target.files[0]) {
      this.uploadFile = event.target.files[0];
      console.log('this.profileImg ', this.uploadFile.size)
      if (this.uploadFile.size > 2097152) {
        this.uploadFile = '';
        // this.appcomponent.errorAlert('Maximum upload image size is 2mb');
        return;
      }
      // const reader: FileReader = new FileReader();
      const reader = this.getFileReader();
      reader.onload = (event: any) => {
        // this.profileImgUrl = reader.result;
        this.cf.detectChanges();
        // console.log('this.profileImg ', reader.result)
      };
      reader.readAsDataURL(this.uploadFile);
    }
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  validationCheck() {
    if (this.empid && this.policyId && this.fromDate && this.toDate && this.reason) {
      if (this.isChecked) {
        if (this.leave_Period) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}
