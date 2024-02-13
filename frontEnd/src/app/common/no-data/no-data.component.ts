import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss']
})
export class NoDataComponent implements OnInit {
  @Input() msg: any;


  constructor() {
    console.log("Inside no data component")
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("CHANGES TO BE OCCURED", changes)

  }

}
