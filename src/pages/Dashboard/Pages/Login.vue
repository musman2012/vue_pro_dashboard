<template>
  <auth-layout pageClass="login-page">
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <ValidationObserver v-slot="{ handleSubmit }">
          <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
          <form @submit.prevent="handleSubmit(submit)">
            <fade-render-transition>
              <card>
                <div slot="header">
                  <h3 class="card-title text-center">Login</h3>
                </div>
                <div>
                  <ValidationProvider
                    name="email"
                    rules="required|email"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input  type="email"
                               :error="failed ? 'The Email field is required': null"
                               :hasSuccess="passed"
                               label="Email address"
                               name="email"
                               v-model="email">
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider
                    name="password"
                    rules="required|min:5"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input  type="password"
                               :error="failed ? 'The Password field is required': null"
                               :hasSuccess="passed"
                               name="password"
                               label="Password"
                               v-model="password">
                    </fg-input>
                  </ValidationProvider>
                  <!-- <fg-input>
                    <l-checkbox v-model="subscribe">
                      Subscribe to newsletter
                    </l-checkbox>
                  </fg-input> -->
                </div>
                <div class="text-center">
                  <button type="submit" class="btn btn-fill btn-info btn-round btn-wd ">Login</button>
                  <br>
                  <div class="forgot">
                    <router-link to="/register" class="card-category">
                      Forgot your password?
                    </router-link>
                  </div>
                </div>
              </card>
            </fade-render-transition>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </auth-layout>
</template>
<script>
import { Checkbox as LCheckbox, FadeRenderTransition } from 'src/components/index'
import AuthLayout from './AuthLayout.vue'
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";
import axios from "axios";
import Swal from 'sweetalert2';

extend("email", email);
extend("required", required);
extend("min", min);

  export default {
    components: {
      LCheckbox,
      FadeRenderTransition,
      AuthLayout
    }, 
    data() {
      return {
        email: "",
        password: "",
        subscribe: true
      };
    },
    methods: {
      submit() {
        // alert("Form has been submitted!");
        // TODO Friday: here we can use DB connect to fetch user creds and validate before logging in
        // Fetch data from Users table and match with the given creds --> If there is a match goto Overview
        window.fetched_password = "";
        axios
        .get("http://18.168.19.93:5000/getCredsDB?Email=" + this.email) 
        //  + "&Email=" + this.email    
        //  + "&Company=" + this.company
        //  + "&Password=" + this.password) //&sDate=01/08/2020&eDate=04/08/2020')
        .then((response) => {
          //this.$router.push({ name: 'Login' })
            console.log(response);
            if (response.data.length > 0) {
              console.log(response.data[0].Password);
              window.fetched_password = response.data[0].Password;
              console.log("Fetched "+fetched_password+" Written "+this.password);
              if (window.fetched_password == this.password)
                this.$router.push({ name: 'Overview' });
              else{
                console.log("Password incorrent");
                 Swal.fire({
                    title: `Credentials incorrect.`,
                    buttonsStyling: true,
                    confirmButtonClass: 'btn btn-success btn-fill'
                  })
              }

            }
            else {
            //     <l-alert type="danger" dismissible="">
            //   <span>
            //     <b> Danger - </b> This is a regular notification made with ".alert-danger"</span>
            // </l-alert>
                 console.log("Email incorrect");
                 Swal.fire({
                    title: `Account cannot found.`,
                    buttonsStyling: true,
                    confirmButtonClass: 'btn btn-success btn-fill'
                  })
                // Alert component can be used
              // TODO Prompt an error message
            }
        });
        
      },
      toggleNavbar () {
        document.body.classList.toggle('nav-open')
      },
      closeMenu () {
        document.body.classList.remove('nav-open')
        document.body.classList.remove('off-canvas-sidebar')
      }
    },
    beforeDestroy () {
      this.closeMenu()
    }
  }
</script>
<style>
  .navbar-nav .nav-item p{
    line-height: inherit;
    margin-left: 5px;
  }
</style>
