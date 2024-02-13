import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WpServiceService } from '../services/wp-service.service';
import { single } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  @ViewChild('code1') code1!: ElementRef;
  @ViewChild('code2') code2!: ElementRef;
  @ViewChild('code3') code3!: ElementRef;
  @ViewChild('code4') code4!: ElementRef;

  signupUser: FormGroup
  otpVerification: FormGroup
  password: boolean = true;
  cpassword: boolean = true;
  isClicked: boolean = false;
  loading: boolean = false;
  noMatch: boolean = true;
  btnText: string = 'Signup';
  isVerification: boolean = false;
  otp: number;
  userEmail: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar,
    private _userService: UserService

  ) {
    this.route.queryParams.subscribe(params => {
      this.isVerification = params['page'];
      this.userEmail = params['email'];
    });
    if (this.userEmail) { this._wpService.sendActivationCode({ email: this.userEmail }).subscribe(); }
  }

  ngOnInit(): void {
    this.createForm();
    this.createOtpForm();
  }

  /** UTILITY START */

  passwordVisibility() {
    this.password = !this.password
  }
  cpasswordVisibility() {
    this.cpassword = !this.cpassword
  }
  createForm() {
    this.signupUser = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      companyname: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      password: new FormControl('', Validators.required),
      cpassword: new FormControl('', Validators.required),
      roles: new FormControl('company', Validators.required)

    })
  }

  createOtpForm() {
    this.otpVerification = new FormGroup({
      code1: new FormControl('', Validators.required),
      code2: new FormControl('', Validators.required),
      code3: new FormControl('', Validators.required),
      code4: new FormControl('', Validators.required),
    });
  }

  numberOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  handleInput(event: any, previousInput: any, currentInput: any, nextInput: any): void { /**@note this function get event value from input box */
    const value = event.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    currentInput.value = value;
    if (value !== numericValue) {
      event.target.value = numericValue;
    }
    let length = currentInput.value.length;
    let maxlength = currentInput.getAttribute('maxlength')
    if (length == maxlength) { if (nextInput != "") { nextInput.focus() } }
    if (event.inputType === 'deleteContentBackward') { if (previousInput != "") { previousInput.focus() } }
  }



  handlePaste(event: ClipboardEvent): void { /**@note this function will paste copied otp from clipboard. */
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    if (pastedText && pastedText.length >= 4) {
      this.otpVerification.patchValue({
        code1: pastedText[0] ? pastedText[0] : null,
        code2: pastedText[1] ? pastedText[1] : null,
        code3: pastedText[2] ? pastedText[2] : null,
        code4: pastedText[3] ? pastedText[3] : null,
      });
    }
  }

  /** UTILITY END */


  /** API CALL START */

  submit() {
    this.loading = true;
    if (this.signupUser.value.password === this.signupUser.value.cpassword) {
      this.noMatch = false
      this.btnText = 'Signing...';
      console.log("password match");
      this._wpService.createCompany(this.signupUser.value).subscribe(
        (data: any) => {
          this.loading = false;
          this.isVerification = true;
          this.router.navigate(['/sign-up'], { queryParams: { page: 'isVerification', email: this.signupUser.value.email } });
          console.log("company created", data);
          this._userService.success('Your registered email has just received a verification code please use it for verification.', 'ok', 5000);
        },
        (err: any) => {
          console.log('error is', err.error.message)
          if (err.error.message) {
            this.loading = false;
            this.isVerification = false;
            this._userService.error(err.error.message, 'ok', 3000);
          }
          else {
            this._userService.somethingWent('Something went wrong!', 'ok',  3000);
          }
        }
      )
    } else {
      console.log("password not match", this.noMatch);
      this.noMatch = false;
      // this.noMatch = true;
    }

  }

  verifyCode() {
    let otp =
      this.otpVerification.controls['code1'].value +
      this.otpVerification.controls['code2'].value +
      this.otpVerification.controls['code3'].value +
      this.otpVerification.controls['code4'].value;
    console.log("otp verification:", otp);

    console.log("THIS IS VERFING CODE", this.router.url);
    this._wpService.verifyCompany(this.userEmail, otp).subscribe(
      (code: any) => {
        console.log("verification code", code);
        if (code === true) {
          this._userService.success('Verification successful your provided code is a perfect match', 'ok',  3000);
          this.router.navigate(['/login']);
        } else {
          console.log("Verification failed");
        }
      },
      (err: any) => {
        console.log('error is', err.error.message)
        if (err.error.message) {
          this.router.navigate(['/sign-up'], { queryParams: { page: 'isVerification', email: this.userEmail }  });
          this._userService.error(err.error.message , 'ok', 3000);
        }
        else {
          this._userService.somethingWent('Something went wrong!', 'ok', 3000);
        }
      }
    );
  }


  sendCode() {
    this.otpVerification.reset();
    this._wpService.sendActivationCode({ email: this.userEmail }).subscribe(
      (reSend: any) => {
        console.log("THIS IS RESEND CODE", reSend)
        if(reSend === true){
        this._userService.success('Your email has just received a resend code please use it for verification', 'ok',  3000);
        }
        else{
          console.log("THIS IS RESEND CODE IS INVALID");
        }
      },
      (err: any) => {
        console.log('error was happy:::', err.error.message)
        if (err.error.message) {
          this.router.navigate(['/sign-up'], { queryParams: { page: 'isVerification' } });
          this._userService.error(err.error.message, 'ok', 3000);
        }
        else {
          this._userService.somethingWent('Something went wrong!', 'ok', 3000);
        }
      }
    )
  }
}


/** API CALL END */
