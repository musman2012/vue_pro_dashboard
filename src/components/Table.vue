<template>
  <div>
    <table class="table">
      <thead>
        <slot name="columns">
          <th v-for="column in columns">{{column}}</th>
        </slot>
      </thead>
      <tbody>
      <tr v-for="item in data">
        <slot :row="item">
          <td v-for="column in columns" v-if="hasValue(item, column)">{{itemValue(item, column)}}</td>
        </slot>
      </tr>
      </tbody>
    </table>
    <div v-if="searchES()">{{data2}}</div>
  </div>
</template>
<script>
  import axios from 'axios';

  export default {
    name: 'l-table',
    props: {
      columns: Array,
      data: Array,
      data2: Array
    },
    methods: {
      hasValue (item, column) {
        return item[column.toLowerCase()] !== 'undefined'
      },
      itemValue (item, column) {
        return item[column.toLowerCase()]
      },
      searchES() {
            axios.get('http://18.168.19.93:5000/search?q=Line 3')//&sDate=01/08/2020&eDate=04/08/2020')
                .then(response => {
                  console.log("Good oye@@@@@@")
                  console.log(response)
                  this.data2 = response.data;
                  return true
            })
            
      }
    }
  }
</script>
<style>
</style>
