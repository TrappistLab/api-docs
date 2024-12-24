// DOM elements
const displayDiv = document.getElementById('displayDiv');
const displayDiv2 = document.getElementById('displayDiv2');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const latitudeInput2 = document.getElementById('latitude2');
const longitudeInput2 = document.getElementById('longitude2');
const startInput = document.getElementById('start-date');
const endInput = document.getElementById('end-date');
const startInput2 = document.getElementById('start-date2');
const endInput2 = document.getElementById('end-date2');
const graphInfo = document.querySelector('.graph-text');
const graphBox = document.querySelector('.graph-box');
const chartBox = document.querySelector('.chart');
const graphInfo2 = document.querySelector('.graph-text2');
const graphBox2 = document.querySelector('.graph-box2');
const chartBox2 = document.querySelector('.chart2');
const ctx = document.getElementById('chart');
const ctx2 = document.getElementById('chart2');
const modalLocation = document.getElementById("modal-location");
const loading = document.querySelector(".loading");
const loading2 = document.querySelector(".loading2");
const apiKey = document.getElementById('apikey');
const apiKey2 = document.getElementById('apikey2');
const error2 = document.getElementById('error2');
const error = document.getElementById('error');

// const defaultgraphbox = graphBox.innerHTML;
// const defaultgraphbox2 = graphBox2.innerHTML;

// Unit selectors
const temperatureUnitSelect = document.getElementById('temperature_unit');
const windSpeedUnitSelect = document.getElementById('wind_speed_unit');
const pressureUnitSelect = document.getElementById('pressure_unit');

// Historical checkbox selectors
const dailyCheckboxes = document.querySelectorAll('input.daily-variable[type="checkbox"]');
const hourlyCheckboxes = document.querySelectorAll('input.hourly-variable[type="checkbox"]');


// Forecast variable mapping
const forecast_keys = {
    'surface_convective_precipitation':'acpcpsfc',
    'surface_albedo':'albdosfc',
    'surface_total_precipitation':'apcpsfc',
    'surface_convective_precipitation_rate':'cpratsfc',
    'surface_pressure':'pressfc',
    'meansea_level_pressure':'prmslmsl',
    '2m_dewpoint_temperature':'dpt2m',
    'surface_wind_gust':'gustsfc',
    'surface_precipitation_rate':'prateavesfc', 
    '2m_relative_humidity':'rh2m', 
    '2m_air_temperature':'tmp2m',
    'wind_speed_10m':['ugrd10m','vgrd10m'], 
    'wind_speed_100m':['ugrd100m','vgrd100m'],
    'medium_cloud_cover':'mcdcmcll',
    'low_cloud_cover':'lcdclcll',
    'high_cloud_cover':'hcdchcll',
    'total_cloud_cover':'tcdcclm',
    'sunshine_duration':'sunsdsfc',
    'potential_evaporation':'pevprsfc',
    'soil_moisture_l1':'soilw0_10cm',
    'soil_moisture_l2':'soilw10_40cm',
    'soil_moisture_l3':'soilw40_100cm',
    'soil_moisture_l4':'soilw100_200cm'
};

// Group definitions for plotting (same as before for historical)
const Groups = {
    'temp': {
        'variables': [
            'air_temperature_min', 'air_temperature_max',
            'air_temperature',
            'soil_temperature_l1', 'soil_temperature_l2', 'soil_temperature_l3', 'soil_temperature_l4',
            '2m_dewpoint_temperature'
        ],
        'unit': 'k'
    },
    'hum': {
        'variables': ['relative_humidity_min', 'relative_humidity_max'],
        'unit': '%'
    },
    'heat': {
        'variables': ['surface_net_solar','surface_net_thermal','top_net_solar','top_net_thermal','sensible_heat_flux'],
        'unit': 'J m**-2'
    },
    'cloud': {
        'variables': ['low_cloud_cover','medium_cloud_cover','high_cloud_cover','total_cloud_cover'],
        'unit': '0-1'
    },
    'column': {
        'variables': ['total_column_cloud_liquid_water','total_column_rain_water'],
        'unit': 'kg m**-2'
    },
    'crr': {
        'variables': ['convective_rain_rate'],
        'unit': 'kg m**-2 s**-1'
    },
    'wind': {
        'variables': ['wind_speed_10m','wind_speed_100m', '10m_instantaneous_wind_gusts'],
        'unit': 'm/s'
    },
    'runoff': {
        'variables': ['runoff','surface_runoff','subsurface_runoff','evaporation','potential_evaporation'],
        'unit': 'm'
    },
    'tp': {
        'variables': ['total_precipitation'],
        'unit': 'mm'
    }
    
};

