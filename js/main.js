const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const displayDiv = document.getElementById('displayDiv');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const graphInfo = document.querySelector('.graph-text');
    const graphBox = document.querySelector('.graph-box');
    const chartBox = document.querySelector('.chart');
    const ctx = document.getElementById('chart');
    const modalLocation = document.getElementById("modal-location");
    const loading = document.querySelector(".loading");
    let myChart;
    const cityLocation = document.getElementById("modal-location");
const temperatureUnitSelect = document.getElementById('temperature_unit');
const windSpeedUnitSelect = document.getElementById('wind_speed_unit');
const pressureUnitSelect = document.getElementById('pressure_unit');
const apiKey = document.getElementById('apikey');
const dailyCheckboxes = document.querySelectorAll('input.daily-variable[type="checkbox"]');
const hourlyCheckboxes = document.querySelectorAll('input.hourly-variable[type="checkbox"]');

// URL
var dailyChecked = []
var hourlyChecked = []
dailyChecked.push('air_temperature_min');
hourlyChecked.push('air_temperature')
updateURL();
dailyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        if (checkbox.checked) {
            dailyChecked.push(checkbox.id);
        } else {
            const index = dailyChecked.indexOf(checkbox.id);
            if (index > -1) {
                dailyChecked.splice(index, 1);
            }
        }
        updateURL();
    });
});
hourlyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        if (checkbox.checked) {
            hourlyChecked.push(checkbox.id);
        } else {
            const index = hourlyChecked.indexOf(checkbox.id);
            if (index > -1) {
                hourlyChecked.splice(index, 1);
            }
        }
        updateURL();
    });
});

    latitudeInput.addEventListener('input', updateURL);
    longitudeInput.addEventListener('input', updateURL);
    startInput.addEventListener('input', updateURL);
    endInput.addEventListener('input', updateURL);
    apiKey.addEventListener('input', updateURL);

    temperatureUnitSelect.addEventListener('change', updateURL);
    windSpeedUnitSelect.addEventListener('change', updateURL);
    pressureUnitSelect.addEventListener('change', updateURL);
function updateURL(){
        if(graphInfo.style.display=='none'){
            graphInfo.style.display='block';
            graphBox.style.backgroundColor = '#161619';
            chartBox.style.display = 'none';
            if(myChart){
                myChart.destroy();
                myChart = null;
            }
        }
    
        const latitude = latitudeInput.value;
        const longitude = longitudeInput.value;
        const start = startInput.value;
        const end = endInput.value;
        const key = apiKey.value;

    
        const dailyParams = dailyChecked.join(',');
        const hourlyParams = hourlyChecked.join(',');
        let url = `https://api.climateinafrica.com/v1/historical?apikey=${key}&latitude=${latitude}&longitude=${longitude}&start_date=${start}&end_date=${end}`;
        if (dailyParams.length > 0) {
            url += `&daily=${dailyParams}`;
        }
        if (hourlyParams.length > 0) {
            url += `&hourly=${hourlyParams}`;
        }
        const temperatureUnit = temperatureUnitSelect.value;
        const windSpeedUnit = windSpeedUnitSelect.value;
        const pressureUnit = pressureUnitSelect.value;
        
        if (temperatureUnit) {
            url += `&temperature_unit=${temperatureUnit}`;
        }
        if (windSpeedUnit) {
            url += `&wind_speed_unit=${windSpeedUnit}`;
        }
        if (pressureUnit) {
            url += `&pressure_unit=${pressureUnit}`;
        }
        displayDiv.value = url;
    }
// https://api.climateinafrica.com
// GPS
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showLocation);
      
    } 
    
  }
  function showLocation(position){
    modalLocation.value="GPS";
    latitudeInput.value = position.coords.latitude;
    longitudeInput.value = position.coords.longitude;
    updateURL();
  }

  //SEARCH


{/* <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      
                      <div class="ms-3">
                        <p class="fw-bold mb-1">City Name</p>
                        <p class="text-muted mb-0">Country</p>
                      </div>
                    </div>
                    <a class="btn btn-link btn-rounded btn-sm" href="#" role="button">Select</a>
                  </li> */}
           
var cities;


