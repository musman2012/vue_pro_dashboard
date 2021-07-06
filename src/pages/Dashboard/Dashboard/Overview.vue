<template>
  <div>
    <div class="row">
      <!-- <div class="col-md-6"> -->
      <div class="col-lg-4">
        <h5 class="title">Select Starting and Ending Date</h5>
        <fg-input>
          <el-date-picker
            v-model="value"
            type="daterange"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            value-format = "yyyy-MM-dd"
          >
          </el-date-picker>
        </fg-input>
      </div>

      <div class="col-md-6">
        <h5 class="title">Select Production Line</h5>
        <el-select
          @input="dispatch"
          class="select-danger"
          :remote-method="filter"
          size="large"
          placeholder="Select Line"
          v-model="line_names.simple"
        >
          <el-option
            v-for="option in line_names.fetched_lines"
            class="select-danger"
            :value="option.value"
            :label="option.label"
            :key="option.label"
          >
          </el-option>
        </el-select>
      </div>

      
    </div>
    <div class="row">
      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="totalPacks" subTitle="Total Packs">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-chart text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="totalCost" subTitle="Avg Pack Cost Per Batch">
          <div slot="header" class="icon-success">
            <i class="nc-icon nc-light-3 text-success"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-calendar-o"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card title="23" subTitle="Downtime">
          <div slot="header" class="icon-danger">
            <i class="nc-icon nc-vector text-danger"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-clock-o"></i>Last day
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card title="+45K" subTitle="System Health">
          <div slot="header" class="icon-info">
            <i class="nc-icon nc-favourite-28 text-primary"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>
    </div>

    <div class="row">
      <!-- This is the code for piechart -->
      <!-- <div class="col-md-4">
        <chart-card :chart-data="pieChart.data" chart-type="Pie">
          <template slot="header">
            <h4 class="card-title">Packs per recipe</h4>
            <p class="card-category">
              Distribution of packs produced w.r.t recipes
            </p>
          </template>
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-info"></i> Open
              <i class="fa fa-circle text-danger"></i> Bounce
              <i class="fa fa-circle text-warning"></i> Unsubscribe
            </div>
            <hr />
            <div class="stats">
              <i class="fa fa-clock-o"></i> Campaign sent 2 days ago
            </div>
          </template>
        </chart-card>
      </div> -->
      <div class="col-md-12" id="pie_chart_parent">
                <!-- <canvas id="div_line_pie_chart">
                </canvas> -->
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <!-- <chart-card
          :chart-data="lineChart.data"
          :chart-options="lineChart.options"
        >
          <template slot="header">
            <h4 class="card-title">Packs Per Minute</h4>
            <p class="card-category">24 Hours performance</p>
          </template>
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-info"></i> Open
              <i class="fa fa-circle text-danger"></i> Click
              <i class="fa fa-circle text-warning"></i> Click Second Time
            </div>
            <hr />
            <div class="stats">
              <i class="fa fa-history"></i> Updated 3 minutes ago
            </div>
          </template>
        </chart-card> -->
        <div id="realTimeGraph"></div>
      </div>
    </div>

    

    <div class="row">
      <!-- Chart One -->
      

      <!-- Chart Two - To be used as backup -->
      <div class="col-md-12">
        <div id="pie_chart_parent" style="background-color: blue">
          <!-- <canvas id="div_line_pie_chart">
                </canvas> -->
        </div>
      </div>
    </div>
 
    <!-- change data on Dropdown select and see if graphs/tables are updated -->
    <!-- we can use v-bind:key to batch id -- Better to use a Batches Data attribute to use everywhere -->
    <div class="row">
      <div class="col-md-12">
        <card>
          <div slot="header">
            <h4 class="card-title">Batches Data table</h4>
          </div>
          <div class="table-responsive table-full-width">
            
            <el-table :data="batchesData">
              <!-- <el-table-column type="index">

              </el-table-column> -->
              <el-table-column prop="batch_id"
                              label="Batch ID">
              </el-table-column>
              <el-table-column prop="recipe"
                              label="Recipe">
              </el-table-column>
              <el-table-column prop="packs_produced"
                              label="Packs Produced">
              </el-table-column>
              <el-table-column label="End Time"
                property="end_time"
              ></el-table-column>
              <el-table-column label="KPI" property="kpi"></el-table-column>
              <el-table-column
                label="Actions">
                <div class="td-actions" slot-scope="props">
                  <a v-tooltip.top-center="'View Graph'" class="btn btn-info btn-link btn-xs" href="#"
                    @click="drawRealTimeGraph(props.row.batch_id)">
                    <i class="fa fa-user"></i>
                  </a>
                  <a v-tooltip.top-center="'Generate Report'" class="btn btn-warning btn-link btn-xs"
                    @click="generateReport(props.row.batch_id)">
                    <i class="fa fa-edit"></i>
                  </a>
                  <!-- <a v-tooltip.top-center="'Delete'" class="btn btn-danger btn-link btn-xs"
                    @click="handleDelete(props.$index, props.row)">
                    <i class="fa fa-close"></i>
                  </a> -->
                </div>
              </el-table-column>
            </el-table>
            
            <!-- <el-table class="table-striped" :data="batchesData">
              <el-table-column
                label="Batch_ID"
                property="batch_id"
              ></el-table-column>
              <el-table-column
                label="Recipe"
                property="recipe"
              ></el-table-column>
              <el-table-column
                label="Packs_Produced"
                property="packs_produced"
              ></el-table-column>
              <el-table-column
                label="End_Time"
                property="end_time"
              ></el-table-column>
              <el-table-column label="KPI" property="kpi"></el-table-column>
            </el-table> -->
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
//Vue.loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js")
window.counter = 0;
window.selectedBatch = -99;
import {
  ChartCard,
  StatsCard,
  Card,
  Table as LTable,
  Checkbox,
} from "src/components/index";
//import Dropdown from 'src/components/Dropdown'
// import Dropdown from "../../../components/Dropdown.vue";
import {
  DatePicker,
  TimeSelect,
  Slider,
  Tag,
  Input,
  Button,
  Select,
  Option,
  Table, 
  TableColumn
} from "element-ui";
//import PaginatedTables from "../Tables/PaginatedTables.vue";
import axios from "axios";