// For forecast, we can reuse Groups or create separate groups, but forecast keys differ. Let's assume we reuse a similar grouping approach or just put all forecast variables under a single group. We can define a separate grouping structure for forecast if needed.
const ForecastGroups = {
    // Example grouping, adjust as needed:
    'forecast_temp': {
        'variables': ['2m_air_temperature','2m_dewpoint_temperature'],
        'unit':'K'
    },
    'forecast_wind': {
        'variables': ['wind_speed_10m','wind_speed_100m','surface_wind_gust'],
        'unit':'m/s'
    },
    'forecast_cloud': {
        'variables': ['medium_cloud_cover','low_cloud_cover','high_cloud_cover','total_cloud_cover'],
        'unit':'0-1'
    },
    'forecast_precip': {
        'variables': ['surface_convective_precipitation','surface_total_precipitation','surface_convective_precipitation_rate','surface_precipitation_rate'],
        'unit':'mm or kg m**-2 s**-1' // adjust as needed based on variable units
    },
    'hum': {
        'variables': ['2m_relative_humidity','soil_moisture_l1','soil_moisture_l2','soil_moisture_l3','soil_moisture_l4', 'surface_albedo'],
        'unit': '%'
    },
    'sun':{
        'variables': ['sunshine_duration'],
        'unit': 's'
    },
    'press':{
        'variables': ['surface_pressure','meansea_level_pressure'],
        'unit': 'hpa'
    }
    
};

// State variables
let myChart;
let currentMode = 'forecast'; 
let isError = false;

// Selected variables
let dailyChecked = ['air_temperature_min'];
let hourlyChecked = ['air_temperature'];

// For forecast mode, selected variables will come from another set of checkboxes
// Assume we have checkboxes with class 'forecast-variable' for forecast mode
const forecastCheckboxes = document.querySelectorAll('input.forecast-variable[type="checkbox"]');
let forecastChecked = ['2m_air_temperature'];
function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Set today's date for start date
  const today = new Date();
  const todayStr = formatDate(today);
  startInput2.value = todayStr;
  startInput2.min = todayStr;
  
  // Compute the end date as 5 days from today
  const endDateObj = new Date(today);
  endDateObj.setDate(endDateObj.getDate() + 5);
  const endDateStr = formatDate(endDateObj);
  endInput2.value = endDateStr;
  endInput2.min = startInput2.value;
  endInput2.max = endDateStr;
startInput2.max = endDateStr;
updateURL();
// Event listeners for historical checkboxes
dailyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        updateSelectedVariables(dailyChecked, checkbox);
        updateURL();
    });
});
hourlyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        updateSelectedVariables(hourlyChecked, checkbox);
        updateURL();
    });
});

// Event listeners for forecast checkboxes
forecastCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
        updateSelectedVariables(forecastChecked, checkbox);
        updateURL();
    });
});

  
// Input listeners
latitudeInput.addEventListener('input', () => {
    localStorage.setItem("latitude", latitudeInput.value); updateURL});
longitudeInput.addEventListener('input', () => {
        localStorage.setItem("longitude", longitudeInput.value); updateURL});
latitudeInput2.addEventListener('input', () => {
    localStorage.setItem("latitude2", latitudeInput2.value); updateURL});
longitudeInput2.addEventListener('input', () => {
        localStorage.setItem("longitude2", longitudeInput2.value); updateURL});
startInput.addEventListener('input', updateURL);
endInput.addEventListener('input', updateURL);
startInput2.addEventListener('input', updateURL);
endInput2.addEventListener('input', updateURL);
apiKey.addEventListener('input', updateURL);
apiKey2.addEventListener('input', updateURL);
temperatureUnitSelect.addEventListener('change', updateURL);
windSpeedUnitSelect.addEventListener('change', updateURL);
pressureUnitSelect.addEventListener('change', updateURL);

