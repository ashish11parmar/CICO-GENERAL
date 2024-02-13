import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-reminder-confirm-modal',
  templateUrl: './reminder-confirm-modal.component.html',
  styleUrls: ['./reminder-confirm-modal.component.scss']
})
export class ReminderConfirmModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ReminderConfirmModalComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    console.log("data ::: ", this.data);
  }

  confirmReminder(value: boolean) {
    console.log("VALUE", value);
    this.dialogRef.close(value)
  }
}
