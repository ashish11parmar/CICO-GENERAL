import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoDataComponent } from '../common/no-data/no-data.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { LoginComponent } from '../login/login.component';
import { UserListComponent } from './user-list/user-list.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { UserProfileUpdateComponent } from './user-profile-update/user-profile-update.component';


const routes: Routes = [
  {
    path: 'list',
    component: UserListComponent
  },
  {
    path: 'view/:id',
    component: SingleUserComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