// Helper function to update selected variables arrays
function updateSelectedVariables(array, checkbox) {
    if (checkbox.checked) {
        if (!array.includes(checkbox.id)) {
            array.push(checkbox.id);
        }
    } else {
        const index = array.indexOf(checkbox.id);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}




// Update URL based on mode
function updateURL() {
    let graphinfo;
    let graphbox;
    let chartbox;
    if (currentMode === 'historical') {
         load = loading;
        graphinfo = graphInfo;
        graphbox = graphBox;
        chartbox = chartBox;
        errorDiv = error;
    }
    else{
        load =  loading2;
        graphinfo = graphInfo2;
        graphbox = graphBox2;
        chartbox = chartBox2;
        errorDiv = error2;
    }
    if (graphinfo && graphinfo.style.display === 'none') {
        graphinfo.style.display = 'block';
        graphbox.style.backgroundColor = '#161619';
        chartbox.style.display = 'none';
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
    }
    if(isError){
        errorDiv.style.setProperty('display', 'none', 'important');
        // console.log(errorDiv);
        isError = false;
    }
   
    if (currentMode === 'historical') {
        displayDiv.value = buildHistoricalURL();
    } else {
        displayDiv2.value = buildForecastURL();
    }
}

function buildHistoricalURL() {
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
    return url;
}

function buildForecastURL() {
    const latitude = latitudeInput2.value;
    const longitude = longitudeInput2.value;
    const start = startInput2.value;
    const end = endInput2.value;
    const key = apiKey2.value;

    const variables = forecastChecked.join(',');
    
    let url = `https://api.climateinafrica.com/v1/forecast/gfs?apikey=${key}&latitude=${latitude}&longitude=${longitude}&start_date=${start}&end_date=${end}`;
    if(variables.length>0){
        url += `&variables=${variables}`
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
    return url;
}



function showForecastError(message,errorDiv, chartDiv, graphText,) {
    chartDiv.style.display = "none";
    graphText.style.display = "none";
    errorDiv.style.display = "block";
    errorDiv.innerHTML = `
      <div>
        <i class="fas fa-exclamation-circle"></i> An error occurred: ${message}.
        <button type="button"
                class="btn btn-danger ms-2"
                onclick="recoverForecastChart()"
                style="border-radius: 50px; padding: 12px 24px; box-shadow: none;font-size: 14px; text-transform: unset;">
          <i class="fas fa-arrow-rotate-right" style="color: white;"></i> Reload Chart
        </button>
      </div>
    `;
  }
  
  function recoverForecastChart() {
    let errorPanel;
    let chartArea;
    let graphText;
    if(currentMode === 'historical'){
     errorPanel = error;
  chartArea = chartBox;
graphText = graphInfo;
    }
    else{
        errorPanel = error2
    chartArea = chartBox2;
    graphText = graphInfo2;
    }
    
  
    errorPanel.style.display = "none";
  
    chartArea.style.display = "block";
    graphText.style.display = "block";
  
    getData();
  }
  

// Fetch and plot data
function getData() {
    let url;
    let load;
    let graphinfo;
    let graphbox;
    let chartbox;
    let errorDiv
    if (currentMode === 'historical') {
         load = loading;
        graphinfo = graphInfo;
        graphbox = graphBox;
        chartbox = chartBox;
        url = displayDiv.value;
        errorDiv = error;
    }
    else{
        load =  loading2;
        graphinfo = graphInfo2;
        graphbox = graphBox2;
        chartbox = chartBox2;
        url = displayDiv2.value;
        errorDiv = error2;
    }
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: {'Access-Control-Allow-Origin': "*"},
        beforeSend: function(){
            errorDiv.style.setProperty('display', 'none', 'important');
            graphinfo.style.display = 'none';
            graphbox.style.backgroundColor = '#F6F8FA';
            load.style.display = "block";
        },
        success: function(data) {
            load.style.display = "none";
            chartbox.style.display = 'block';
            if (currentMode === 'historical') {
                plotHistoricalData(data);
            } else {
                plotForecastData(data);
            }
        },
        error: function(xhr, status, error) {
            isError = true;
            let message = (xhr.status == 0) ? "Server error. Please try again later" : xhr.responseJSON.reason;
            load.style.display = "none";
            graphbox.style.backgroundColor = '#F6F8FA';
            showForecastError(`${message} (${xhr.status})`, errorDiv, chartbox,graphinfo);
        }
    });
}

