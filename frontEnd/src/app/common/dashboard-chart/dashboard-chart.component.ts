import { Component, OnInit, Input, SimpleChange, ElementRef, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';
import { BubbleDataPoint, Chart, ChartDataset, ChartTypeRegistry, Point } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss']
})
export class DashboardChartComponent implements OnInit {
  @ViewChild('chartDisplayId', { read: ElementRef }) public chartDisplayId: ElementRef;
  @Input('chartDetails') chartDetails: any;
  @Input('chartHeight') chartHeight: any;
  allChartObj: any;
  dynamicHeight: any

  constructor(public _cd: ChangeDetectorRef, private el: ElementRef) { }

  ngOnInit(): void { }

  ngOnChanges(simpleChange: SimpleChanges) {

    console.log("simplechange: ", simpleChange);
    if (this.allChartObj) {
      this.allChartObj.destroy();
    }
    if (simpleChange['chartDetails'] && simpleChange['chartDetails']['currentValue']) {
      this.renderChart();
    }


    if (simpleChange['chartHeight'] && simpleChange['chartHeight']['currentValue']) {
      this.dynamicHeight = this.chartHeight;
      // this._cd.detectChanges();
    } else {
      const canvas: HTMLCanvasElement = this.el.nativeElement.querySelector('#chartDisplayId');
      // canvas.height = 500;
      // canvas.height = window.innerHeight;

    }

  }

  renderChart() {   /** @note This function will generate dataset according to Chart type */
    this.allChartObj = new Chart(this.chartDisplayId.nativeElement, {
      type: this.chartDetails.chartName,
      data: {
        labels: this.chartDetails.labels,
        datasets: this.chartDetails.dataSet,
      },
      options: this.chartDetails.options
    });
  }
}
