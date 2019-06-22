<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "app",
  components: {
    HelloWorld
  },
  data: () => ({
    csInterface: null,
    identity: null,
    stylizer: null,
    menus: null,
    isMounted: false
  }),
  mounted() {
    console.clear();
    this.csInterface = new CSInterface();
    this.csInterface.addEventListener("console", this.consoler);

    // Utility components are already mounted prior to this
    console.log(
      `${this.identity.extName} ${this.identity.extVersion} : ${
        this.identity.isDev ? "DEV" : "BUILD"
      }`
    );
    this.isMounted = true;

    this.loadUniversalScripts();
  },
  methods: {
    dispatchEvent(name, data) {
      var event = new CSEvent(name, "APPLICATION");
      event.data = data;
      this.csInterface.dispatchEvent(event);
    },
    loadScript(path) {
      this.csInterface.evalScript(`$.evalFile('${path}')`);
    },
    loadUniversalScripts() {
      // Preloads universal scripts and main host script file
      this.loadScript(`${this.identity.root}/src/host/universal/json2.jsx`);
      this.loadScript(`${this.identity.root}/src/host/universal/Console.jsx`);
      this.loadScript(
        `${this.identity.root}/src/host/${this.identity.appName}/host.jsx`
      );
    },
    consoler(msg) {
      // Catches all console.log() usage in .jsx files via CSEvent
      console.log(`${this.identity.appName}: ${msg.data}`);
    },
    getCSS(prop) {
      // Returns current value of CSS variable
      // prop == typeof String as name of variable, with or without leading dashes:
      // this.getCSS('color-bg') || this.getCSS('--scrollbar-width')
      return window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(`${/^\-\-/.test(prop) ? prop : "--" + prop}`);
    },
    setCSS(prop, data) {
      // Sets value of CSS variable
      // prop == typeof String as name of variable, with or without leading dashes:
      // this.setCSS('color-bg', 'rgba(25,25,25,1)') || this.setCSS('--scrollbar-width', '20px')
      document.documentElement.style.setProperty(
        `${/^\-\-/.test(prop) ? prop : "--" + prop}`,
        data
      );
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
