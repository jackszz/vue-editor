<template>
  <div id="app">
    <VueEditor />
  </div>
</template>

<script>
import VueEditor from './components/editor/Editr.vue'

export default {
  name: 'App',
  components: {
    VueEditor
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
