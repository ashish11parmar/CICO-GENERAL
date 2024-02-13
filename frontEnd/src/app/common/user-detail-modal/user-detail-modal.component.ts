import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { WpServiceService } from 'src/app/services/wp-service.service';

@Component({
  selector: 'app-user-detail-modal',
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss']
})
export class UserDetailModalComponent implements OnInit {
  @Input('user') selectedUser: any;
  workexperienceForm: FormGroup;
  educationInfoForm: FormGroup;
  loading: boolean = false;
  startYear = new Date().getFullYear();
  completionYearRange: any[] = [];
  maxDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<UserDetailModalComponent>,
    public _fb: FormBuilder,
    private _wpService: WpServiceService,
    private _snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    for (let i = 0; i < 100; i++) {
      this.completionYearRange.push(this.startYear - i)
    }
  }

  ngOnInit(): void {
    this.userdetails();
  }
  // FORM GOURP

  userdetails() {
    console.log("checking user details : ", this.data.userDetail);
    if (this.data.modalType === 'workExperience') {
      /**@Note To create work-experience formGrop */
      this.workexperienceForm = this._fb.group({
        company_name: new FormControl(this.data.userDetail && this.data.userDetail.company_name ? this.data.userDetail.company_name : '', [Validators.required]),
        job_title: new FormControl(this.data.userDetail && this.data.userDetail.job_title ? this.data.userDetail.job_title : '', [Validators.required]),
        from: new FormControl(this.data.userDetail && this.data.userDetail.from ? this.data.userDetail.from : '', [Validators.required]),
        to: new FormControl(this.data.userDetail && this.data.userDetail.to ? this.data.userDetail.to : '', [Validators.required]),
        // description: new FormControl(this.data.userDetail && this.data.userDetail.description ? this.data.userDetail.description : '')
      });
    } else {
      /**@Note To create Education formGrop */
      this.educationInfoForm = this._fb.group({
        school: new FormControl(this.data.userDetail && this.data.userDetail.school ? this.data.userDetail.school : '', [Validators.required]),
        degree: new FormControl(this.data.userDetail && this.data.userDetail.degree ? this.data.userDetail.degree : '', [Validators.required]),
        finished: new FormControl(this.data.userDetail && this.data.userDetail.finished ? this.data.userDetail.finished : '', [Validators.required]),
        resulttype: new FormControl(this.data.userDetail && this.data.userDetail.result_type ? this.data.userDetail.result_type : '', [Validators.required]),
        result: new FormControl(this.data.userDetail && this.data.userDetail.result ? this.data.userDetail.result : '', [Validators.required]),
        field: new FormControl(this.data.userDetail && this.data.userDetail.field ? this.data.userDetail.field : '', [Validators.required]),
        interest: new FormControl(this.data.userDetail && this.data.userDetail.interest ? this.data.userDetail.interest : '', [Validators.required]),
        // notes: new FormControl(this.data.userDetail && this.data.userDetail.notes ? this.data.userDetail.notes : '')
      });
    }
  }

  // UTILITY

  selectChangeHandler(event: any) {
    /**@note if grade is selected then 1 field is added in from group */
    if (event.value === 'Grade') {
      this.educationInfoForm.addControl('scale', new FormControl(''))
    } else if (event.value === 'Percentage') {
      this.educationInfoForm.removeControl('scale')
    }
  }

  numberOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 47 || charCode > 57)) {
      return false;
    }
    return true;
  }

  resetWrokExperienceField() {
    this.workexperienceForm.reset();
    this.dialogRef.close();
  }
  resetEducationField() {
    this.educationInfoForm.reset();
    this.dialogRef.close();
  }


  //API CALL
  /**@note Add and Update workExp details. */
  updateWorkExperience() {
    console.log("USER::", this.data);

    this.loading = true;
    if (this.data.userDetail) {
      this._wpService.editWorkExp(this.data.userId, this.data.userDetail.id, this.workexperienceForm.value).subscribe((data) => {
        this.loading = false;
        this._snackbar.open('Work experience detail updated!', 'ok', {
          duration: 3000
        });
        this.dialogRef.close(data);
      }, (error) => {
        this.loading = false;
        this._snackbar.open(error.message, 'ok', {
          duration: 3000
        });
      })
    } else {
      this.loading = true;
      this._wpService.updateWorkExperience(this.data.userId, this.workexperienceForm.value).subscribe((data: any) => {
        console.log("updateWorkExperience", data.from, data.to);
        this.loading = false;
        this._snackbar.open('Work experience detail added!', 'ok', {
          duration: 3000
        });
        this.dialogRef.close(data);
      }, (error: any) => {
        this.loading = false;
        console.log("Error updating", error);
        this._snackbar.open(error.message, 'ok', {
          duration: 3000
        });
      })
    }
  }

  /**@note Add and Update Education details. */
  updateEducationInfoForm() {
    console.log("education form::", this.educationInfoForm.value);
    this.loading = true;
    if (this.data.userDetail) {
      this._wpService.editEducationExp(this.data.userId, this.data.userDetail.id, this.educationInfoForm.value).subscribe((data) => {
        this._snackbar.open('Education detail updated!', 'ok', {
          duration: 3000
        });
        this.dialogRef.close();
      }, (error) => {
        this._snackbar.open(error.message, 'ok', {
          duration: 3000
        });
        this.dialogRef.close();
      })
    } else {
      this._wpService.updateEducationInfo(this.data.userId, this.educationInfoForm.value).subscribe((data: any) => {
        console.log("updateWorkExperience", data);
        this.loading = false;
        this._snackbar.open('Education detail added!', 'ok', {
          duration: 3000
        });
        this.dialogRef.close();
      }, (error: any) => {
        console.log("Error updating", error);
        this.loading = false;
        this._snackbar.open(error.message, 'ok', {
          duration: 3000
        });
      })
    }
  }
}
