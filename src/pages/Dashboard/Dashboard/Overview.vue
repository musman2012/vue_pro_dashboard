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
            value-format="yyyy-MM-dd"
            @input="datePicked"
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
          v-model="selected_line"
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
            <i class="nc-icon nc-money-coins text-success"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-calendar-o"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card title="23" subTitle="Downtime">
          <div slot="header" class="icon-danger">
            <i class="nc-icon nc-button-power text-danger"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-clock-o"></i>Last day
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card v-bind:title="labours_num" subTitle="Active Labours:">
          <div slot="header" class="icon-info">
            <i class="nc-icon nc-single-02 text-primary"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>
    </div>
    
    <card>
    <div class="row">
      <div class="col-md-6" id="pie_chart_parent">
        <!-- <canvas id="div_line_pie_chart">
                </canvas> -->
      </div>
    <!-- </div>
    <div class="row"> -->
      <div class="col-md-6" >
        <div id="realTimeGraph"></div>
      </div>
    </div>
    </card>

    <div class="row">
      <!-- Chart One -->

      <!-- Chart Two - To be used as backup -->
      <div class="col-md-12">
        <!-- <div id="pie_chart_parent" style="background-color: blue">
          <canvas id="div_line_pie_chart">
                </canvas> 
        </div>-->
      </div>
    </div>

    <card>
      <div class="row">
        <div class="col-md-12" >
          <div id="perfGraph"></div>
        </div>
        
      <!-- </div>
    </card>

    <card>
      <div class="row"> -->
        <div class="col-md-12" >
          <div id="perfGraphWght"></div>
        </div>
      </div>
    </card>
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
              <el-table-column prop="batch_id" label="Batch ID">
              </el-table-column>
              <el-table-column prop="recipe" label="Recipe"> </el-table-column>
              <el-table-column prop="packs_produced" label="Packs Produced">
              </el-table-column>
              <el-table-column
                label="End Time"
                property="end_time"
              ></el-table-column>
              <el-table-column label="KPI" property="kpi"></el-table-column>
              <el-table-column label="Cost Per Pack(£)" property="cost"></el-table-column>
              <el-table-column label="Actions">
                <div class="td-actions" slot-scope="props">
                  <a
                    v-tooltip.top-center="'View Graph'"
                    class="btn btn-info btn-link btn-xs"
                    href="#"
                    @click="drawRealTimeGraph(props.row.batch_id)"
                  >
                    <i class="fa fa-user"></i>
                  </a>
                  <a
                    v-tooltip.top-center="'Generate Report'"
                    class="btn btn-warning btn-link btn-xs"
                    @click="generateReport(props.row.batch_id)"
                  >
                    <i class="fa fa-edit"></i>
                  </a>
                  <!-- <a v-tooltip.top-center="'Delete'" class="btn btn-danger btn-link btn-xs"
                    @click="handleDelete(props.$index, props.row)">
                    <i class="fa fa-close"></i>
                  </a> -->
                </div>
              </el-table-column>
            </el-table>
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
  TableColumn,
} from "element-ui";
//import PaginatedTables from "../Tables/PaginatedTables.vue";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as d3 from "d3";

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
    StatsCard,
  },
  data() {
    return {
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",
      totalPacks: "140",
      labours_num: "24",
      totalCost: "$ 9,999",
      value: "",
      selected_line: "",
      batches_dict: {},
      batchesData: [],
      pieChart: {
        data: {
          labels: ["40%", "20%", "40%"],
          series: [40, 20, 40],
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
    let chart_js = document.createElement("script");
    let plotly = document.createElement("script");
    let d3 = document.createElement("script");
    let d3_colors = document.createElement("script");

    chart_js.setAttribute(
      "src",
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"
    );
    document.head.appendChild(chart_js);
    plotly.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
    document.head.appendChild(plotly);
    d3.setAttribute(
      "src",
      "https://cdnjs.cloudflare.com/ajax/libs/d3/5.9.2/d3.js"
    );
    document.head.appendChild(d3);
    d3_colors.setAttribute(
      "src",
      "https://cdnjs.cloudflare.com/ajax/libs/d3-color/1.2.1/d3-color.js"
    );
    document.head.appendChild(d3_colors);
  },
  methods: {
    filter(query) {
      // console.log("In Filter function." + query);
    },
    datePicked(d) {
      // console.log("Date picked called with " + d);
      // console.log("Selected line is " + this.selected_line);
      this.dispatch(this.selected_line);
    },
    dispatch(e) {
      // console.log("Dispathc " + e);
      // console.log("Value of date time picker is " + this.value[0]);
      this.selected_line = e;
      var bg_colors = [];
      var colors = [
        "#3e818e",
        "#444f93",
        "#17406e",
        "#1a5ba6",
        "#fcd364",
        "#fef9c0",
        "#429476",
        "#db7556",
        "#d2d38e",
        "#030508",
      ];

      axios
        .get(
          "http://18.168.19.93:5000/search?q=" +
            this.selected_line +
            "&sDate=" +
            this.value[0] +
            "&eDate=" +
            this.value[1] +
            "&recipe=*"
        )
        .then((response) => {
          var batch_tbl_data = [];
          var pie_data = [];
          var recipe_pack_count = {};
          var temp_packs = 0;
          var temp_cost = 0;
          //this.totalPacks = 0;
          console.log("Good oye@@@@@@");
          console.log(response);
          // // console.log(this.pieChart.data);
          var temp_data = response.data;
          temp_data.forEach((element) => {
            // MAKE THE WHOLE DATA ACCESSIBLE THROUGH BATCH ID
            // THIS NEW DATASET VAR WILL BE USED TO 1- DRAW GRAPH 2- GENERATE REPORT
            var source_data = element._source;
            var entry = {
              batch_id: source_data.Batch_ID,
              recipe: source_data.Recipe,
              packs_produced: source_data.Total_Packs,
              end_time: source_data.TIMESTAMP,
              kpi: source_data.KPI,
              cost: source_data.Pack_Cost
            };
            temp_packs += entry.packs_produced;
            temp_cost += source_data.Pack_Cost;
            if (entry.recipe in recipe_pack_count) {
              recipe_pack_count[entry.recipe] += entry.packs_produced;
            } else {
              recipe_pack_count[entry.recipe] = entry.packs_produced;
            }
            batch_tbl_data.push(entry);
            entry = {};
          });
          var avg_cost_bactch = temp_cost / temp_data.length;
          avg_cost_bactch = avg_cost_bactch.toFixed(2);
          this.totalPacks = temp_packs.toString();
          this.totalCost = avg_cost_bactch.toString();
          var stage = document.createElement("canvas");
          stage.setAttribute("id", "canvas" + window.counter);
          document.getElementById("pie_chart_parent").appendChild(stage);
          var myobj = stage.getContext("2d");
          if (window.counter > 0) {
            document.getElementById("canvas" + (counter - 1)).remove();
          }
          // console.log("RCP count keys:");
          for (var c = 0; c < Object.keys(recipe_pack_count).length; c++) {
            bg_colors.push(colors[c]);
          }
          // console.log(Object.keys(recipe_pack_count));
          // console.log(Object.values(recipe_pack_count));
          const data = {
            labels: Object.keys(recipe_pack_count),
            datasets: [
              {
                label: "Production w.r.t Recipes",
                data: Object.values(recipe_pack_count),
                backgroundColor: bg_colors,
                hoverOffset: 4,
                radius: 20,
              },
            ],
          };
          const self = this;
          var myChart = new Chart(myobj, {
            type: "pie",
            data: data,
            options: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Production w.r.t Lines (Hover on slices)'
              },
              onClick:function(e){
                var activePoints = myChart.getElementsAtEvent(e);
                var updated_tbl_data = [];
                console.log("Graph clikced");
                console.log(activePoints);
                var selectedIndex = activePoints[0]._index;
                console.log(selectedIndex);
                var selectedRecipe = this.data.labels[selectedIndex];
                console.log(selectedRecipe);
                console.log(self.selected_line)
                console.log(  "---" + self.value[0]);
                axios.get(
                "http://18.168.19.93:5000/search?q=" +
                  self.selected_line +
                  "&sDate=" +
                  self.value[0] +
                  "&eDate=" +
                  self.value[1] +
                  "&recipe=" +
                  selectedRecipe
              )
              .then((response) => {
                console.log("New table data fetched.")
                console.log(response.data);

                var temp_data = response.data;
                temp_data.forEach((element) => {
                  // MAKE THE WHOLE DATA ACCESSIBLE THROUGH BATCH ID
                  // THIS NEW DATASET VAR WILL BE USED TO 1- DRAW GRAPH 2- GENERATE REPORT
                  var source_data = element._source;
                  var entry = {
                    batch_id: source_data.Batch_ID,
                    recipe: source_data.Recipe,
                    packs_produced: source_data.Total_Packs,
                    end_time: source_data.TIMESTAMP,
                    kpi: source_data.KPI,
                    cost: source_data.Pack_Cost
                  };
                  
                  updated_tbl_data.push(entry);
                  entry = {};
                });
                self.batchesData = updated_tbl_data;
              });
                // console.log(this.data.datasets[0].data[selectedIndex]);
                // console.log(activePoints[0]._index);
                // console.log(this.data.datasets[0])
                
                // Call update table function here
              }
              //this.graphClicked
            //  events: ['click', 'mouseover']              
            }
          });
          myChart.resize(200, 200);
          window.counter += 1;
          // console.log("PieChart Data");

          this.batchesData = batch_tbl_data;

          // console.log(this.pieChart.data);
        });
      // this.search(e);
    },
    updateTableBody(selectedRecipe) {
        
    },
    graphClicked(event, array) {
      console.log("Graph clicked");
      console.log(event);
    },
    drawPerformanceGraphs(batchID) {
      // test this function and build upon
      axios.get("http://18.168.19.93:5000/fetchPerfData?q="+batchID)
      .then((response) => {
        var batch_ppms_2d = {};
        var batch_times_2d = {};
        var dict_check = {};
        var scales = [];
        var batch_wght_2d = {};

        var jsoned_batch_data = JSON.parse(JSON.stringify(response.data));
        console.log("JSONED Data . . . . . . ");
        console.log(jsoned_batch_data);
        
        for (var j = 0; j < jsoned_batch_data.length; j++) {
            var fields = jsoned_batch_data[j]._source;
            //window.batch_ppms.push(fields.PPM[0].toString());
            var scale = parseInt(fields.Scale);
            var avg_wght = parseInt(fields.Avg_Wght);
            avg_wght = avg_wght.toString();
            var ppm = fields.PPM.toString();
            var time_field = fields.TIMESTAMP;
            var tkns = time_field.split(" ");
            var times = tkns[1];
            if (scale in dict_check){
              batch_ppms_2d[scale].push(ppm);
              batch_times_2d[scale].push(times);
              batch_wght_2d[scale].push(avg_wght);
            }
            else {
              console.log("New scale found in data");
              console.log("Scale : "+scale+" Operator : "+fields.Op_Name);
              scales.push(scale);
              dict_check[scale] = fields.Op_Name;
              batch_ppms_2d[scale] = [ppm]; //[ppm];
              batch_times_2d[scale] = [times];
              batch_wght_2d[scale] = [avg_wght];
            }   
        }
        console.log("Dict check: ");
        console.log(dict_check);
        console.log("Batch PPMs: ");
        console.log(batch_ppms_2d);
        var data = []; var data2 = [];
        var dict_size = Object.keys(batch_ppms_2d).length;
        console.log("Size of PPMs " + dict_size);
        // this loop is not working I think
        for(var i = 0; i < dict_size; i++) {
          var index = scales[i];
          var trace = {
            x: batch_times_2d[index],
            y: batch_ppms_2d[index],
            type: "scatter",
            name: dict_check[index],
            mode: "lines"
          };
          // console.log(trace);
          data.push(trace);
          
        var trace2 = {
            x: batch_times_2d[index],
            y: batch_wght_2d[index],
            type: "scatter",
            name: dict_check[index],
            mode: "lines"
          };
          // console.log(trace2);
          data2.push(trace2);
        }
        
        var layout = {
          width: 1000,
          height: 300,
          title: "Batch Operators Performance - Batch # " + batchID,
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
          

        console.log("Data");
        console.log(data);

        console.log("Data 2");
        console.log(data2);

        Plotly.newPlot("perfGraph", data, layout);
        //.update_layout(title_font_size=2);

        this.drawWghtGraph(batchID, data2);
        // Plotly.newPlot("perfGraphWght", data2, layout)
        // .update_layout(title_font_size=2);

      });
    },
    drawWghtGraph(batchID, data2) {
        var layout = {
          width: 1000,
          height: 300,
          title: "Average Weight Operators - Batch # " + batchID,
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
            title: "Average Weight",
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
            // showexponent: "all",
            },
          };
          Plotly.newPlot("perfGraphWght", data2, layout)
          .update_layout(title_font_size=2);
    },
    drawRealTimeGraph(batchID) {
      window.batch_ppms = [];
      window.batch_times = [];
      var scale_val = 1; // TODO: We can get data from SC_AG flag where we are aggregating all PPMs
      // this scale_val can be added in a loop so that data for every scale can be fetched and plotted on the same graph
      // get Scale_QT for this Batch and this loop will run for Scale_QT times
      // ToDo: Plot User PPM and User Avg Weights
      axios
        .get(
          "http://18.168.19.93:5000/fetchBatchData?q=" +
            batchID +
            "&scale=" +
            scale_val.toString()
        ) //&sDate=01/08/2020&eDate=04/08/2020')  
        .then((response) => {
          // window.batchData = response.data;
          var jsoned_batch_data = JSON.parse(JSON.stringify(response.data));
          console.log("JSONed Data");
          console.log(jsoned_batch_data);
          for (var j = 0; j < jsoned_batch_data.length; j++) {
            var fields = jsoned_batch_data[j]._source;
            //window.batch_ppms.push(fields.PPM[0].toString());
            window.batch_ppms[j] = fields.PPM_AG.toString();
            var time_field = fields.TIMESTAMP;
            var tkns = time_field.split(" ");
            window.batch_times.push(tkns[1]);
          }
          var layout = {
            width: 510,
            height: 380,
            title: "Batch Production Data - Batch # " + batchID,
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
             // showexponent: "all",
            },
          };

          var trace1 = {
            x: window.batch_times, // ['2020-10-04', '2021-11-04', '2023-12-04'],
            y: window.batch_ppms, // [90, 40, 60],
            type: "scatter",
          };

          var data = [trace1];
          // n_times = window.batch_times;
      //    Plotly.newPlot("realTimeGraph", data, layout)
      //    .update_layout(title_font_size=2);

          
        });
        this.drawPerformanceGraphs(batchID);
        
    },
    generateReport(batchID) {
      // console.log("Generate report for batch " + batchID);
      axios
        .get("http://18.168.19.93:5000/fetchBatchReportData?q=" + batchID) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          // window.batchData = response.data;
          //// console.log(response);
          var jsoned_batch_data = JSON.parse(JSON.stringify(response.data));
          console.log("JSONED Data ........");
          console.log(jsoned_batch_data);
          var batch_end_data = [];
          var batch_start_data = [];
          var target_speed = 0;
          var batch_runtime = 0;
          var scales_ppm = {}; // this dict will be having Line leaders as keys
          var scales_t1 = {};
          var scales_kpi = {};
          var scales_sp = {};
          var scales_weight = {};

          // console.log(response.data.length);
          // values against the keys will be number of packs produced
          for (let i = 0; i < jsoned_batch_data.length; i++) {
            var scale_record = jsoned_batch_data[i]._source;
            if (scale_record.FLAG == "END") {
              batch_end_data = jsoned_batch_data[i]._source;
              batch_runtime = batch_end_data.Run_Time;
              continue;
            } else if (scale_record.FLAG == "START") {
              batch_start_data = jsoned_batch_data[i]._source;
              target_speed = batch_start_data.Speed;
              continue;
            }

            var operator = scale_record.Op_Name;
            var ppm = scale_record.PPM;
            var t1ppm = scale_record.T1PPM;
            var weight = scale_record.Avg_Wght;
            var sp = scale_record.Set_Point;
            if (operator in scales_ppm) {
              scales_ppm[operator] += ppm;
              scales_t1[operator] += t1ppm;
              scales_sp[operator] += sp;
              scales_weight[operator] += weight;
              //scales_kpi[operator] = (ppm / batch_runtime) * target_speed;
            } else if (operator != undefined) {
              scales_ppm[operator] = ppm;
              scales_t1[operator] = t1ppm;
              scales_sp[operator] = sp;
              scales_weight[operator] = weight;
            }
          }
          // console.log(batch_end_data);
          // console.log(batch_start_data);
          // console.log(scales_ppm);
          // console.log(scales_t1);
          var doc = new jsPDF();
          doc.setFont("times");
          // doc.setFont('Helvetica');
          console.log("Scales PPM:");
          console.log(scales_ppm);
          this.write_report_content(
            doc,
            batch_end_data,
            batch_start_data,
            scales_ppm,
            scales_t1,
            scales_sp,
            scales_weight,
            batch_runtime,
            target_speed
          );
          doc.save("a4.pdf");
        });

      // console.log(batchID);
    },
    addRow(table, qty, name, desc, price) {
      var tr = table.row();
      tr.cell(qty.toString());
      tr.cell("pc.");

      var article = tr.cell().text();
      article
        .add(name, { font: fonts.HelveticaBold })
        .br()
        .add(desc, { fontSize: 11, textAlign: "justify" });

      tr.cell(price.toFixed(2) + " €", { textAlign: "right" });
      tr.cell((price * qty).toFixed(2) + " €", { textAlign: "right" });
    },
    add_report_row(doc_obj, row, text_1, num_1, text_2, num_2) {
      var col_1 = 10;
      var col_2 = 100;
      doc_obj.text(text_1 + num_1, col_1, row);
      doc_obj.text(text_2 + num_2, col_2, row);
    },
    populate_table_body(
      scales_ppm,
      scales_t1,
      scales_sp,
      scales_weight,
      batch_runtime,
      target_speed
    ) {
      // compute Total_Packs, KPI %, GA, T1 % for each operator
      // Total_Packs are already in scales_ppm
      // T1 % --> (scales_t1/scales_ppm) * 100
      // GA --> Avg_Speed (scales_weight[operator]-scales_sp[operator]) / scales_ppm[operator]
      // KPI --> (Number of packs for operator / time in minutes) * Target Speed
      var table_body = [];
      window.scales_kpi = [];
      for (const [operator, ppm] of Object.entries(scales_ppm)) {
        // // console.log(key, value);
        var t1 = scales_t1[operator];
        var ga = (scales_weight[operator] - scales_sp[operator]) / ppm;
        ga = ga.toFixed(2);
        var kpi = (ppm / batch_runtime) * target_speed;
        console.log(
          "PPM " + ppm + " RT " + batch_runtime + " Target " + target_speed
        );
        kpi = kpi.toFixed(2);
        window.scales_kpi.push(kpi);
        var t1_perc = (t1 / ppm) * 100;
        table_body.push([operator, ppm, kpi, ga, t1_perc]);
        //var temp = [key, value];
      }
      return table_body;
    },
    write_report_content(
      doc_obj,
      data,
      st_data,
      scales_ppm,
      scales_t1,
      scales_sp,
      scales_weight,
      batch_runtime,
      target_speed
    ) {
      // defing colors columns and rows
      let l_yellow = "FFFFCC",
        l_orange = "FFE5CC",
        l_gray = "E0E0E0",
        l_blue = "CCE5FF";

      var row_indent = 7;
      var row_1 = 40;
      var row_2 = row_1 + row_indent;
      var row_3 = row_2 + 10;
      var block_one = row_1,
        block_two = row_2 + row_indent;
      var tbl_row = block_two + 5 * row_indent;
      var tbl_width = 100;
      var bar_chart_col = 110;
      var bar_chart_row = tbl_row + 13;
      var block_three = -99;
      var block_four = block_three + 7 * row_indent;

      var col_1 = 10;
      var col_2 = 100;
      var h_line_size = 200;
      var rect_width = 190;
      var rect_height = 10 * 2;

      // setting up the header with line lengths
      doc_obj.setLineWidth(0.35);
      doc_obj.line(10, 10, h_line_size, 10);
      doc_obj.addImage("static/img/MiWeigh_Large.png", "PNG", 10, 10, 40, 17);
      doc_obj.setTextColor(100, 140, 80);
      doc_obj.setFontSize(30);
      doc_obj.text("Batch Report", 75, 25);
      doc_obj.addImage("static/img/pa_logo.png", "PNG", 180, 10, 18, 18);
      // Block one in report
      doc_obj.line(10, 30, h_line_size, 30);
      doc_obj.setFontSize(11);
      doc_obj.setTextColor(0, 0, 0);
      doc_obj.setFillColor(l_gray);

      var table_body = this.populate_table_body(
        scales_ppm,
        scales_t1,
        scales_sp,
        scales_weight,
        batch_runtime,
        target_speed
      );

      // block one rectangle - rows = 2
      doc_obj.setDrawColor(0, 0, 0);
      doc_obj.rect(col_1 - 3, row_1 - 5, rect_width, row_indent * 2, "FD");
      this.add_report_row(
        doc_obj,
        row_1,
        "Report for Batch: ",
        data.Batch_ID,
        "KPI: ",
        data.KPI
      );
      this.add_report_row(
        doc_obj,
        row_2,
        "Date & Time: ",
        data.TIMESTAMP,
        "Recipe: ",
        data.Recipe
      );

      // block two rectangle - rows = 4
      doc_obj.setFillColor(l_blue);
      doc_obj.rect(col_1 - 3, block_two + 2, rect_width, row_indent * 4, "FD");
      // Block two in report
      this.add_report_row(
        doc_obj,
        block_two + row_indent,
        "Batch Runtime: ",
        data.Run_Time,
        "Total Packs Produced: ",
        data.Total_Packs
      );
      this.add_report_row(
        doc_obj,
        block_two + 2 * row_indent,
        "Start Line Leader: ",
        st_data.Line_Leader,
        "End Line Leader: ",
        data.Line_Leader
      );
      this.add_report_row(
        doc_obj,
        block_two + 3 * row_indent,
        "Target Speed: ",
        st_data.Speed,
        "Num of Operators: ",
        st_data.Operator_Qt
      );
      this.add_report_row(
        doc_obj,
        block_two + 4 * row_indent,
        "Tolerance: ",
        st_data.Tolerance,
        "Num of Scales: ",
        st_data.Scale_Qt
      );

      // doc_obj.line(10, 130, h_line_size, 130);

      doc_obj.autoTable({
        head: [["Name", "Total Packs", "KPI %", "GA g", "T1 %"]],
        startY: tbl_row,
        body: table_body,
        columnStyles: { 0: {cellWidth: 25},
                  1: {cellWidth: 20},
                  2: {cellWidth: 20},
                  3: {cellWidth: 15},
                  4: {cellWidth: 15} },
        theme: "grid",
      });

      // adding bar charts to the report
      for (let i = 0; i < window.scales_kpi.length; i++) {
        doc_obj.setDrawColor(0);
        doc_obj.setFillColor("CC0000");
        var kpi = window.scales_kpi[i];
        if (kpi > 100) {
          doc_obj.setFillColor("4C9900");
        }
        if (kpi > 0) {
            doc_obj.rect(
            bar_chart_col,
            bar_chart_row + i * 8,
            Math.floor(kpi * 0.7),
            4,
            "F"
          ); // filled red square
        }
        block_three = bar_chart_row + i * 8 + row_indent;
      }
      // rect(starting_x, starting_y, width, height, 'F')
      //doc_obj.text('Batch Report Ends', col_1, block_three + row_indent);

      doc_obj.setFillColor(l_blue);
      doc_obj.rect(col_1 - 3, block_three, rect_width, row_indent * 6, "FD");
      // Block two in report
      this.add_report_row(
        doc_obj,
        block_three + row_indent,
        "Total Packs: ",
        data.Total_Packs,
        "Cost / Pack: £",
        data.Pack_Cost
      );
      this.add_report_row(
        doc_obj,
        block_three + 2 * row_indent,
        "Average Speed: ",
        data.Pack_Cost,
        "GA Cost: £",
        data.Ga_Cost
      );
      this.add_report_row(
        doc_obj,
        block_three + 3 * row_indent,
        "Total KPI%: ",
        data.Avg_Speed,
        "Product Cost: £",
        data.Prd_Cost
      );
      this.add_report_row(
        doc_obj,
        block_three + 4 * row_indent,
        "-T1 Final: ",
        data.AvT1,
        "Labour Cost: £",
        data.Lbr_Cost
      );
      this.add_report_row(
        doc_obj,
        block_three + 5 * row_indent,
        "Average Weight: ",
        data.Avg_Wght,
        "Total Cost: £",
        data.Total_Cost
      );

      block_four = block_three + 8 * row_indent;
      doc_obj.setFillColor(l_yellow);
      doc_obj.rect(col_1 - 3, block_four - 3, rect_width, row_indent * 2, "FD");
      doc_obj.text(
        "Notes: _____________________",
        col_1,
        block_four + row_indent
      );
      doc_obj.text(
        "Signature: _____________________",
        col_2,
        block_four + row_indent
      );

      return doc_obj;
    },
    search(Line) {
      axios
        .get("http://18.168.19.93:5000/search?q=" + Line) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          // console.log("Good oye@@@@@@");

          this.data2 = response.data;
          return true;
        });
    },
    drawGraphs() {
      // console.log("Dispathc " + e);
    },
  },
};
</script>
<style>
</style>