function downloadData(format) {
    let link;
    let latitude;
    let longitude;
    if(currentMode ==="historical"){
        link = displayDiv.value;
        latitude = latitudeInput.value;
        longitude - longitudeInput.value;
    }
    else{
        link = displayDiv2.value;
        latitude = latitudeInput2.value;
        longitude = longitudeInput2.value;

    }
    const url = link + "&format=" + format;
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
        a.download = `cia${latitude}-${longitude}-data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}

// Historical processing (unchanged)
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1)/7);
    return weekNo;
}

function getWeekKey(date) {
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    return `${year}-W${weekNumber}`;
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

function processForecastData(data) {
    const dataset = data; 
    // Forecast is always 5 days, no grouping needed.
    return dataset;
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

// Plotting historical data
function plotHistoricalData(data) {
    const processedData = processData(data);
    const chartData = buildChartData(processedData.datasets, processedData.scheme, Groups);
    renderChart(chartData, processedData.scheme,ctx);
}

// Plotting forecast data
function plotForecastData(data) {
    const forecastData = processForecastData(data);
    const chartData = buildChartDataForecast(forecastData, ForecastGroups);

    renderChart(chartData, 'day', ctx2);
}

function buildChartData(datasetsArray, scheme, groupsDefinition) {
    const datasets = [];
    const yAxes = {};
    let axisIndex = 0;

    datasetsArray.forEach(datasetObj => {
        const dataSet = datasetObj.data;
        const dataType = datasetObj.type; 
        const groupedVariables = groupVariables(dataSet, groupsDefinition);

        Object.keys(groupedVariables).forEach((groupName) => {
            const group = groupedVariables[groupName];
            const unit = group.unit;
            const yAxisID = `y-axis-${axisIndex}`;

            yAxes[yAxisID] = createYAxis(unit, axisIndex);
            
            group.variables.forEach((variable, variableIndex) => {
                const dataPoints = dataSet.time.map((time, idx) => ({ x: time, y: variable.values[idx] }));
                datasets.push(createDataset(variable.name, dataType, dataPoints, yAxisID, axisIndex, variableIndex));
            });

            axisIndex++;
        });
    });

    return { datasets, yAxes };
}

function buildChartDataForecast(forecastData, groupsDefinition) {
    const datasets = [];
    const yAxes = {};
    let axisIndex = 0;
    const groupedVariables = groupVariables(forecastData.hourly, groupsDefinition);
    Object.keys(groupedVariables).forEach((groupName) => {
        const group = groupedVariables[groupName];
        const unit = group.unit;
        const yAxisID = `y-axis-${axisIndex}`;

        yAxes[yAxisID] = createYAxis(unit, axisIndex);

        group.variables.forEach((variable, variableIndex) => {
            const dataPoints = forecastData.hourly.time.map((time, idx) => ({ x: time, y: variable.values[idx] }));
            datasets.push(createDataset(variable.name, 'forecast', dataPoints, yAxisID, axisIndex, variableIndex));
        });

        axisIndex++;
    });

    return { datasets, yAxes };
}

function createYAxis(unit, axisIndex) {
    return {
        type: 'linear',
        display: false,
        position: axisIndex % 2 === 0 ? 'left' : 'right',
        ticks: {
            beginAtZero: true,
            font: { size: 14, family: '"Roboto", sans-serif' },
            color: '#000000'
        },
        grid: { display: false },
        title: {
            display: true,
            text: unit,
            font: { size: 14, family: '"Roboto", sans-serif', weight: 'bold' },
            color: '#000000'
        }
    };
}

function createDataset(name, dataType, dataPoints, yAxisID, axisIndex, variableIndex) {
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

    return {
        label: `${name} (${dataType})`,
        data: dataPoints,
        backgroundColor: colors[(2 * axisIndex + variableIndex) % colors.length],
        borderColor: borderColors[(2 * axisIndex + variableIndex) % borderColors.length],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        yAxisID: yAxisID
    };
}

function renderChart(chartData, scheme, ctx) {
    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    myChart = new Chart(ctx, {
        type: 'line',
        data: { datasets: chartData.datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            hover: { mode: 'nearest' },
            interaction: { intersect: false },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: scheme,
                        tooltipFormat: scheme === 'year' ? 'YYYY' : (scheme === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD HH:mm')
                    },
                    ticks: {
                        font: { size: 14, family: '"Roboto", sans-serif' },
                        color: '#000000'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 14, family: '"Roboto", sans-serif', weight: 'bold' },
                        color: '#000000'
                    }
                },
                ...chartData.yAxes
            },
            plugins: {
                title: {
                    display: true,
                    text: currentMode === 'historical' ? 'Historical Data' : 'Forecast Data'
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
                        font: { family: '"Roboto", sans-serif', size: 14 }
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

// Mode switching function (triggered by tabs)
function setMode(newMode) {
    currentMode = newMode;
    localStorage.setItem("currentMode", currentMode);
    updateURL();
}

// GPS and location functions remain unchanged
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showLocation);
    } 
}
function showLocation(position){
    modalLocation.value="GPS";
    if(currentMode === 'historical'){ 
    latitudeInput.value = position.coords.latitude;
    longitudeInput.value = position.coords.longitude;
}
    else{
        latitudeInput2.value = position.coords.latitude;
    longitudeInput2.value = position.coords.longitude;
    }
    updateURL();
}

// Search location logic remains unchanged
let cities;
modalLocation.addEventListener("input", () => {
    let timing;
    if(timing){
        clearTimeout(timing)
    }
    timing = setTimeout(() => {
        fetch(`https://api.climateinafrica.com/v1/geolocator?place=${modalLocation.value}`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            cities = data;
            renderArray();
        });
    }, 3000);
});

