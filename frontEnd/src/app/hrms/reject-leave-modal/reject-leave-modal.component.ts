import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-leave-modal',
  templateUrl: './reject-leave-modal.component.html',
  styleUrls: ['./reject-leave-modal.component.scss']
})
export class RejectLeaveModalComponent implements OnInit {
  comment: any;

  constructor(
    public dialogRef: MatDialogRef<RejectLeaveModalComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

  confirmjob(value: any) {
    console.log("VALUE", value);
    this.dialogRef.close(value)
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.comment);
  }

}
