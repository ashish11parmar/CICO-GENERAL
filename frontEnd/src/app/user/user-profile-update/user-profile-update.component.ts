import { Component, OnInit, Inject, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, } from '@angular/material/dialog';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { WpServiceService } from '../../services/wp-service.service';
import { combineLatest } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { RegularizeConfirmModalComponent } from '../../common/regularize-confirm-modal/regularize-confirm-modal.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserDetailModalComponent } from 'src/app/common/user-detail-modal/user-detail-modal.component';
import { isNull, result } from 'lodash';


@Component({
  selector: 'app-user-profile-update',
  templateUrl: './user-profile-update.component.html',
  styleUrls: ['./user-profile-update.component.scss'],
})
export class UserProfileUpdateComponent implements OnInit {
  @Input('user') selectedUser: any;
  @Input('reportingManagerList') reportingManagerList: any;
  @Input('roleList') roleList: any;
  @Output() closeDrawer = new EventEmitter();
  @ViewChild('educationSort') educationSort: MatSort;
  @ViewChild('workExpSort') workExpSort: MatSort;
  // @note basicInfo, workInfo and personalInfo form group is declared here.
  personalInfoForm: FormGroup;
  loading: boolean = false;
  isLoading: boolean = false;
  noData: boolean = false;
  workData: any;
  eduData: any;
  educationData: any
  maxDate = new Date();
  dataSource: any;
  status: any;
  empStatus: any;
  empDepartment: any;
  worktypeType: any;
  department: any;
  workingType: any;
  WorkExperience: string[] = ['company_name', 'job_title', 'from', 'to', 'Action'];
  EducationInfo: string[] = ['school', 'degree', 'finished', 'result_type', 'result', 'field', 'interest', 'Action'];

  constructor(
    public dialog: MatDialog,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _wpService: WpServiceService
  ) {
    this._wpService.employeeWorkType().subscribe((res) => {
      this.worktypeType = JSON.parse(res)
      this.workingType = Object.entries(this.worktypeType).map(([type, value]) => ({ type, value }));
      console.log('this.workingType ', this.workingType, res)
    })
    // this is API used to calling the dynamically employee status
    this._wpService.employeeStatus().subscribe((res) => {
      this.status = JSON.parse(res)
      this.empStatus = Object.entries(this.status).map(([type, value]) => ({ type, value }));
    })
    this._wpService.getDepartments().subscribe((res: any) => {
      this.department = res
    })
  }

  ngOnInit(): void {

    console.log("SELECTED USER::", this.selectedUser.id);

    this.getUserData();
    this.getUpdatedWorkExperience();
    this.getUpdatedEducation();
  }