cityLocation.addEventListener("input", () => {
if(timing){
    clearTimeout(timing)
}
var timing = setTimeout(() => {fetch(`https://api.climateinafrica.com/v1/geolocator?place=${modalLocation.value}`, {
    method: "GET",
})
  .then(response => response.json())
  .then(data => {
    // console.log(data);
    cities = data;
    // console.log(cities);
    renderArray();
    
  });
}, 3000)


    
})
function renderArray(){
    // console.log(cities);
    const listContainer = document.getElementById("listedcountries");
    // console.log(listContainer);
    listContainer.innerHTML = '';
    cities.forEach (element => {
        const listItem = document.createElement('li')
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = 
        
        `<li class="list-group-item flex-fill justify-content-between align-items-center">
        <div class="d-flex align-items-center px-3">   
          <img src="${element.flag}" alt="" style="width: 45px; height: 45px"
            class="rounded-circle" />
          <div class="ms-3 me-auto">
            <p class="fw-bold mb-1">${element.city}</p>
            <p class="m-0">${element.country} </p>
            <span class="small text-muted m-0" style="font-size:10px">Long: ${element.lng}  Lat: ${element.lat}</span>
          </div>
          <a class="btn btn-link btn-rounded btn-sm" data-mdb-dismiss="modal" id = "${element.lng},${element.lat}" href="#" role="button" onclick="changeLocation(this.id)">Select</a>

        </div>
      </li>`;
        listContainer.appendChild(listItem);
    })
}
function changeLocation(id){
    let exlat = parseFloat(id.split(",")[1]);
    latitudeInput.value = exlat.toFixed(5);
    let exlong = parseFloat(id.split(",")[0]);
    longitudeInput.value = exlong.toFixed(5);
}
// const newLocation = document.getElementById("")


// Graph
function getGroupingscheme(timeRangeInYears){
    if (timeRangeInYears < 2) {
        return 'day';   
    } else if (timeRangeInYears < 4) {
        return 'week';  
    } else if (timeRangeInYears < 6) {
        return 'month'; 
    } else {
        return 'year';  
    }
}


function groupDataByscheme(dataSet, scheme) {
    const groupedData = {};

    dataSet.time.forEach((dateStr, idx) => {
        const date = new Date(dateStr);
        let groupKey;
        if (scheme === 'week') {
            groupKey = getWeekKey(date);
        } else if (scheme === 'month') {
            groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (scheme === 'year') {
            groupKey = `${date.getFullYear()}`;
        } else {
            groupKey = dateStr;
        }

        if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
                time: [],
                ...Object.keys(dataSet).filter(key => key !== 'time').reduce((acc, key) => {
                    acc[key] = [];
                    return acc;
                }, {})
            };
        }
        groupedData[groupKey].time.push(dateStr);
        Object.keys(dataSet).filter(key => key !== 'time').forEach(key => {
            groupedData[groupKey][key].push(dataSet[key][idx]);
        });
    });

    return groupedData;
}

function getWeekKey(date) {
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    return `${year}-W${weekNumber}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}
function calculateAverages(groupedData) {
    const averagedData = { time: [], ...Object.keys(groupedData[Object.keys(groupedData)[0]]).reduce((acc, key) => {
        if (key !== 'time') acc[key] = [];
        return acc;
    }, {}) };

    Object.keys(groupedData).forEach(groupKey => {
        averagedData.time.push(groupKey);
        Object.keys(groupedData[groupKey]).filter(key => key !== 'time').forEach(key => {
            const avg = groupedData[groupKey][key].reduce((a, b) => a + b, 0) / groupedData[groupKey][key].length;
            averagedData[key].push(avg);
        });
    });

    return averagedData;
}


function processData(data) {
    const datasets = [];
    let scheme = 'day';

    const hasDaily = data.daily && data.daily.time && data.daily.time.length > 0;
    const hasHourly = data.hourly && data.hourly.time && data.hourly.time.length > 0;

    if (hasDaily) {
        // Adjust daily time labels to include ' 00:00:00'
        data.daily.time = data.daily.time.map(dateStr => dateStr + ' 00:00:00');
        const dailyTimeArray = data.daily.time.map(date => new Date(date).getTime());
        const minTime = Math.min(...dailyTimeArray);
        const maxTime = Math.max(...dailyTimeArray);
        const timeRangeInYears = (maxTime - minTime) / (365 * 24 * 60 * 60 * 1000);
        scheme = getGroupingscheme(timeRangeInYears);

        const groupedDailyData = groupDataByscheme(data.daily, scheme);
        const averagedDailyData = calculateAverages(groupedDailyData);
        datasets.push({ data: averagedDailyData, type: 'daily' });
    }

    if (hasHourly) {
        const hourlyTimeArray = data.hourly.time.map(date => new Date(date).getTime());
        const minTime = Math.min(...hourlyTimeArray);
        const maxTime = Math.max(...hourlyTimeArray);
        const timeRangeInYears = (maxTime - minTime) / (365 * 24 * 60 * 60 * 1000);
        scheme = getGroupingscheme(timeRangeInYears);

        const groupedHourlyData = groupDataByscheme(data.hourly, scheme);
        const averagedHourlyData = calculateAverages(groupedHourlyData);
        datasets.push({ data: averagedHourlyData, type: 'hourly' });
    }

    return { datasets: datasets, scheme: scheme };
}


function downloadData(format) {
    const url = displayDiv.value + "&format=" + format;

    fetch(url, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `cia${latitudeInput.value}-${longitudeInput.value}-data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}
