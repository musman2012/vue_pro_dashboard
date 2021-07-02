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
        <stats-card title="150GB" subTitle="Total Packs">
          <div slot="header" class="icon-warning">
            <i class="nc-icon nc-chart text-warning"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-refresh"></i>Updated now
          </template>
        </stats-card>
      </div>

      <div class="col-xl-3 col-md-6">
        <stats-card title="$ 1,345" subTitle="Total Cost">
          <div slot="header" class="icon-success">
            <i class="nc-icon nc-light-3 text-success"></i>
          </div>
          <template slot="footer">
            <i class="fa fa-calendar-o"></i>Last day
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
      <div class="col-md-4">
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
      </div>

      <div class="col-md-8">
        <chart-card
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
        </chart-card>
      </div>
    </div>

    

    <div class="row">
      <!-- Chart One -->
      

      <!-- Chart Two - To be used as backup -->
      <div class="col-md-6">
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
            <el-table class="table-striped" :data="batchesData">
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
            </el-table>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
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
      value: '',
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
  methods: {
    filter(query) {
      console.log("In Filter function." + query);
    },
    dispatch(e) {
      console.log("Dispathc " + e);
      console.log("Value of date time picker is "+this.value[0])
      axios
        .get("http://18.168.19.93:5000/search?q=" + e+"&sDate="+this.value[0]+"&eDate="+this.value[1])
        .then((response) => {
          var batch_tbl_data = [];
          var pie_data = [];
          var recipe_pack_count = {};
          console.log("Good oye@@@@@@");
          console.log(this.pieChart.data);
          var temp_data = response.data;
          temp_data.forEach(element => {
            var source_data = element._source;
            var entry = {
              batch_id: source_data.Batch_ID,
              recipe: source_data.Recipe,
              packs_produced: source_data.Total_Packs,
              end_time: source_data.TIMESTAMP,
              kpi: source_data.KPI
            };
            if (entry.recipe in recipe_pack_count){
                recipe_pack_count[entry.recipe] += entry.packs_produced;
            }
            else{
                recipe_pack_count[entry.recipe] = entry.packs_produced;
            }
            batch_tbl_data.push(entry);
            entry = {};
          });
          
          console.log("PieChart Data");
          // console.log(batch_tbl_data);
          // console.log(this.pieChart.data);
          this.batchesData = batch_tbl_data;
          this.pieChart.data.labels = [];
          this.pieChart.data.series = [];
          Object.keys(recipe_pack_count).forEach(key => {
            this.pieChart.data.labels.push(key);
            this.pieChart.data.series.push(recipe_pack_count[key]);
          });
          console.log(this.pieChart.data);
          // console.log("Batches Data");
          // console.log(this.batchesData);
          
        });
     // this.search(e);
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
