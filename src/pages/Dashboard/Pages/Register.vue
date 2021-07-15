<template>
  <auth-layout pageClass="register-page">
    <div class="row d-flex justify-content-center">
      <div class="col-md-8">
        <div class="header-text">
          <h2>Welcome to the Data Connection Dashboard</h2>
          <h4>Register yourself with providing details</h4>
          <hr>
        </div>
      </div>
      <div class="col-md-5 ml-auto">
        <fade-render-transition :duration="200">
          <div class="media">
            <div class="media-left">
              <div class="icon">
                <i class="nc-icon nc-circle-09"></i>
              </div>
            </div>
            <div class="media-body">
              <h4>Easy Onboarding</h4>
              <p>You can quickly provide details and get started with diving deep into your comapny's data</p>
            </div>
          </div>
        </fade-render-transition>
        <fade-render-transition :delay="200" :duration="200">
          <div class="media">
            <div class="media-left">
              <div class="icon">
                <i class="nc-icon nc-preferences-circle-rotate"></i>
              </div>
            </div>
            <div class="media-body">
              <h4>Improved Productivity</h4>
              <p>With having acess to the high-level production details and the ability to zoom in to the single production event, you can improve productivity.</p>
            </div>
          </div>
        </fade-render-transition>
        <!-- <fade-render-transition :delay="400" :duration="200">
          <div class="media">
            <div class="media-left">
              <div class="icon">
                <i class="nc-icon nc-planet"></i>
              </div>
            </div>
            <div class="media-body">
              <h4>Global Support</h4>
              <p>Here you can write a feature description for your dashboard, let the users know what is the value that you give them.</p>
            </div>
          </div>
        </fade-render-transition> -->
      </div>
      <div class="col-md-4 mr-auto">
        <form method="#" action="#">
          <card class="card-plain">
            <div>
              <fg-input placeholder="Your Name" v-model="name"></fg-input>
              <!-- <fg-input placeholder="Your Last Name"></fg-input> -->
              <fg-input placeholder="Company" v-model="company"></fg-input>
              <fg-input placeholder="Email" type="email" v-model="email"></fg-input>
              <fg-input placeholder="Password" type="password" v-model="password"></fg-input>
              <fg-input placeholder="Password confirmation" type="password"></fg-input>
            </div>
            <div class="text-center">
              <button v-on:click="submit()" type="submit" class="btn btn-fill btn-default btn-neutral btn-wd">Create Free Account</button>
            </div>
          </card>
        </form>
      </div>
    </div>
  </auth-layout>
</template>
<script>
  import { FadeRenderTransition } from 'src/components/index'
  import AuthLayout from './AuthLayout.vue'
  import axios from "axios";

  export default {
    components: {
      FadeRenderTransition,
      AuthLayout
    },
    data(){
      return {
        name: "",
        company: "",
        email: "",
        password: ""
      };
    },
    methods: {
      toggleNavbar () {
        document.body.classList.toggle('nav-open')
      },
      closeMenu () {
        document.body.classList.remove('nav-open')
        document.body.classList.remove('off-canvas-sidebar')
      },
      submit() {
        console.log("Form submitted");
        axios
        .get("http://18.168.19.93:5000/insertDataDB?Name=" + this.name 
         + "&Email=" + this.email    
         + "&Company=" + this.company
         + "&Password=" + this.password) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          //this.$router.push({ name: 'Login' })
        
        });

      }
    },
    beforeDestroy () {
      this.closeMenu()
    }
  }
</script>
<style>
</style>
