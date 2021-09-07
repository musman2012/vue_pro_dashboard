<template>
  <div>
    <div class="row">
    
      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="max_seal_torque" subTitle="Max Seal Torque">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-circle text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="avg_seal_torque" subTitle="Avg. Seal Torque">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-chart text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="num_cycles" subTitle="Total Cycles">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-refresh-02 text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="max_seal_torque" subTitle="TBD">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-chart text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

    </div> 

    <div class="row">
      <!-- <div id="cal-heatmap"></div> -->
      <calendar-heatmap :values="cal_data" 
      :end-date="cal_end" />
    </div>

    <div class="row">
      <div id="cal-heatmap"></div>
    </div>
    <!-- <div class="row">
        <div class="col-xl-3 col-md-6">
          <stats-card v-bind:title="num_machines" subTitle="Running Machines">
            <div slot="header" class="icon-warning">
              <i class="nc-icon nc-delivery-fast text-warning"></i>
            </div>
            <template slot="footer">
              <i class="fa fa-refresh"></i>Updated now
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card v-bind:title="healthy_machines" subTitle="Healthy Machines">
            <div slot="header" class="icon-success">
              <i class="nc-icon nc-satisfied text-success"></i>
            </div>
            <template slot="footer">
              <i class="fa fa-calendar-o"></i>Updated now
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card title="2" subTitle="Idle Machines">
            <div slot="header" class="icon-danger">
              <i class="nc-icon nc-button-power text-danger"></i>
            </div>
            <template slot="footer">
              <i class="fa fa-clock-o"></i>Last day
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card title="3" subTitle="Machines Failing Health Tests">
            <div slot="header" class="icon-info">
              <i class="nc-icon nc-fav-remove text-danger"></i>
            </div>
            <template slot="footer">
              <i class="fa fa-refresh"></i>Updated now
            </template>
          </stats-card>
        </div>
      </div> -->
    <card>
      <div class="col-md-6">
        <div id="cyclesGraph"></div>
      </div>
    </card>
    
    <card>
      <div class="col-md-6">
        <div id="sealTorqueGraph2"></div>
      </div>
    </card>

    <card>
      <div class="col-md-6">
        <div id="engAlarmGraph"></div>
      </div>
    </card>

    <div class="row">
      
      <div class="col-lg-4">
        <h5 class="title">Select Starting and Ending Date</h5>
        <fg-input>
          <el-date-picker
            v-model="value"
            type="daterange"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            value-format="yyyy-MM-dd"
            @input="datePicked"
          >
          </el-date-picker>
        </fg-input>
      </div>

      <div class="col-md-6">
        <h5 class="title">Select Alarm Type</h5>
        <el-select
          @input="dispatch"
          class="select-danger"
          :remote-method="filter"
          size="large"
          placeholder="Select Type"
          v-model="selected_alarm_type"
        >
          <el-option
            v-for="option in alarms.alarm_types"
            class="select-danger"
            :value="option.value"
            :label="option.label"
            :key="option.label"
          >
          </el-option>
        </el-select>
      </div>
    </div>

  </div>
