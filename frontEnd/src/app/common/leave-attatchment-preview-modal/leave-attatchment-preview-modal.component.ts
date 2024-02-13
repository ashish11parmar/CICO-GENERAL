import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogOverviewExampleDialog} from '../log/log.component';

@Component({
  selector: 'app-leave-attatchment-preview-modal',
  templateUrl: './leave-attatchment-preview-modal.component.html',
  styleUrls: ['./leave-attatchment-preview-modal.component.scss']
})
export class LeaveAttatchmentPreviewModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    console.log("CHECKING attatchment data : ", this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
