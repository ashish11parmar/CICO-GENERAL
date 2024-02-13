import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { WpServiceService } from '../services/wp-service.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../common/forgot-password-dialog/forgot-password-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isClicked: boolean = false;
  @ViewChild('signup') signup: MatDrawer;
  loginUser: FormGroup;
  hide: boolean = true
  // user_email: string;

  constructor(
    private router: Router,
    public _userService: UserService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _wpService: WpServiceService
  ) { }

  gotopage(): void {
    this.router.navigate([`dashboard`])
  }

  ngOnInit(): void {
    this.createForm();
  }

  signUp() { /**@note open signup drawer. */
    this.signup.open();
  }

  closeDrawer() {
    this.signup.close();
  }


  createForm() {
    this.loginUser = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }


  //  LOGIN FOR ADMIN USER
  submit() {
    if (this.loginUser.valid) {
      this._wpService.wpLogin(this.loginUser.value.email, this.loginUser.value.password).subscribe({
        next: (data: any) => {
          let userData = JSON.parse(data);
          console.log('data', userData.user_nicename, 'email', this.loginUser.value.email)
          this.isClicked = false;
          // this.user_email = this.loginUser.value.email
          if (userData != null) {
            localStorage.setItem('token', userData.token);
            this._wpService.getCompany().subscribe(
              (data: any) => {
                if (data.verified === '1' || data.verified === 1 || data.verified === true || data.verified === 'true') {
                  this.router.navigate(['dashboard']);
                  localStorage.setItem('currentUser', (userData.user_nicename));
                  localStorage.setItem('isLogin', 'true');
                  this._wpService.seLoggedInUser(userData);
                  this._userService.setLoggedInUser(userData.user_nicename)
                }
                else {
                  this.router.navigate(['/sign-up'], { queryParams: { page: 'isVerification', email:this.loginUser.value.email } });
                  this._snackBar.open("Your registered email has just received a verification code please use it for verification", 'ok', { duration: 3000 });
                  console.log("Company is not verified:::", data.verified);
                }
              }
            )
          }
        },
        error: (e) => {
          this.isClicked = false;
          this._snackBar.open('Please enter correct credentials.', 'ok', {
            duration: 3000
          });
          console.error('error', e)
        }
      })
    }

  }
  forgotPassword() {
    this.dialog.open(ForgotPasswordDialogComponent, {
      data: {
        headerTitle: 'Forgot Password',
        headerIcon: 'lock_open',
        regularizeContetnt: 'Are you sure you want to reject timelogs?'
      }
    }).afterClosed().subscribe((result: any) => {
      console.log("THIS IS THE RESULT AFTER UPDATE", result)
      if (result) {
      }
    })
  }

  passwordVisibility() {
    this.hide = !this.hide
  }

}
