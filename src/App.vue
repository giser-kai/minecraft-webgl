<template>
  <div id="app">
    <HelloWorld ref="helloword"  />
  </div>
</template>

<script>
import HelloWorld from './components/world.vue'
export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods:{
    changeTrees(){
    }
  },
  data () {
    return {
    }
  },
}
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