function getData(){
    // console.log(displayDiv.value);
    $.ajax({
        url:displayDiv.value,
        method:"GET",
        dataType:"json",
        headers:{'Access-Control-Allow-Origin': "*"},
        beforeSend: function(){
            // console.log(loading.style.display);
            // console.log("Hello");
            graphInfo.style.display = 'none';
            graphBox.style.backgroundColor = '#F6F8FA';
            loading.style.display = "block";

        },
        success: function(data){
            // console.log(data);
            loading.style.display = "none";
            // data = JSON.parse(data);
            chartBox.style.display = 'block';
            plotGraph(data);
            // groupDataByUnit(data);
            
            // console.log(groupByYear(data));

        },
        error: function(xhr, status,error){
            let message;
            if(xhr.status==0){
                message="Server error. Please try again letter"
            }
            else{
                message = xhr.responseJSON.reason
            }
            loading.style.display = "none";
            graphBox.style.backgroundColor = '#F6F8FA';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger d-flex align-items-center';
            errorDiv.role = 'alert';
            errorDiv.innerHTML = `
                            <div>
                                <i class="fas fa-exclamation-circle"></i> An error occurred: ${message}(${xhr.status}).
                                <button type="submit" class="btn btn-danger ms-2" onclick="getData()" style="border-radius: 50px; padding: 12px 24px; box-shadow: none;font-size: 14px; text-transform: unset;">
                                    <i class="fas fa-arrow-rotate-right" style="color: white;"></i> Reload Chart
                                </button>
                            </div>
                        `;
                        errorDiv.style.backgroundColor = '#f8d7da';
                        errorDiv.style.color = '#721c24';
                        errorDiv.style.border = '1px solid #f5c6cb';
                        graphBox.innerHTML = ''; 
                        graphBox.appendChild(errorDiv);  
        }
    });
}

function groupVariables(data, groups) {
    const groupedData = {};
    for (const groupName in groups) {
        if (groups.hasOwnProperty(groupName)) {
            groupedData[groupName] = {
                variables: [],
                unit: groups[groupName].unit
            };
        }
    }

    for (const variable in data) {
        if (variable !== 'time') {
            for (const groupName in groups) {
                if (groups.hasOwnProperty(groupName)) {
                    if (groups[groupName].variables.includes(variable)) {
                        groupedData[groupName].variables.push({
                            name: variable,
                            values: data[variable]
                        });
                        break;
                    }
                }
            }
        }
    }

    return groupedData;
}
// const Data = 
const Groups = {
    'temp':{
        'variables': [
            'air_temperature_min', 'air_temperature_max', 
            'air_temperature', 
            'soil_temperature_l1', 'soil_temperature_l2', 'soil_temperature_l3', 'soil_temperature_l4', 
            '2m_dewpoint_temperature'
        ],
        'unit':'k'
    },
    'hum':{
        'variables':['relative_humidity_min', 'relative_humidity_max'],
        'unit':'%'
    },
    'heat':{
        'variables':['surface_net_solar','surface_net_thermal','top_net_solar','top_net_thermal','sensible_heat_flux'],
        'unit':'J m**-2'
    },
    'cloud':{
        'variables':['low_cloud_cover','medium_cloud_cover','high_cloud_cover','total_cloud_cover'],
        'unit':'0-1'
    },
    'column':{
        'variables':['total_column_cloud_liquid_water','total_column_rain_water'],
        'unit':'kg m**-2'
    },
    'crr':{
        'variables':['convective_rain_rate'],
        'unit':'kg m**-2 s**-1'
    },
    'wind':{
        'variables':['wind_speed_10m','wind_speed_100m', '10m_instantaneous_wind_gusts'],
        'unit':'m/s'
    },
    'runoff':{
        'variables':['runoff','surface_runoff','subsurface_runoff','evaporation','potential_evaporation'],
        'unit':'m'
    },
    'tp':{
        'variables':['total_precipitation'],
        'unit':'mm'
    }
}




