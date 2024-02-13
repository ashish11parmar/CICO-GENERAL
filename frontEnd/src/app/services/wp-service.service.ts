import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { config } from '../config';
import * as moment from 'moment';
import { IndexedDbService } from './indexed-db.service';


@Injectable({
  providedIn: 'root'
})
export class WpServiceService {
  previousUrlSubject = new EventEmitter<any>();
  private loggedInUser = new Subject<any>();
  id: any = localStorage.getItem('id');
  updateLogs: any
  updatePassword: any
  public regularizeCount = new Subject<number>();

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private _indexedDbService: IndexedDbService

  ) { }

  getRegularizeCount(): Observable<any> {
    return this.regularizeCount.asObservable();
  }

  setRegularizeCount(count: number) {
    this.regularizeCount.next(count);
  }

  getRegularizeData(startdate: any, enddate: any, payload: any, status: any = null) {
    //  const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    let URL = status
      ? `?regularization-status=${status}&per_page=${payload.pageSize}&status=private&after=${startdate}&before=${enddate}&page=${payload.pageIndex + 1}`
      : `?&per_page=${payload.pageSize}&status=private&after=${startdate}&before=${enddate}&page=${payload.pageIndex + 1}`
    return this.http.get(`${config.Regularizations}${URL}`, { observe: 'response' },);

  }

  getLoggedInUser(): Observable<any> {
    return this.loggedInUser.asObservable();
  }

  /**
   * @param userDetails inorder to store updated user as Subject.
   */
  seLoggedInUser(userDetails: any) {
    console.log("user_nicename : ", userDetails);
    this.loggedInUser.next({ currentUser: userDetails.user_nicename })
  }

  /** @note it is used to login in wordpress */
  wpLogin(email: string, password: string): Observable<any> {
    // const headers = new HttpHeaders().set('Content-Type', 'text/plain;');
    console.log("config.authUrl:::", config.authUrl);
    return this.http.post(
      `${config.authUrl}?username=${email}&password=${password}`,
      {},
      { responseType: 'text' }
    )
  }

  createCompany(user: any) {
    // console.log("user is user", user);
    // let authorizationData = 'Basic ' + btoa("rao-developer" + ':' + 'czIpAL6Ax2t7lvYYq2eubMks');
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': authorizationData
    // })
    let payload = {
      "username": user.email,
      "first_name": user.firstName,
      "last_name": user.lastName,
      "email": user.email,
      "password": user.password,
      "roles": user.roles,
      "meta": {
        "company_name": user.companyname,
        "phone_number": user.phoneNumber
      }
    }
    return this.http.post(`${config.createCompany}`, payload);
  }

  verifyCompany(email: string, code: number) {
    return this.http.get(`${config.verifyCompany}verify?email=${email}&code=${code}`)
  }

  sendActivationCode(user: any) {
    // let authorizationData = 'Basic ' + btoa("rao-developer" + ':' + 'czIpAL6Ax2t7lvYYq2eubMks');
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': authorizationData
    // })
    // var formData: FormData = new FormData();
    // formData.append("email", user["user_email"]);
    // console.log("THIS IS MY RESEND CODE WITH RESEND API", config.sendCode, user["user_email"]);
    // return this.http.post(`${config.sendCode}`,{ email: user.email }, { headers })


    return this.http.post(`${config.sendCode}`, { email: user.email })
    // return this.http.post(`${config.sendCode}`,{ email: user.email }, {headers})

  }

  // getCompany(user: any){
  //   let authorizationData = 'Basic ' + btoa("rao-developer" + ':' + 'czIpAL6Ax2t7lvYYq2eubMks');
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': authorizationData
  //   })
  //   return this.http.get(`${config.getCompany}`, { headers })

  // }

  getCompany() {
    return this.http.get(`${config.getCompany}`);
  }




  /** @note used to logout from wordpress */
  signOut(): Observable<any> {
    return new Observable<any>((observer) => {
      let message: string
      message = 'success'
      console.log("signed out")
      this.loggedInUser.next(null)
      localStorage.clear();
      observer.next(message);
    })
  }

  /** @note add new user to wordpress */
  addNewUserToWp(user: any) {
    var formData: FormData = new FormData();
    formData.append("first_name", user["first_name"]);
    formData.append("last_name", user["last_name"]);
    formData.append("employee_id", user["employee_id"]);
    formData.append("email", user["user_email"]);
    formData.append("middle_name", user["middle_name"]);
    formData.append("type", user["type"]);
    formData.append("status", user["status"]);
    formData.append("hiring_date", user["hiring_date"]);
    formData.append("user_pass", user["user_pass"]);
    formData.append("designation", user["role"]);
    formData.append("gender", user["gender"]);
    formData.append("reporting_to", user["reporting_to"]);
    /*** @note append department here in the when the new user is created this department filed is not  */
    formData.append("department", user["department"]);
    console.log('formdarea', user["user_email"], user["department"])
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees`, formData);
  }

  /** @note get all leaves from wordpress */
  employeeLeaves(): Observable<any> {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token'),
    // });
    return this.http.get(
      `${config.cicohrms}leaves?status=&page=1&per_page=100&type=&orderby&order&start_date&end_date&department_id&designation_id&f_year&year`, { observe: 'response' });
  }

  employeeLeaves1(start_date?: any, end_date?: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    let url = `${config.cicohrms}leaves?status=&type=&orderby&order&department_id&designation_id&f_year&year`;
    if (start_date && end_date) url += `&start_date=${start_date}&end_date=${end_date}`;
    return this.http.get(url, { responseType: 'text', observe: "response" }
    )
  }

  getGenderRatio() {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    let url = `${config.cicohrms}employees/gender-ratio`;
    return this.http.get(url);
  }

  /** @note update leave status as approved or rejected */
  updateLeave(event: number, comment: any, id: number) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(
      `${config.cicohrms}leaves/${id}?status=${event}&comment=${comment}`,
      {},
      { responseType: 'text' }
    )
  }

  /** @note get employee list from wordpress */
  getEmployeeList() {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}employees?per_page=100&page=1&status&department&designation&location=-1&type&s=`);
  }

  /** @note get single user leave */
  singleUserLeave(id: number) {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(
      `${config.cicohrms}leaves?status=&page=1&per_page=100&type=&orderby&order&start_date&end_date&department_id&designation_id&f_year&year&employee_id=${id}`,
      { responseType: 'text' }
    )
  }

  /** @note get user leave balance */
  getLeaveBalance(id: any) {
    return this.http.get(`${config.cicohrms}leaves/report/${id}`);
  }

  /**@note update the user personal information  */
  updatePersonalInfo() {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain;',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    // return this.http.post(`${url}`)
  }

  /** @note update employee data from wordpress */
  updateEmployeeData(user: any, id: any): Promise<any> {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    const promise = new Promise<void>(async (resolve, reject) => {
      await this.http.post(
        this.updateLogs = `${config.hrms}employees/${id}?first_name=${user.first_name}&last_name=${user.last_name}&middle_name=${user.middle_name}&hiring_date=${user.hiring_date}&employee_id=${user.employee_id}&type=${user.type}&status=${user.status}&designation=${user.role}&reporting_to=${user.reporting_to}&gender=${user.gender}&photo_id=${user.photo_id ? user.photo_id : ''}`,
        {}
      ).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    })
    return promise;
  }

  /** @note generate user payroll */
  generatePayroll(data: any, blob: any) {
    const id = localStorage.getItem('singleUserId')
    let formData = new FormData();
    formData.append('month', data.month);
    formData.append('year', data.year);
    formData.append('action', data.action);
    formData.append('payroll-data', blob);
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(
      `${config.cicohrms}employees/process-payroll/${id}`,
      formData
    )
  }

  /** @note get employee type from wordpress */
  employeeWorkType() {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(
      `${config.hrms}company/employee-types?per_page=100&page=1`,
      { responseType: 'text' }

    )
    // return this.http.get(
    //   `${config.hrms}company/employee-types?per_page=100&page=1`,
    //   { headers}
    // )
  }

  /** @note get employee status from wordpress */
  employeeStatus() {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(
      `${config.hrms}company/employee-statuses?per_page=100&page=1`,
      { responseType: 'text' }
    )
  }

  /** @note get employee status from wordpress */
  employeeDesignation() {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}designations?per_page=100&page=1`);
  }

  /** @note update employee password from wordpress */
  updateEmployeePassword(user: any, id: any) {
    console.log('user ', user, id)
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    const promise = new Promise<void>(async (resolve, reject) => {
      await this.http.post(
        this.updateLogs = `${config.updatePswd}employee/${id}/update-password?user_pass=${user.user_pass}`,
        {},
        { headers }
      ).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    })
    return promise;
  }

  deleteEmployee(empId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.delete(`${config.hrms}employees/${empId}`);
  }

  getEmployee(empId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}employees/${empId}`);
  }

  /** @note get holiday list*/
  getHolidays() {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(
      `${config.hrms}leaves/holidays`,
      { responseType: 'text' }
    )
  }
  /** @note add new holiday to wordpress */
  addNewHolidayToWp(user: any) {
    var formData: FormData = new FormData();
    formData.append("name", user["name"]);
    formData.append("description", user["description"]);
    formData.append("start_date", user["start_date"]);
    formData.append("end_date", user["end_date"]);
    // console.log('user',user)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(
      `${config.hrms}leaves/holidays`,
      formData
    )
  }

  /** @note remove  holiday */

  removeHoliday(id: any) {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    this._snackBar.open('Holiday deleted successfully', 'ok', {
      duration: 3000
    });
    return this.http.delete(
      `${config.hrms}leaves/holidays/${id}`,
      { responseType: 'text' }
    )
  }

  /** @note update holiday data from wordpress */
  updateHolidayData(user: any, holidaId: any): Promise<any> {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    const promise = new Promise<void>(async (resolve, reject) => {
      await this.http.post(
        this.updateLogs = `${config.hrms}leaves/holidays/${holidaId}?&name=${user.name}&start_date=${user.start_date}&end_date=${user.end_date}&description=${user.description}`,
        {},
        { responseType: 'text' }
      ).subscribe({
        next: (res: any) => {

          resolve(res);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    })
    return promise;
  }

  getLeaveRequest() {
    let url = `${config.RequesteLeave}`;
    // if (page) url += `&page=${page}&per_page=10`;
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    return this.http.get(url, { responseType: 'text', headers });
  }
  getPendingcount(count: any) {
    this.previousUrlSubject.emit(count);
  }

  leavePolicy(uid: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}employees/${uid}/policies`);
  }

  ApplyLeave(uid: any, policy_id: any, start_date: any, end_date: any, reason: any, leave_type: any, attachment: any) {
    console.log(uid + "uid")
    console.log(moment(start_date, 'DD/MM/YYYY').format('YYYY-MM-DD') + "format")
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    // const headers = new HttpHeaders({
    //   'skip': 'true'
    // });
    var formData: FormData = new FormData();
    formData.append("policy_id", policy_id);
    formData.append("start_date", start_date);
    formData.append("end_date", end_date);
    formData.append("reason", reason);
    console.log(attachment + "attach")
    // formData.append("leave_type", user.fromDay);
    formData.append("leave_type", leave_type);
    if (attachment) {
      formData.append("leave_attachments", attachment);
    }
    // return this.http.post(
    //   `${config.cicohrms}employees/${uid}/leaves`,
    //   formData,
    //   { headers }
    // )
    return this.http.post(`${config.cicohrms}employees/${uid}/leaves`, formData)
  }

  getStatusList() {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'text/plain;',
    //   'Authorization': 'Bearer' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.regularizationsStatus}regularization-status`);
  }

  /**
  *
  * @param data
  * Upload attachment in wordpress
  * @returns attachment id
  */
  uploadImage(data: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    // return this.http.post(config.uploadMediaUrl, data, { headers }).pipe(map((response) => response));
    return this.http.post(config.uploadMediaUrl, data).pipe(map((response) => response));
  }

  /** @note get Photo URL for particular user. */
  getMedia(photoId: string) {
    return this.http.get(`${config.uploadMediaUrl}/${photoId}`);
  }

  getEmployeeTypeCount() {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.cicohrms}employees/count`);
  }

  getlocations() {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.cicohrms}analytics/locations`);
  }


  updateRegularizeStatus(obj: any) {
    console.log("THIS IS THE OBJ TO UPDATE", obj)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.Regularizations}/${obj.logId}`, obj);
  }

  getDepartments() {
    console.log("THIS IS THE OBJ TO UPDATE", config.department)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.department}`);
  }

  /**
   * @param userId Employee user-id
   * @param userDetail tobe update in the HRMS.
   * @returns
   */
  updateUserProfile(userId: string, userDetails: any) {
    console.log("updateUserProfile::", userDetails, userId);
    var formdata = new FormData();

    formdata.append("first_name", userDetails.first_name)
    formdata.append("middle_name", userDetails.middle_name)
    formdata.append("last_name", userDetails.last_name)
    formdata.append("employee_id", userDetails.employee_id)
    formdata.append("email", userDetails.email)
    formdata.append("department", userDetails.department);
    formdata.append("designation", userDetails.designation);
    formdata.append("hiring_source", userDetails.hiring_source);
    formdata.append("status", userDetails.status);
    formdata.append("reporting_to", userDetails.reporting_to);
    formdata.append("hiring_date", moment(userDetails.hiring_date).format("YYYY-MM-DD"));
    formdata.append("work_phone", userDetails.work_phone);
    formdata.append("mobile", userDetails.mobile);
    formdata.append("type", userDetails.type);
    formdata.append("blood_group", userDetails.blood_group)
    formdata.append("gender", userDetails.gender);
    formdata.append("date_of_birth", userDetails.date_of_birth ? moment(userDetails.date_of_birth).format("YYYY-MM-DD") : '');
    formdata.append("marital_status", userDetails.marital_status);
    formdata.append("address", userDetails.address);
    formdata.append("street_1", userDetails.street_1);
    formdata.append("city", userDetails.city);
    formdata.append("state", userDetails.state);
    formdata.append("country", userDetails.country);
    formdata.append("postal_code", userDetails.postal_code);
    formdata.append("nationality", userDetails.nationality);
    formdata.append("hobbies", userDetails.hobbies);
    formdata.append("other_email", userDetails.other_email);
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees/${userId}`, formdata);
  }
  
  /**@note update personal information value father_name, mother_name, spouse_name, pincode  */
  updateUserProfileValue(userId: string, userDetails: any) {
    console.log("userdetails updated", userDetails);
    let payload = { /**@note You can add also lat and long in this meta for employee location.. */
      'meta': {
        "spouse_name": userDetails.spouse_name,
        "father_name": userDetails.father_name,
        "mother_name": userDetails.mother_name,
        "zipcode": userDetails.postal_code
      }
    }
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.updateUser}users/${userId}`, payload);
  }

  /**@note update the workexprience details. */
  updateWorkExperience(userId: string, userDetails: any) {
    var formdata = new FormData();
    formdata.append("company_name", userDetails.company_name)
    formdata.append("job_title", userDetails.job_title)
    formdata.append("from", moment(userDetails.from).format('MM/DD/YYYY'));
    formdata.append("to", moment(userDetails.to).format('MM/DD/YYYY'))
    formdata.append("description", userDetails.description)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees/${userId}/experiences`, formdata);
  }

  /**@note update the education details. */
  updateEducationInfo(userId: any, userdetails: any) {
    var formdata = new FormData();
    formdata.append("school", userdetails.school)
    formdata.append("degree", userdetails.degree)
    formdata.append("finished", moment(userdetails.finished).format("YYYY-MM-DD"))
    formdata.append("result_type", userdetails.resulttype)
    formdata.append("result", userdetails.result)
    formdata.append("field", userdetails.field)
    formdata.append("interest", userdetails.interest)
    formdata.append("notes", userdetails.notes)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees/${userId}/educations`, formdata);
  }

  /** @note edit the work exp information. */
  editWorkExp(userId: any, workExpId: any, userDetails: any) {
    var formdata = new FormData();
    formdata.append("company_name", userDetails.company_name)
    formdata.append("job_title", userDetails.job_title)
    formdata.append("from", moment(userDetails.from).format('YYYY-MM-DD'))
    formdata.append("to", moment(userDetails.to).format('YYYY-MM-DD'))
    formdata.append("description", userDetails.description)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees/${userId}/experiences/${workExpId}`, formdata);
  }

  /** @note edit the Education information. */
  editEducationExp(userId: any, educationId: any, userdetails: any) {
    var formdata = new FormData();
    formdata.append("school", userdetails.school)
    formdata.append("degree", userdetails.degree)
    formdata.append("finished", moment(userdetails.finished).format("YYYY-MM-DD"))
    formdata.append("result_type", userdetails.resulttype)
    formdata.append("result", userdetails.result)
    formdata.append("field", userdetails.field)
    formdata.append("interest", userdetails.interest)
    formdata.append("notes", userdetails.notes)
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.post(`${config.hrms}employees/${userId}/educations/${educationId}`, formdata);
  }
  /** @note get Updated workexp data from WP */
  getUpdatedWrokExp(userId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}employees/${userId}/experiences`);
  }
  /** @note get Updated Education data from WP */
  getUpdatedEducation(userId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.get(`${config.hrms}employees/${userId}/educations`);
  }

  /** @note delete Updated workExp data from WP */
  deleteWorkExp(userId: any, workId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.delete(`${config.hrms}employees/${userId}/experiences/${workId}`);
  }
  /** @note delete Updated Education data from WP */
  deleteEduInfo(userId: any, eduId: any) {
    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + localStorage.getItem('token')
    // });
    return this.http.delete(`${config.hrms}employees/${userId}/educations/${eduId}`);
  }


  // /*********************** || GENERAL VERSIONS API START HERE || ***********************/

  /**
   * @Note Get all attendance from wp company wise.
   * @param status 
   * @param date 
   * @param payload 
   * @returns 
   */
  getAttendanceList(status: any, date: any, payload: any) {
    return this.http.get(`${config.attendance}?status=${status}&per_page=${payload.pageSize}&page=${payload.pageIndex + 1}&date=${date}`, { observe: 'response' });
  }

  /**
   * @Note Get all user company wise from WP.
   */
  getEmployeeCompanyWise() {
    return this.http.get(`${config.employeeList}users?per_page=100&page=1`);
  }

  getSingleUserList(userID: any, dateRange: any) {
    return this.http.get(`${config.attendance}/${userID}?from=${dateRange.startDate}&to=${dateRange.endDate}`);
  }

}

