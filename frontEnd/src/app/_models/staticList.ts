export const option = [/**@note this option is for dashboard chart.  */
    {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                display: false,
            },
            border: {
                display: false,
            },
            stacked: true,

        },
        y: {
            grid: {
                display: false,
            },
            ticks: {
                display: false,
            },
            border: {
                display: false,
            },
            stacked: true,
        },
    }
]


export const plugins = [ /**@note this plugin is for dashboard chart. */
    {
        legend: {
            display: false,
        },
        title: {
            display: false,
        }
    }
]

export function generateDataSet(chartData: any) {
    return [
        {
            label: '',
            data: chartData,
            backgroundColor: [
                'rgba(255, 255, 255, 0.3)',
            ],
            borderColor: [
                'rgba(255, 255, 255, 0.5)',
            ],
            borderWidth: 1,
            borderCapStyle: 'round',
            borderJoinStyle: 'round',
            fill: {
                target: 'origin',
            },
        },
    ];
}

export function locationChartDataSet(chartData: any) {
    return [
        {
            label: '',
            data: chartData,
            backgroundColor: [
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 255, 255, 0.6)',
                'rgba(255, 255, 255, 0.3)',
            ],
            borderColor: [
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 0.7)',
                'rgba(255, 255, 255, 0.4)',
            ],
            borderWidth: 1,
            borderAlign: 'center',
            borderCapStyle: 'round',
            borderJoinStyle: 'round',
            fill: {
                target: 'origin',
            },
        },
    ];
}

