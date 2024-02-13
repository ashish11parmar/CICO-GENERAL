import { Component, Inject, Input, OnInit, Output, EventEmitter, SimpleChange, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { userRoles } from '../../model/data-model.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import swal from 'sweetalert2';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit {
  // <{ email: FormControl, userName: FormControl, password: FormControl, role: FormControl }>
  @Input('roleList') roleList: any;
  @Input('reportingManagerList') reportingManagerList: any;
  @Input('data') data: any;
  @Output() user = new EventEmitter<any>();
  @ViewChild('fileInput') fileInput: any;
  public newUser: FormGroup;
  public firebaseUser: FormGroup;
  isLoading = false;
  modelTitle: string;
  isDisabled: boolean = false;
  hide: boolean = true;
  editUser: boolean = false;
  worktypeType: any
  workingType: any
  status: any;
  empStatus: any;
  isUpdatePswd: boolean = false;
  userProfile: any;
  userProfileFile: any;
  dateValid = false;
  department: any;
  constructor(
    private _userService: UserService,
    private afAuth: AngularFireAuth,
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this._wpService.employeeWorkType().subscribe((res) => {
      this.worktypeType = JSON.parse(res)
      this.workingType = Object.entries(this.worktypeType).map(([type, value]) => ({ type, value }));
      console.log('this.workingType ', this.workingType, res)
    })
    this._wpService.employeeStatus().subscribe((res) => {
      this.status = JSON.parse(res)
      this.empStatus = Object.entries(this.status).map(([type, value]) => ({ type, value }));
    })
    this._wpService.getDepartments().subscribe((res: any) => {
      this.department = res;
    })
  }

  ngOnInit(): void {
    // console.log('DATASSSSSSSSSS', this.data);
    if (!this.data) {
      this.createForm();
      this.modelTitle = 'Add User';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('this.data ', changes);
    console.log("THIS IS THE DATA::::", this.data);

    if (changes['data'] && changes['data'].currentValue) {
      this.data = changes['data'].currentValue;
      let filteredData = this.reportingManagerList.filter((reporter: any) => reporter.user_id !== this.data.user_id);
      this.reportingManagerList = filteredData;
      if (this.data) {
        this.createForm(this.data);
        this.modelTitle = 'Update User';
        this.editUser = true;
      } else {
        this.createForm();
        this.modelTitle = 'Add User';
      }
    }
  }

  //creating form group
  createForm(data?: any) {
    console.log('VALUE OF USER', data);
    this.userProfile = "";
    if (data && data.photo_id && data.photo_id > 0) {
      this._wpService.getMedia(data.photo_id).subscribe(((data: any) => {
        console.log("CHECKING media : ", data);
        this.userProfile = data.source_url;
      }));
    }

    this.newUser = new FormGroup({
      first_name: new FormControl(
        data && data.first_name ? data.first_name : '',
        Validators.required
      ),
      last_name: new FormControl(
        data && data.last_name ? data.last_name : '',
        Validators.required
      ),
      employee_id: new FormControl(
        data && data.employee_id ? data.employee_id : '',
        Validators.required
      ),
      user_email: new FormControl({ value: data && data.user_email ? data.user_email : '', disabled: data && data.user_email ? true : false }, [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      middle_name: new FormControl(
        data && data.middle_name ? data.middle_name : '',
        Validators.required
      ),
      gender: new FormControl(
        data && data.gender ? data.gender : '',
        Validators.required
      ),
      type: new FormControl(
        data && data.type ? data.type : '',
        Validators.required
      ),
      status: new FormControl(
        data && data.status ? data.status : '',
        Validators.required,
      ),
      hiring_date: new FormControl(
        data && data.hiring_date ? data.hiring_date : '',
        Validators.required
      ),
      // userName: new FormControl((data && data.userName) ? data.userName : '', Validators.required),
      user_pass: new FormControl(data && data.user_pass ? data.user_pass : '', [
        Validators.pattern("[a-z0-9A-Z._%+-=#$@!~*^&'']{6,}$"),
      ]),
      role: new FormControl((data && data.designation) ? data.designation : null),
      reporting_to: new FormControl(data && data.reporting_to ? data.reporting_to.toString() : ''), /** @note set reporting-to if Admin updates particular user. */
      // status: new FormControl(false), //
      department: new FormControl(data && data.department ? data.department : ''),
      isBreak: new FormControl(false),

    });
    console.log("this is my data>>>",this.newUser.value);
  }


  validateLogs(event: any) {
    let regex = new RegExp(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/g)
    let matches = regex.test(event.target.value);
    console.log("validate", event.target.value);
    console.log("validate", matches);
    if (matches) {
      this.dateValid = false;
    } else {
      this.dateValid = true;
    }
  }

  updateNew() {
    this.isUpdatePswd = true;
    this.newUser.get('user_pass')?.addValidators([Validators.required]);
    this.newUser.get('user_pass')?.updateValueAndValidity();
  }

  /** @note Upload media to Wordpress. */
  uploadMedia() {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append("file", this.userProfileFile);
      this._wpService.uploadImage(formData).subscribe((mediaResponse: any) => {
        resolve(mediaResponse.id);
      }, (err) => {
        reject(err);
      })
    });
  }

  async addUser() {
    this.isLoading = true;
    try {
      /** @note Upload User profile. */
      if (this.userProfileFile) {
        let mediaId = await this.uploadMedia();
        this.newUser.value['photo_id'] = mediaId;
      }
      if (this.data) {
        /** @note update employee data in wordpress */
        this._wpService.updateEmployeeData(this.newUser.value, this.data.user_id).then((res) => {
          if (this.isUpdatePswd) {
            this._wpService.updateEmployeePassword(this.newUser.value, this.data.user_id)
              .then((res) => {
                this.isLoading = false;
                this.user.emit(this.newUser.value);
                this._snackBar.open('User detail updated successfully.', 'ok', { duration: 3000 });
              }).catch((err) => {
                this.isLoading = false;
                console.log('update password error ', err)
                this._snackBar.open('Something went wrong', 'ok', { duration: 3000 });
              })
          } else {
            console.log('result after edit ', res)
            this.isLoading = false;
            this.user.emit(this.newUser.value);
            this._snackBar.open('User detail updated successfully.', 'ok', { duration: 3000 });
          }
        })
      } else {
        console.log("this.newUser.value : ", this.newUser.value);
        this._wpService.addNewUserToWp(this.newUser.value).subscribe((res) => {
          console.log("this is response", res);
          this.isLoading = false;
          this.user.emit(this.newUser.value);
          this._snackBar.open('New employee added successfully.', 'ok', { duration: 3000 });
        }, (err: any) => {
          console.log('error is', err.error.message)
          this.isLoading = false;
          if (err.error.message) {
            this._snackBar.open(err.error.message, 'ok', { duration: 3000 });
          } else {
            this._snackBar.open('Something went wrong!', 'ok', { duration: 3000 });
          }
        });
      }
    } catch (error) {
      this.isLoading = false;
      this._snackBar.open('Something went wrong', 'ok', { duration: 3000 });
    }
  }

  passwordVisibility() {
    this.hide = !this.hide;
  }

  resetPassword() {
    swal.fire('Please check your email to reset the password!');
    this.isDisabled = true;
    console.log('this.data', this.data.email);
    this.afAuth.sendPasswordResetEmail(this.data.email).then(
      () => {
        console.log('email sent');
        // success, show some message
      },
      (err) => {
        console.log('error in sending mail', err);
        // handle errors
      }
    );
  }

  handleFileInput(event: any) {
    const files: FileList = event.target.files;
    console.log("handleFileInput called : ", files)
    if (files && files.length > 0) {
      const selectedFile: File = files[0];
      console.log("selectedFile called : ", selectedFile);
      // Display the selected image in the image view
      this.displayImage(selectedFile);
      // You can perform further actions with the selected file, such as uploading it to a server
    }
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  displayImage(file: File) {
    const reader = this.getFileReader();
    reader.onload = () => {
      this.userProfile = reader.result;
      this._changeDetectionRef.detectChanges();
    };
    reader.readAsDataURL(file);
    this.userProfileFile = file;
  }

  uploadProfilePic() {
    this.fileInput.nativeElement.click();
  }
}