function renderArray(){
    const listContainer = document.getElementById("listedcountries");
    listContainer.innerHTML = '';
    cities.forEach (element => {
        const listItem = document.createElement('li');
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = 
        `<li class="list-group-item flex-fill justify-content-between align-items-center">
            <div class="d-flex align-items-center px-3">   
              <img src="${element.flag}" alt="" style="width: 45px; height: 45px"
                class="rounded-circle" />
              <div class="ms-3 me-auto">
                <p class="fw-bold mb-1">${element.city}</p>
                <p class="m-0">${element.country}</p>
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
    let exlong = parseFloat(id.split(",")[0]);
    if(currentMode === 'historical'){ 
        latitudeInput.value = exlat.toFixed(5);  
    longitudeInput.value = exlong.toFixed(5);
    localStorage.setItem('latitude', latitudeInput.value);
    localStorage.setItem('longitude', longitudeInput.value);
    }
        else{
            latitudeInput2.value = exlat.toFixed(5);  
    longitudeInput2.value = exlong.toFixed(5);
    localStorage.setItem('latitude2', latitudeInput2.value);
    localStorage.setItem('longitude2', longitudeInput2.value);
        }
    
    updateURL();
}

document.addEventListener("DOMContentLoaded", () => {
    const storedMode = localStorage.getItem("currentMode");
    if (storedMode) {
      currentMode = storedMode;
      if (storedMode === 'historical') {
        const forecastTab = document.getElementById("ex-with-icons-tab-1");
        const historicalTab = document.getElementById("ex-with-icons-tab-2");
        forecastTab.classList.remove("active");
        historicalTab.classList.add("active");
        document.getElementById("ex-with-icons-tabs-1").classList.remove("show", "active");
        document.getElementById("ex-with-icons-tabs-2").classList.add("show", "active");
      }
     
    }
    const storedLat = localStorage.getItem("latitude");

    if (storedLat !== null) latitudeInput.value = storedLat;
    const storedLon = localStorage.getItem("longitude");
    if (storedLon !== null) longitudeInput.value = storedLon;
    const storedLat2 = localStorage.getItem("latitude2");
    if (storedLat2 !== null) latitudeInput2.value = storedLat2;
    const storedLon2 = localStorage.getItem("longitude2");
    if (storedLon2 !== null) longitudeInput2.value = storedLon2;
    updateURL(); 
  });
  