  // FORM CONTROL
  createForm() {
    /**@note All form information from group. */
    this.personalInfoForm = this._fb.group({
      /** @note This field is already exist ==> [first_name, last_name, employee_id, middle_name, email, type, status, hiring_date, user_pass, repoting_to]*/
      first_name: new FormControl(this.selectedUser.first_name ? this.selectedUser.first_name : '', [Validators.required]),
      middle_name: new FormControl(this.selectedUser.middle_name ? this.selectedUser.middle_name : '', [Validators.required]),
      last_name: new FormControl(this.selectedUser.last_name ? this.selectedUser.last_name : '', [Validators.required]),
      employee_id: new FormControl(this.selectedUser.employee_id ? this.selectedUser.employee_id : '', [Validators.required]),
      email: new FormControl({ value: this.selectedUser.user_email ? this.selectedUser.user_email : '', disabled: this.selectedUser.user_email ? true : false }, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      department: new FormControl(this.selectedUser.department ? this.selectedUser.department : ''),
      designation: new FormControl(this.selectedUser.designation ? this.selectedUser.designation : ''),
      hiring_source: new FormControl(this.selectedUser.hiring_source ? this.selectedUser.hiring_source : ''),
      status: new FormControl(this.selectedUser.status ? this.selectedUser.status : ''),
      reporting_to: new FormControl(this.getTheSelectedUserFromData()),
      hiring_date: new FormControl(this.selectedUser.hiring_date ? this.selectedUser.hiring_date : ''),
      work_phone: new FormControl(this.selectedUser.work_phone ? this.selectedUser.work_phone : '', [this.mobileNumberValidator, Validators.pattern(/[0-9\+\-\ ]/)]),
      mobile: new FormControl(this.selectedUser.mobile ? this.selectedUser.mobile : '', [this.mobileNumberValidator, Validators.pattern(/[0-9\+\-\ ]/)]),
      type: new FormControl(this.selectedUser.type ? this.selectedUser.type : ''),
      blood_group: new FormControl(this.selectedUser.blood_group ? this.selectedUser.blood_group : ''),
      gender: new FormControl(this.selectedUser.gender ? this.selectedUser.gender : ''),
      date_of_birth: new FormControl(this.selectedUser.date_of_birth ? this.selectedUser.date_of_birth : ''),
      marital_status: new FormControl(this.selectedUser.marital_status ? this.selectedUser.marital_status : ''),
      address: new FormControl(this.selectedUser.address ? this.selectedUser.address : ''),
      street_1: new FormControl(this.selectedUser.street_1 ? this.selectedUser.street_1 : ''),
      city: new FormControl(this.selectedUser.city ? this.selectedUser.city : ''),
      state: new FormControl(this.selectedUser.state ? this.selectedUser.state : ''),
      country: new FormControl(this.selectedUser.country ? this.selectedUser.country : ''),
      postal_code: new FormControl(this.selectedUser.postal_code ? this.selectedUser.postal_code : ''),
      nationality: new FormControl(this.selectedUser.nationality ? this.selectedUser.nationality : ''),
      hobbies: new FormControl(this.selectedUser.hobbies ? this.selectedUser.hobbies : ''),
      father_name: new FormControl(this.selectedUser.father_name ? this.selectedUser.father_name : ''),
      mother_name: new FormControl(this.selectedUser.mother_name ? this.selectedUser.mother_name : ''),
      spouse_name: new FormControl(this.selectedUser.spouse_name ? this.selectedUser.spouse_name : ''),
      other_email: new FormControl(this.selectedUser.other_email ? this.selectedUser.other_email : ''),
    });
  }
  /*** this function is called when a reporting manager is not reporting manager of its own i used filtering
  for other i just need to returning the selectedUser.reporting_to and convert it to a string. ****/
  getTheSelectedUserFromData() {
    if (this.selectedUser && this.selectedUser.reporting_to) {
      this.reportingManagerList = this.reportingManagerList.filter((x: any) => x.user_id !== this.selectedUser.id);
    }
    return this.selectedUser.reporting_to.toString();
  }

  /*** @note this function is used to check wheather the entered mobile number is less than ten then it throw the mat-erroror mat-hint. */
  mobileNumberValidator(control: any) {
    const mobileNumber = control.value;

    if (mobileNumber && mobileNumber.length < 10) {
      return { 'invalidMobileNumber': true };
    }
    return null;
  }

  // UTILITY

  /** @note if user click in Employee breadcrumb then close user-profile drawer. */
  closeUserProfileDrawer() {
    this.closeDrawer.emit();
  }

  // compareReporting(a: any, b: any) { return a.reporting_to === b.user_id; }

  numberOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 47 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /**
   * @note This function is used to check if the user is entered proper 10 digit number for phone.
   */
  numberDigitOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 47 || charCode > 57)) {
      return false;
    }
    const inputValue = event.target.value;
    if (inputValue.length >= 10) {
      event.preventDefault();
    }
    return true;
  }

  /**
   * @note This function will open User detail moda.
   */
  openDialog(modalType: string): void {
    let dialogRef: any;
    /** @note open work-experience modal */
    if (modalType === 'workExperience') {
      dialogRef = this.dialog.open(UserDetailModalComponent, {
        data: {
          userId: this.selectedUser.id,
          modalType: "workExperience"
        },
      });
    } else { /** @note open education modal */
      dialogRef = this.dialog.open(UserDetailModalComponent, {
        data: {
          userId: this.selectedUser.id,
          modalType: "educationInfo"
        }
      });
    }

    dialogRef.afterClosed().subscribe((result: any) => {
      /** @note if modalType is Work-experience then update work-experience data */
      if (modalType === 'workExperience') { this.getUpdatedWorkExperience(); }
      /** @note if modalType is Education then update Education-info data */
      else { this.getUpdatedEducation(); }
    });
  }

  /** *** API Calls *** */


  updateAllFormInfo(formType: any) {
    if (formType === 'basicInfoForm') {
      console.log("formType::", formType, this.selectedUser.user_id);
      this.loading = true;
      combineLatest([this._wpService.updateUserProfile(this.selectedUser.user_id, this.personalInfoForm.value), this._wpService.updateUserProfileValue(this.selectedUser.user_id, this.personalInfoForm.value)]).subscribe(() => {
        this.loading = false;
        this._snackBar.open('Basic information is updated!', 'ok', {
          duration: 3000
        });
      }, (error: any) => {
        this.loading = false;
        this._snackBar.open(error.message, 'ok', {
          duration: 3000
        });
        console.log("error: ", error);
      })
    } else if (formType === 'workInfoForm') {
      console.log("formType::", formType);
      this.loading = true;
      combineLatest([this._wpService.updateUserProfile(this.selectedUser.user_id, this.personalInfoForm.value), this._wpService.updateUserProfileValue(this.selectedUser.user_id, this.personalInfoForm.value)]).subscribe(() => {
        this.loading = false;
        this._snackBar.open('Work information is updated!', 'ok', {
          duration: 3000
        });
      }, (error: any) => {
        this.loading = false;
        this._snackBar.open(error.message, 'ok', {
          duration: 3000
        });
        console.log("error:  ", error);
      })
    } else {
      console.log("formType::", formType);
      this.loading = true;
      combineLatest([this._wpService.updateUserProfile(this.selectedUser.user_id, this.personalInfoForm.value), this._wpService.updateUserProfileValue(this.selectedUser.user_id, this.personalInfoForm.value)]).subscribe(() => {
        this.loading = false;
        this._snackBar.open('Personal information is updated!', 'ok', {
          duration: 3000
        });
      }, (error: any) => {
        this.loading = false;
        console.log("Upload error: " + error)
        this._snackBar.open(error.message, 'ok', {
          duration: 3000
        });
      });
    }
  }
  /**@note getting data updated user data from WP and assign to userDetails var. */
  getUserData() {
    this.isLoading = true;
    this._wpService.getEmployee(this.selectedUser.id).subscribe((result: any) => {
      this.selectedUser = result;
      if (this.selectedUser) {
        console.log("CHECKNG reporting manager : ", this.reportingManagerList);
        let filterData = this.reportingManagerList.filter((x: any) => x.user_id !== this.selectedUser.id);
        this.selectedUser.reporting_to.toString();
        this.reportingManagerList = filterData
        console.log("this is filterdata:::", filterData);
      }
      this.createForm();
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.noData = true;
    })
  }


  editUserdetails(rowData: any, modalType: any) {
    console.log("row data : ", rowData);
    let dialogRef: any;
    /** @note open work-experience modal */
    if (modalType === 'workExperience') {
      dialogRef = this.dialog.open(UserDetailModalComponent, {
        data: {
          userId: this.selectedUser.id,
          userDetail: rowData,
          modalType: "workExperience"
        },
      });
    } else { /** @note open education modal */
      dialogRef = this.dialog.open(UserDetailModalComponent, {
        data: {
          userId: this.selectedUser.id,
          userDetail: rowData,
          modalType: "educationInfo"
        }
      });
    }

    dialogRef.afterClosed().subscribe((result: any) => {
      /** @note if modalType is Work-experience then update work-experience data */
      if (modalType === 'workExperience') { this.getUpdatedWorkExperience(); }
      /** @note if modalType is Education then update Education-info data */
      else { this.getUpdatedEducation(); }
    });
  }

  deleteConfirmation(rowData: any, modalType: any) {
    if (modalType === 'workExperience') {
      this.dialog.open(RegularizeConfirmModalComponent, {
        data: {
          headerTitle: 'Delete Work Experience',
          headerIcon: 'alarm_on',
          regularizeContetnt: 'Are you sure you want to delete work experience ?'
        }
      }).afterClosed().subscribe((result) => {
        if (result) { /** @note  */
          this.deleteWorkExp(rowData.id);
        }
      })
    } else {
      this.dialog.open(RegularizeConfirmModalComponent, {
        data: {
          headerTitle: 'Delete Education Information',
          headerIcon: 'alarm_on',
          regularizeContetnt: 'Are you sure you want to delete education information ?'
        }
      }).afterClosed().subscribe((result) => {
        if (result) { /** @note  */
          this.deleteEducationInfo(rowData.id);
        }
      })
    }

  }

  deleteWorkExp(experienceId: string) {
    this._wpService.deleteWorkExp(this.selectedUser.id, experienceId).subscribe((data) => {
      this._snackBar.open('Work Experience data is deleted', 'ok', {
        duration: 3000
      });
      this.getUpdatedWorkExperience();
    }, (error) => {
      this._snackBar.open(error.message, 'ok', {
        duration: 3000
      });
    })
  }

  deleteEducationInfo(educationId: string) {
    this._wpService.deleteEduInfo(this.selectedUser.id, educationId).subscribe((data) => {
      this._snackBar.open('Education data is deleted', 'ok', {
        duration: 3000
      });
      this.getUpdatedEducation();
    }, (error) => {
      this._snackBar.open(error.message, 'ok', {
        duration: 3000
      });
    })
  }

  /**@note get all updated Education data from WP */
  getUpdatedEducation() {
    this._wpService.getUpdatedEducation(this.selectedUser.id).subscribe((edudata: any) => {
      this.eduData = edudata.length;
      this.educationData = new MatTableDataSource(edudata);
      this.educationData.sortingDataAccessor = (item: any, property: any) => {
        switch (property) {
          case 'school': return item.school;
          case 'degree': return item.degree;
          case 'finished': return item.finished;
          case 'result_type': return item.result_type;
          case 'result': return item.result;
          case 'field': return item.field;
          case 'interest': return item.interest;
          // case 'notes': return item.notes;
          default: return item[property];
        }
      };
      this.educationData.sort = this.educationSort
    }, (error) => {
      console.log("Error getting updated", error);
    })
  }

  /**@note get all work Exp. updated data from WP */
  getUpdatedWorkExperience() {
    this._wpService.getUpdatedWrokExp(this.selectedUser.id).subscribe((data: any) => {
      this.workData = data.length
      console.log('this.workData', this.workData);
      this.dataSource = new MatTableDataSource(data)
      this.dataSource.sortingDataAccessor = (item: any, property: any) => {
        console.log('DATASOURCE', item)
        switch (property) {
          case 'company_name': return item.company_name;
          case 'job_title': return item.job_title;
          case 'from': return item.from;
          case 'to': return item.to;
          // case 'description': return item.description;
          default: return item[property];
        }
      };
      this.dataSource.sort = this.workExpSort;
    }, (error) => {
      console.log("Error", error);
    })
  }
}