function plotGraph(data) {
    const processedData = processData(data);
    const datasets = [];
    const yAxes = {};
    let axisIndex = 0;

    processedData.datasets.forEach(datasetObj => {
        const dataSet = datasetObj.data;
        const dataType = datasetObj.type; // 'daily' or 'hourly'
        const groupedVariables = groupVariables(dataSet, Groups);
        // console.log(groupedVariables);
        Object.keys(groupedVariables).forEach((groupName) => {
            const group = groupedVariables[groupName];
            const unit = group.unit;
            const yAxisID = `y-axis-${axisIndex}`;

            // Define Y-Axis for each group
            yAxes[yAxisID] = {
                type: 'linear',
                display: false,
                position: axisIndex % 2 === 0 ? 'left' : 'right',
                ticks: {
                    beginAtZero: true,
                    font: {
                        size: 14,
                        family: '"Roboto", sans-serif'
                    },
                    color: '#000000'
                },
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: unit,
                    font: {
                        size: 14,
                        family: '"Roboto", sans-serif',
                        weight: 'bold'
                    },
                    color: '#000000'
                }
            };

            group.variables.forEach((variable, variableIndex) => {
                const colors = [
                    'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ];
                const borderColors = [
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ];

                // Create data points with x and y values
                const dataPoints = dataSet.time.map((time, idx) => ({
                    x: time,
                    y: variable.values[idx]
                }));

                datasets.push({
                    label: `${variable.name} (${dataType})`,
                    data: dataPoints,
                    backgroundColor: colors[(2 * axisIndex + variableIndex) % colors.length],
                    borderColor: borderColors[(2 * axisIndex + variableIndex) % borderColors.length],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    yAxisID: yAxisID,
                });
            });

            axisIndex++;
        });
    });

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            hover: {
                mode: 'nearest'
            },
            interaction: {
                intersect: false
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: `${processedData.scheme}`,
                        tooltipFormat: processedData.scheme === 'year' ? 'YYYY' : (processedData.scheme === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD HH:mm')
                    },
                    ticks: {
                        font: {
                            size: 14,
                            family: '"Roboto", sans-serif'
                        },
                        color: '#000000'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            family: '"Roboto", sans-serif',
                            weight: 'bold'
                        },
                        color: '#000000'
                    }
                },
                ...yAxes
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Historical Data'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            if (label) {
                                return `${label}: ${context.formattedValue}`;
                            }
                            return context.formattedValue;
                        }
                    }
                },
                legend: {
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const chartLegend = legend.chart;
                        const dataset = chartLegend.data.datasets[index];
                        const yAxisID = dataset.yAxisID;
                        dataset.hidden = !dataset.hidden;
                        const yAxisVisible = chartLegend.data.datasets.some(ds => ds.yAxisID === yAxisID && !ds.hidden);
                        chartLegend.options.scales[yAxisID].display = yAxisVisible;

                        chartLegend.update();
                    },
                    labels: {
                        font: {
                            family: '"Roboto", sans-serif',
                            size: 14
                        }
                    }
                }
            }
        }
    });
        myChart.data.datasets.forEach(dataset => {
        const yAxisID = dataset.yAxisID;
        if (!dataset.hidden) {
            myChart.options.scales[yAxisID].display = true;
        }
    });
    Chart.defaults.color = '#000';
    Chart.defaults.font.size = 14;

    myChart.update();
}