export default {
  components: {
    Checkbox,
    Card,
    LTable,
    ChartCard,
    // Select,
    [DatePicker.name]: DatePicker,
    [TimeSelect.name]: TimeSelect,
    [Slider.name]: Slider,
    [Option.name]: Option,
    [Select.name]: Select,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    StatsCard
  },
  data() {
    return {
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",
      totalPacks: "140",
      totalCost: "$ 9,999",
      value: '',
      batches_dict: {},
      batchesData: [
          {
            batch_id: 1,
            recipe: "Dakota Rice",
            packs_produced: 2352,
            end_time: "12/02/2999 12:23",
            kpi: 0.6,
          },
          {
            batch_id: 2,
            recipe: "Mineroia Rice",
            packs_produced: 23152,
            end_time: "12/03/2999 12:23",
            kpi: 0.3,
          },
        ],
      pieChart: {
        data: {
          labels: ["40%", "20%", "40%"],
          series: [40, 20, 40],
        },
      },
      lineChart: {
        data: {
          labels: [
            "9:00AM",
            "12:00AM",
            "3:00PM",
            "6:00PM",
            "9:00PM",
            "12:00PM",
            "3:00AM",
            "6:00AM",
          ],
          series: [
            [287, 385, 490, 492, 554, 586, 698, 695],
            [67, 152, 143, 240, 287, 335, 435, 437],
            [23, 113, 67, 108, 190, 239, 307, 308],
          ],
        },
        options: {
          low: 0,
          high: 800,
          showArea: false,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: true,
          chartPadding: {
            right: 50,
          },
        },
      },
      line_names: {
        simple: "",
        fetched_lines: [
          { value: "Line 3", label: "Line 3" },
          { value: "Line2 PA Local", label: "Line2 PA Local" },
          { value: "PPMA Mw", label: "PPMA Mw" },
          { value: "Kitchen", label: "Kitchen" },
        ],
      },
    };
  },
  mounted() {
      let chart_js = document.createElement('script');
      let plotly = document.createElement('script');
      chart_js.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js');
      document.head.appendChild(chart_js);
      plotly.setAttribute('src', 'https://cdn.plot.ly/plotly-latest.min.js');
      document.head.appendChild(plotly);
  },
  methods: {
    filter(query) {
      console.log("In Filter function." + query);
    },
    dispatch(e) {
      console.log("Dispathc " + e);
      console.log("Value of date time picker is " + this.value[0]);
      var bg_colors = [];
      var colors = ['#3e818e', '#444f93', '#17406e', '#1a5ba6', '#fcd364', '#fef9c0', '#429476', '#db7556','#d2d38e','#030508']

      axios
        .get("http://18.168.19.93:5000/search?q=" + e+"&sDate="+this.value[0]+"&eDate="+this.value[1])
        .then((response) => {
          var batch_tbl_data = [];
          var pie_data = [];
          var recipe_pack_count = {};
          var temp_packs = 0;
          var temp_cost = 0;
          //this.totalPacks = 0;
          console.log("Good oye@@@@@@");
         // console.log(this.pieChart.data);
          var temp_data = response.data;
          temp_data.forEach(element => {
            // MAKE THE WHOLE DATA ACCESSIBLE THROUGH BATCH ID
            // THIS NEW DATASET VAR WILL BE USED TO 1- DRAW GRAPH 2- GENERATE REPORT
            var source_data = element._source;
            var entry = {
              batch_id: source_data.Batch_ID,
              recipe: source_data.Recipe,
              packs_produced: source_data.Total_Packs,
              end_time: source_data.TIMESTAMP,
              kpi: source_data.KPI
            };
            temp_packs += entry.packs_produced;
            temp_cost += source_data.Pack_Cost;
            if (entry.recipe in recipe_pack_count){
                recipe_pack_count[entry.recipe] += entry.packs_produced;
            }
            else{
                recipe_pack_count[entry.recipe] = entry.packs_produced;
            }
            batch_tbl_data.push(entry);
            entry = {};
          });
          var avg_cost_bactch = temp_cost/temp_data.length;
          avg_cost_bactch = avg_cost_bactch.toFixed(2)
          this.totalPacks = temp_packs.toString();
          this.totalCost = avg_cost_bactch.toString();
          var stage = document.createElement('canvas');
          stage.setAttribute('id', 'canvas' + window.counter);
          document.getElementById("pie_chart_parent").appendChild(stage);
          var myobj = stage.getContext("2d");
          if (window.counter > 0){
              document.getElementById('canvas' + (counter -1 )).remove();
          }
          console.log("RCP count keys:")
          for (var c = 0; c < Object.keys(recipe_pack_count).length; c++) {
                    bg_colors.push(colors[c]);
          }
          console.log(Object.keys(recipe_pack_count));
          console.log(Object.values(recipe_pack_count));
          window.myChart = new Chart(myobj, { type: 'pie', data: 
                    {labels: Object.keys(recipe_pack_count), datasets: [{
                        data: Object.values(recipe_pack_count),// rcp_vals,
                        backgroundColor: bg_colors
                    }]}
                    , 
                    options: {
                       // responsive: true,
                        title: {
                        display: true,
                        text: "World Wide Wine Production 2018"
                    }} 
          });
          window.counter += 1;
          console.log("PieChart Data");
          // console.log(batch_tbl_data);
          // console.log(this.pieChart.data);
          this.batchesData = batch_tbl_data;

          // this.pieChart.data.labels = [];
          // this.pieChart.data.series = [];
          // Object.keys(recipe_pack_count).forEach(key => {
          //   this.pieChart.data.labels.push(key);
          //   this.pieChart.data.series.push(recipe_pack_count[key]);
          // });

          console.log(this.pieChart.data);
          // console.log("Batches Data");
          // console.log(this.batchesData);
          
        });
     // this.search(e);
    },
    drawRealTimeGraph(batchID){
      window.batch_ppms = [];
      window.batch_times = [];
      var scale_val = 1;      // this scale_val can be added in a loop so that data for every scale can be fetched and plotted on the same graph
      // get Scale_QT for this Batch and this loop will run for Scale_QT times
        axios
        .get("http://18.168.19.93:5000/fetchBatchData?q=" + batchID+"&scale="+scale_val.toString()) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
         // window.batchData = response.data;
                var jsoned_batch_data = JSON.parse(JSON.stringify(response.data))
                console.log("JSONed Data");
                console.log(jsoned_batch_data);
                for (var j = 0; j < jsoned_batch_data.length; j++) {
                    var fields = jsoned_batch_data[j]._source;
                    //window.batch_ppms.push(fields.PPM[0].toString());
                    window.batch_ppms[j] = fields.PPM.toString();
                    var time_field = fields.TIMESTAMP;
                    var tkns = time_field.split(" ");
                    window.batch_times.push(tkns[1]);
                }
                var layout = {
                    title: 'Realtime Batch Production Data - Batch ID::' + batchID,
                    xaxis: {
                        title: 'Time',
                        titlefont: { family: 'Arial, sans-serif', size: 18, color: 'lightgrey' },
                        showticklabels: true,
                        tickangle: 'auto',
                        tickfont: { family: 'Old Standard TT, serif', size: 14, color: 'black' },
                        //exponentformat: 'e',
                        showexponent: 'all'
                    },
                    yaxis: {
                        title: 'Number of Packs',
                        titlefont: { family: 'Arial, sans-serif', size: 18, color: 'lightgrey' },
                        showticklabels: true,
                        tickangle: 45,
                        tickfont: { family: 'Old Standard TT, serif', size: 14, color: 'black' },
                        exponentformat: 'e',
                        showexponent: 'all'
                    }
                };
                
                var trace1 = {
                    x: window.batch_times,// ['2020-10-04', '2021-11-04', '2023-12-04'],
                    y: window.batch_ppms,// [90, 40, 60],
                    type: 'scatter'
                };

                var data = [trace1];
               // n_times = window.batch_times;
                Plotly.newPlot('realTimeGraph', data, layout, { scrollZoom: true });

            })
    },
    generateReport(batchID){
      console.log("Generate report for batch " + batchID);
      console.log(batchID);
    },
    search(Line) {
      axios
        .get("http://18.168.19.93:5000/search?q=" + Line) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          console.log("Good oye@@@@@@");
          
          this.data2 = response.data;
          return true;
        });
    },
    drawGraphs() {
      console.log("Dispathc " + e);
    },
  },
};
</script>
<style>
</style>
