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
      <div class="col-md-12" id="pie_chart_parent">
        <!-- <canvas id="div_line_pie_chart">
                </canvas> -->
      </div>
    </div>
    <div class="row">
      <div class="col-md-8" style="margin: 70px">
        <div id="realTimeGraph"></div>
      </div>
    </div>

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
import 'jspdf-autotable';
import { scale } from 'd3';

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
      totalCost: "$ 9,999",
      value: "",
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
    chart_js.setAttribute(
      "src",
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"
    );
    document.head.appendChild(chart_js);
    plotly.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
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
            e +
            "&sDate=" +
            this.value[0] +
            "&eDate=" +
            this.value[1]
        )
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
          console.log("RCP count keys:");
          for (var c = 0; c < Object.keys(recipe_pack_count).length; c++) {
            bg_colors.push(colors[c]);
          }
          console.log(Object.keys(recipe_pack_count));
          console.log(Object.values(recipe_pack_count));
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
          var myChart = new Chart(myobj, {
            type: "pie",
            data: data,
          });
          myChart.resize(200, 200);
          window.counter += 1;
          console.log("PieChart Data");

          this.batchesData = batch_tbl_data;

          console.log(this.pieChart.data);
        });
      // this.search(e);
    },
    drawRealTimeGraph(batchID) {
      window.batch_ppms = [];
      window.batch_times = [];
      var scale_val = 1; // TODO: this scale_val can be added in a loop so that data for every scale can be fetched and plotted on the same graph
      // get Scale_QT for this Batch and this loop will run for Scale_QT times
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
            window.batch_ppms[j] = fields.PPM.toString();
            var time_field = fields.TIMESTAMP;
            var tkns = time_field.split(" ");
            window.batch_times.push(tkns[1]);
          }
          var layout = {
            title: "Realtime Batch Production Data - Batch ID::" + batchID,
            xaxis: {
              title: "Time",
              titlefont: {
                family: "Arial, sans-serif",
                size: 13,
                color: "lightgrey",
              },
              showticklabels: true,
              tickangle: 45,
              tickfont: {
                family: "Old Standard TT, serif",
                size: 11,
                color: "black",
              },
              //exponentformat: 'e',
              showexponent: "all",
            },
            yaxis: {
              title: "Number of Packs",
              titlefont: {
                family: "Arial, sans-serif",
                size: 13,
                color: "lightgrey",
              },
              showticklabels: true,
              tickangle: 45,
              tickfont: {
                family: "Old Standard TT, serif",
                size: 11,
                color: "black",
              },
              exponentformat: "e",
              showexponent: "all",
            },
          };

          var trace1 = {
            x: window.batch_times, // ['2020-10-04', '2021-11-04', '2023-12-04'],
            y: window.batch_ppms, // [90, 40, 60],
            type: "scatter",
          };

          var data = [trace1];
          // n_times = window.batch_times;
          Plotly.newPlot("realTimeGraph", data, layout, { scrollZoom: true });
        });
    },
    generateReport(batchID) {
      console.log("Generate report for batch " + batchID);
      axios
        .get("http://18.168.19.93:5000/fetchBatchReportData?q=" + batchID) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          // window.batchData = response.data;
          //console.log(response);
          var jsoned_batch_data = JSON.parse(JSON.stringify(response.data));
          var batch_end_data = jsoned_batch_data[0]._source;
          var batch_start_data = jsoned_batch_data[1]._source;
          var scale_used = batch_start_data.Scale_Qt;
          var scales_ppm = {}; // this dict will be having Line leaders as keys 
          var scales_t1 = {};
          console.log(jsoned_batch_data.length);
          console.log(response.data.length);
          // values against the keys will be number of packs produced
          for (let i = 2; i < jsoned_batch_data.length; i++) {
              var scale_record = jsoned_batch_data[i]._source;
              var operator = scale_record.Op_Name;
              var ppm = scale_record.PPM; var t1ppm = scale_record.T1PPM;
              if(operator in scales_ppm){
                  scales_ppm[operator] += ppm;
                  scales_t1[operator] += t1ppm;
              }
              else{
                scales_ppm[operator] = ppm;
                scales_t1[operator] = t1ppm;
              }
          }
          console.log(batch_end_data);
          console.log(scales_ppm); 
          console.log(scales_t1);
          var doc = new jsPDF();
          doc.setFont("times");
          // doc.setFont('Helvetica');
          this.write_report_content(doc, batch_end_data, scales_ppm, scales_t1);
          doc.save("a4.pdf");
        });

      console.log(batchID);
    },
    addRow(table, qty, name, desc, price){
      var tr = table.row()
      tr.cell(qty.toString())
      tr.cell('pc.')

      var article = tr.cell().text()
      article.add(name, { font: fonts.HelveticaBold })
            .br()
            .add(desc, { fontSize: 11, textAlign: 'justify' })

      tr.cell(price.toFixed(2) + ' €', { textAlign: 'right' })
      tr.cell((price * qty).toFixed(2) + ' €', { textAlign: 'right' })
    },
    add_report_row(doc_obj, row, text_1, num_1, text_2, num_2) {
        var col_1 = 10; var col_2 = 100;
        doc_obj.text(text_1 + num_1, col_1, row);
        doc_obj.text(text_2 + num_2, col_2, row);
    },
    populate_table_body(scales_ppm, scales_t1) {
        var table_body = [];
        for (const [key, value] of Object.entries(scales_ppm)) {
          // console.log(key, value);
          table_body.push([key, value]);
          //var temp = [key, value];
        }
        return table_body;
    },
    write_report_content(doc_obj, data, scales_ppm, scales_t1) {
      // .text("text to write", text_x, text_y)
      // var unit = 2;
      // var table = doc_obj
      //   .table({ widths: [1.5*unit, 1.5*unit, null, 2*unit, 2.5*unit],
      //   borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
      //   padding: 5 });

      //   var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
      //               tr.cell('#')
      //               tr.cell('Unit')
      //               tr.cell('Subject')
      //               tr.cell('Price', { textAlign: 'right' })
      //               tr.cell('Total', { textAlign: 'right' });

      // this.addRow(table, 2, 'Article A', lorem, 500)
      // this.addRow(table, 1, 'Article B', lorem, 250)
      // header.cell().image("static/img/MiWeigh_Large.png", { height: 2 * unit });
      // header
      //   .cell()
      //   .text({ textAlign: "right" })
      //   .add(
      //     "A Portable Document Format (PDF) generation library targeting both the server- and client-side."
      //   );
      
      // defing colors columns and rows
      let l_yellow = 'FFFFCC', l_orange = 'FFE5CC', l_gray = 'E0E0E0', l_blue = 'CCE5FF';
      
      var row_1 = 40;
      var row_2 = row_1 + 10;
      var row_3 = row_2 + 10;
      var tbl_row = row_3 + 70; var tbl_width = 100;
      var bar_chart_col = 115; var bar_chart_row = tbl_row + 13;

      var col_1 = 10;
      var col_2 = 100;
      var h_line_size = 200;
      var rect_width = 200; var rect_height = 10 * 2;
      
      // setting up the header with line lengths
      doc_obj.setLineWidth(0.35);
      doc_obj.line(10, 10, h_line_size, 10);
      doc_obj.addImage("static/img/MiWeigh_Large.png", "PNG", 10, 10, 40, 20);
      doc_obj.setTextColor(100,140,80);
      doc_obj.setFontSize(30);
      doc_obj.text('Batch Report', 80, 20);
      // Block one in report
      doc_obj.line(10, 30, h_line_size, 30);
      doc_obj.setFontSize(11);
      doc_obj.setTextColor(0,0,0);
      doc_obj.setFillColor(l_gray);

      var table_body = this.populate_table_body(scales_ppm, scales_t1);
      
      // block one rectangle - rows = 2
      doc_obj.rect(col_1 - 5, row_1 - 5, rect_width, 10 * 2, "F");
      this.add_report_row(doc_obj, row_1, "Report for Batch: ", data.Batch_ID, "KPI: ", data.KPI);
      this.add_report_row(doc_obj, row_2, "Date & Time: ", data.TIMESTAMP, "Recipe: ", data.Recipe);

      // block two rectangle - rows = 4
      doc_obj.setFillColor(l_blue);
      doc_obj.rect(col_1 - 5, row_3 + 15, rect_width, 10 * 4, "F");
      // Block two in report
      this.add_report_row(doc_obj, row_3 + 20, "Batch Runtime: ", data.Run_Time, "Total Packs Produced: ", data.Total_Packs);
      this.add_report_row(doc_obj, row_3 + 30, "Cost Per Pack: ", data.Pack_Cost, "End Line Leader: ", data.Line_Leader);
      this.add_report_row(doc_obj, row_3 + 40, "Average Speed: ", data.Avg_Speed, "Average Weight: ", data.Avg_Wght);
      this.add_report_row(doc_obj, row_3 + 50, "Average T1: ", data.AvT1, "Labour Cost: ", data.Lbr_Cost);

      doc_obj.line(10, 130, h_line_size, 130);

//      doc_obj.autoTable({})

      // Or use javascript directly:
      doc_obj.autoTable({
        head: [['Name', 'Total Packs', 'KPI %', 'GA g', 'T1 %']],
        startY: tbl_row,
       // tableWidth = 100,
        // body: [
        //   ['Sandra', 234, 71, 0, 15.8],
        //   ['Gheorgita', 221, 67, 0, 14.0],
        //   ['Maghda', 194, 61, 0, 21.8]
        //   // ...
        // ],
        body: table_body,
        styles: { cellWidth: 20 },
      })
      doc_obj.setDrawColor(0);
      doc_obj.setFillColor('3399FF');
      // rect(starting_x, starting_y, width, height, 'F')
      doc_obj.rect(bar_chart_col, bar_chart_row,Math.floor(75 * 0.8), 4, "F"); // filled red square
      doc_obj.rect(bar_chart_col, bar_chart_row + 8, Math.floor(55 * 0.8), 4, "F");
      doc_obj.rect(bar_chart_col, bar_chart_row + 16, Math.floor( 100* 0.8), 4, "F");

      return doc_obj;
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
