import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from '../../common/delete-confirm-modal/delete-confirm-modal.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { UtilityService } from '../../services/utility.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogsService } from 'src/app/services/logs.service';
import { MatDrawer } from '@angular/material/sidenav';
import { IndexedDbService } from 'src/app/services/indexed-db.service';
import * as moment from 'moment';

import { config } from '../../config';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = [
    'sr no',
    'full_name',
    'designation',
    'user_email',
    'action',
  ];
  // users = new MatTableDataSource<any>([]);
  users: any = [];
  isLoading: boolean = false;
  filterString: any;
  singleUserId: any;
  updateData: any;
  roleSelect = '';
  roleList: any;
  userList: any = [];
  searchInput: any;
  isaddUser: boolean = false;
  isupdateUser: boolean = false;
  reportingManagerList: any = [];
  ishistoryUser: boolean = false;
  regulariseList: any[] = []; /** @note current months regularization-list of all users. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('drawer1') drawer: MatDrawer;

  selectedUser: any;
  regularizeCount: any;
  dateRange = {
    start: moment().startOf('month').format('YYYY-MM-DDT00:00:00'),
    end: moment().format('YYYY-MM-DDT23:59:00')
  }
  payload = {
    "pageSize": 100,
    "pageIndex": 0
  };

  // @note create a new variable.
  userIdData: any = [];
  userReportingTo: any = [];
  relationship: any = [];
  // reportingManager:any = [];

  constructor(
    private _userService: UserService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    public _utilityService: UtilityService,
    private router: Router,
    private afs: AngularFirestore,
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar,
    private _logsService: LogsService,

  ) {
    // this.users = new MatTableDataSource<any>([])
  }

  ngOnInit(): void {
    this.displayUsers();
    /**
    * @param startDate current months start date.
    * @param endDate current months current date.
    */
    this.getRegularizeCount(this.dateRange.start, this.dateRange.end, this.payload);
  }

  displayUsers(user?: any) {
    this.reportingManagerList = [];
    if (!user) this.isLoading = true;
    this._wpService.employeeDesignation().subscribe((res: any) => {
      console.log('rolelist ', res);
      this.roleList = [...res];
      // if (this.roleList && this.roleList.length) { this.reportingManagerList = this.roleList.filter((roles: any) => config.reportingManagerList.includes(roles.title)); }
      // console.log("CHECKING this.reportingManagerList : ", this.reportingManagerList);

      this.isLoading = true;
      this._wpService.getEmployeeCompanyWise().subscribe((res: any) => {
        this.isLoading = false;
        console.log("GETTING EMPPLOYEE::", res);
        if (!user) this.isLoading = false;
        let employeeList = res;
        this.users = [...employeeList];
        this.userList = [...employeeList];
        // @note changes of the reporting manager dynamically goes here.
        for (let i = 0; i < this.userList.length; i++) {
          let user = this.userList[i];
          let designation = this.roleList.filter((role: any) => role.id == user.designation && config.reportingManagerList.includes(role.title));
          //  @note if User designation is ['HR', 'Team Lead', 'Project Manager', 'SDE - 3', 'Solutions Architect', 'Sr. Web Designer'] then need to find reporting of list. 
          if (designation && designation.length) {
            this.reportingManagerList.push(this.userList[i]);
            /** @note below filtered User working for which user's reporting_to and user's user_id is same
             *  some time facing issue so added below code
             * :: x.user_id !== user.user_id :: used because a reporting manager is not reporting to itself so to remove that i added this */
            // let filterdUsers = this.userList.filter((x: any) => x.reporting_to == user.user_id);
            let filterdUsers = this.userList.filter((x: any) => x.reporting_to == user.user_id && x.user_id !== user.user_id);
            // console.log('filterdUsers==============', filterdUsers);
            console.log("filteredUsers::::", this.userList[i].full_name, "this is the filteredUser", filterdUsers);
            this.users[i]['reportingManagerOf'] = filterdUsers || []
          }
          else {
            // @note if User designation is not ['HR', 'Team Lead', 'Project Manager', 'SDE - 3', 'Solutions Architect', 'Sr. Web Designer'] then need to find reporting of list.
            let reportingManager = this.userList.find((x: any) => x.user_id == user.reporting_to);
            if (reportingManager !== undefined) this.users[i]['reportingManager'] = reportingManager.full_name;
          }
        }
      });
    });

    this._wpService.getEmployeeCompanyWise().subscribe((res: any) => {
      console.log("Employee::", res);

    })
  }

  getRole(roleId: any) {
    let des: any;
    if (this.roleList && this.roleList.length) {
      // this.roleList.map((des: any) => {
      //   if(des.id == roleId) return des.title;
      // });
      des = this.roleList.filter((des: any) => {
        return des.id == roleId;
      });
      return des && des.length ? des[0].title : '';
    }
  }


  addUser() {
    console.log("THIS IS THE ADD USER CALLED>>>>>>>>>");
    this.drawer.open();
    this.isaddUser = true;
  }

  onEditUser() {
    this.isupdateUser = true;
  }

  editUser(user: any) {
    console.log('EDIT USER DATA', user);
    let obj = {
      user: user,
      roleList: this.roleList,
      isEdit: true,
    };
    const dialogRef = this.dialog.open(AddUserComponent, { data: obj });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('editUser after close ', result);
    });
  }

  viewUser(user: any) {
    console.log('WHAT IS IN THE USERS', user, user.work_phone);
    this.isaddUser = false;
    this.ishistoryUser = false;
    this.drawer.open();
    this.selectedUser = user;
    let count = 0;
    for (let i = 0; i < this.regulariseList.length; i++) {
      /** @note User id and regularize author is is same them count will increase by 1 */
      if (user.user_id == this.regulariseList[i].author) {
        count++;
      }
    }

    /** @note in userdetail pass the count value. */
    this.selectedUser['regulariseCount'] = count;
  }

  closeDrawer() {
    this.selectedUser = undefined;
    this.isaddUser = false;
    this.isupdateUser = false;
    this.ishistoryUser = false;
    this.drawer.close();
  }

  adduser(user: any) {
    this.displayUsers(user);
    this.drawer.close();
    this.isaddUser = false;
  }

  deleteUser(users: any) {
    console.log("USer removed", users);
    this._utilityService.commonDialogBoxOpen(DeleteConfirmModalComponent).afterClosed().subscribe(confirm => {
      console.log("USER CONFIRM OR NOT", confirm);
      if (confirm == undefined) return
      else if (confirm == 'yes') {
        this._wpService.deleteEmployee(users.id).subscribe((res: any) => {
          console.log('delete employee ', res)
          this._logsService.removeLogsFromFirebase(users.user_id).then(res => {
            let index = this.userList.findIndex((user: any) => user.user_id === users.user_id);
            if (index != -1) {
              this.userList.splice(index, 1);
              // this.users.data = this.userList;
              this.users = this.userList;
            }
            this._snackBar.open('Employee removed successfully.', 'ok', { duration: 3000 });
            this.selectedUser = undefined;
            this.isaddUser = false;
            this.drawer.close();
          }).catch(err => {
            this._snackBar.open(err, 'ok', { duration: 3000 });
          })
        }, (err: any) => {
          console.log('errer ', err)
          this._snackBar.open('Something went wrong', 'ok', { duration: 3000 });
        })
      }
    })
  }



  /**
   * @param startDate current months start date.
   * @param endDate current months current date.
   */
  getRegularizeCount(startDate: any, endDate: any, payload: any) {
    this._wpService.getRegularizeData(startDate, endDate, payload).subscribe((data: any) => {
      this.regulariseList = data;
    });
  }


  restoreLogin(users: any) {
    const tutorialsRef = this.afs.collection('Users');
    const edit = tutorialsRef
      .doc(users.id)
      .update({ isAlreadyLoggedIn: false });
  }

  onChange(event?: any) {
    console.log('designation value ', this.roleSelect, this.users);
    let filteredUsers;
    if (this.roleSelect && this.searchInput) {
      filteredUsers = this.userList.filter((user: any) => {
        return (
          user.designation == this.roleSelect &&
          user.full_name
            .toLowerCase()
            .includes(this.searchInput.trim().toLowerCase())
        );
      });
    } else if (this.roleSelect && !this.searchInput) {
      filteredUsers = this.userList.filter((user: any) => {
        return user.designation == this.roleSelect;
      });
    } else if (!this.roleSelect && this.searchInput) {
      filteredUsers = this.userList.filter((user: any) => {
        return user.full_name
          .toLowerCase()
          .includes(this.searchInput.trim().toLowerCase());
      });
    } else {
      filteredUsers = this.userList;
    }
    this.users = filteredUsers;
  }
}