</template>
<script>
  import TimeLine from './Stats/TimeLine.vue'
  import TimeLineItem from './Stats/TimeLineItem.vue'
  import TaskList from './Stats/TaskList'
  import ChartCard from 'src/components/Cards/ChartCard.vue'
  import StatsCard from "src/components/Cards/StatsCard.vue";
  import Progress from "easy-circular-progress";
  import axios from "axios";
  // import CalHeatMap from 'cal-heatmap';
  // import 'cal-heatmap/cal-heatmap.css';
  import { DatePicker, TimeSelect,  Select, Option } from 'element-ui';
  import { CalendarHeatmap } from 'vue-calendar-heatmap';

  export default {
    components: {
      TimeLine,
      TimeLineItem,
      [DatePicker.name]: DatePicker,
      [TimeSelect.name]: TimeSelect,
      [Option.name]: Option,
      [Select.name]: Select,
      ChartCard,
      TaskList,
      StatsCard,
      CalendarHeatmap,
      Progress
    },
    data () {
      return {
        num_machines: "15",
        max_seal_torque: "1234",
        avg_seal_torque: "4321",
        num_cycles: "4567",
        healthy_machines: "14",
        selected_alarm_type: "",
        seal_torque_data: null,
        value: "",
        // cal_data needs to be updated
        // after fetching complete cycle data, iterate it to create a json with date and count keys
        cal_data: [{ date: '2021-08-01', count: 26 }, { date: '2021-09-05', count: 316 }],
        cal_end: '2021-10-10',
        alarms: {
        simple: "",
        alarm_types: [
            { value: "AT 1", label: "AT 1" },
            { value: "AT 2", label: "AT 2" },
            { value: "AT 3", label: "AT 3" },
            { value: "AT 4", label: "AT 4" },
          ],
        },
        usersChart: {
          data: {
            labels: ['9AM', '12AM', '3PM', '6PM', '9PM', '12PM', '3AM', '6AM'],
            series: [
              [287, 385, 490, 562, 594, 626, 698, 895, 952],
              [67, 152, 193, 240, 387, 435, 535, 642, 744],
              [23, 113, 67, 108, 190, 239, 307, 410, 410]
            ]
          },
          options: {
            low: 0,
            high: 1000,
            showArea: true,
            height: '245px',
            axisX: {
              showGrid: false
            },
            showLine: true,
            showPoint: false
          }
        },
        subscriptionsChart: {
          data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            series: [
              [60, 50, 30, 50, 70, 60, 90, 100]
            ]
          },
          options: {
            showPoint: false,
            lineSmooth: true,
            height: '210px',
            axisX: {
              showGrid: false,
              showLabel: true
            },
            axisY: {
              offset: 40,
              showGrid: false
            },
            low: 0,
            high: 'auto',
            classNames: {
              line: 'ct-line ct-red'
            }
          }
        },
        downloadsChart: {
          data: {
            labels: ['2009', '2010', '2011', '2012', '2013', '2014'],
            series: [
              [1200, 1000, 3490, 8345, 3256, 2566]
            ]
          },
          options: {
            showPoint: false,
            lineSmooth: true,
            height: '210px',
            axisX: {
              showGrid: false,
              showLabel: true
            },
            axisY: {
              offset: 40,
              showGrid: false
            },
            low: 0,
            high: 'auto',
            classNames: {
              line: 'ct-line ct-orange'
            }
          }
        }
      }
    },
    beforeCreate(){
      let chart_js = document.createElement("script");
      let plotly = document.createElement("script");
      let d3 = document.createElement("script");
      let d3_colors = document.createElement("script");
      let cal_hm_js = document.createElement("script");
      let cal_hm_css = document.createElement("style");

      chart_js.setAttribute(
        "src",
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"
      );
      document.head.appendChild(chart_js);
      plotly.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
      document.head.appendChild(plotly);
      d3.setAttribute(
        "src",
        "https://d3js.org/d3.v3.min.js"
      );
      document.head.appendChild(d3);
      d3_colors.setAttribute(
        "src",
        "https://cdnjs.cloudflare.com/ajax/libs/d3-color/1.2.1/d3-color.js"
      );
      document.head.appendChild(d3_colors);
      cal_hm_js.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/cal-heatmap/3.3.10/cal-heatmap.min.js"
      );
      document.head.appendChild(cal_hm_js);
      cal_hm_css.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/cal-heatmap/3.3.10/cal-heatmap.css"
      );
      document.head.appendChild(cal_hm_css);
    },
    mounted(){
    // document.getElementById("sealTorqueGraph").innerHTML="Seal Torque Data Fetched";
      this.drawSealTorqueGraph();
      //document.getElementById("engAlarmGraph").innerHTML="Alarm Data Fetched";
      // this.drawCyclesGraph();
    },
    methods: {
      filter(query) {
        console.log("In Filter function." + query);
      },
      datePicked(d) {
        console.log("Date picked called with " + d);
        // console.log("Selected line is " + this.selected_line);
        // this.dispatch(this.selected_line);
      },
      dispatch(e) {
        console.log("Dispathc " + e);
      },
      drawSealTorqueGraph() {
        // test this function and build upon
        axios.get("http://18.168.19.93:5000/fetchSealTorqueData")
        .then((response) => {
          
          // var jsoned_batch_data = JSON.parse(JSON.stringify(response.data));
          
          // console.log(jsoned_batch_data);

          var jsoned_seal_data = JSON.parse(JSON.stringify(response.data));
          this.seal_torque_data = jsoned_seal_data;
          console.log(jsoned_seal_data);
          this.drawCyclesGraph();
          var seals = [];
          var seal_times = []; 
          var data_records = jsoned_seal_data.length;
          this.num_cycles = data_records.toString();
          var max_seal = 0; var sum_seal = 0;

          for (var j = 0; j < data_records; j++) {
            var fields = jsoned_seal_data[j]._source;
            //window.batch_ppms.push(fields.PPM[0].toString());
            var seal = parseInt(fields.Seal_Torque);
            sum_seal += seal;
            if (seal > max_seal) {
              max_seal = seal;
            }
            var sealTime = fields.TIMESTAMP;
            var tkns = sealTime.split(" ");
            var times = tkns[1];
            seals.push(seal);
            seal_times.push(times);
          }
          console.log("Seals and Times");
          console.log(seals);
          this.max_seal_torque = max_seal.toString();
          sum_seal = sum_seal / data_records;
          this.avg_seal_torque = sum_seal.toString();
          console.log(seal_times);

          var trace = {
            x: seal_times,
            y: seals,
            type: "scatter",
           // name: dict_check[index],
            mode: "lines"
          };

          var data = [trace];

          var layout = {
          width: 1000,
          height: 300,
          title: "Seal Torque",
          //title_font_size: 3,
          xaxis: {
            //tickmode: "linear",
            title: "Time",
            titlefont: {
              family: "Calibiri",
              size: 11,
              color: "lightgrey",
            },
            showticklabels: true,
            tickangle: 90,
            tickfont: {
              family: "Old Standard TT, serif",
              size: 10,
              color: "black",
            },
            //exponentformat: 'e',
            // showexponent: "all",
          },
          yaxis: {
            title: "Number of Packs",
            titlefont: {
              family: "Arial, sans-serif",
              size: 10,
              color: "lightgrey",
            },
            showticklabels: true,
            tickangle: 45,
            tickfont: {
              family: "Old Standard TT, serif",
              size: 10,
              color: "black",
            },
            exponentformat: "e",
         //   legend: list(font = list(size = 30))
            // showexponent: "all",
          },
        };
        Plotly.newPlot("sealTorqueGraph2", data, layout);

        });
      },
      drawCyclesGraph() {
        // test this function and build upon
        // axios.get("http://18.168.19.93:5000/fetchAlarmData")
        // .then((response) => {
   
        // });
    
        var num_cycles_per_day = [];
        var cycles_dict = {};
        var num_records = this.seal_torque_data.length;
        // TODO: Iterate through seal_torque_data and create JSON data5
        for (var j = 0; j < num_records; j++) {
            var fields = this.seal_torque_data[j]._source;
            var sealTime = fields.TIMESTAMP;
            var tkns = sealTime.split(" ");
            var times = tkns[0].split("/");
            times = times[2]+"-"+times[1]+"-"+times[0];
            if (times in cycles_dict) {
              cycles_dict[times] += 1; 
            }
            else {
              cycles_dict[times] = 1;
            }
        }
        console.log("Num cycles dict");
        console.log(cycles_dict);

        for (const [key, value] of Object.entries(cycles_dict)) {
          //console.log(key, value);
          var temp = {date: key, count: value};
          num_cycles_per_day.push(temp);
          temp = {};
        }

        this.cal_data = num_cycles_per_day;
        console.log("Calendar Heatmap Data");
        console.log(this.cal_data);
      }
    }
  }
</script>
<style>
</style>
