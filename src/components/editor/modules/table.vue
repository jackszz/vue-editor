<template>
  <div class="form">
    <div>
      <span>行</span>
      <input
        ref="rows"
        @click="$refs.rows.focus()"
        type="number"
        style="width: 60px"
        min="2"
        v-model="rows"
      />
    </div>
    <div>
      <span>列</span>
      <input
        ref="cols"
        @click="$refs.cols.focus()"
        type="number"
        style="width: 60px"
        min="2"
        v-model="cols"
      />
    </div>
    <button @click="insertTable">插入</button>
  </div>
</template>

<script>
// import bus from './bus.js';

export default {
  title: 'table',
  description: 'Insert Table',
  icon:
    '<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M576 1376v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm0-384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm-512-768v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm-512-768v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm512 384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm0-384v-192q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v192q0 14 9 23t23 9h320q14 0 23-9t9-23zm128-320v1088q0 66-47 113t-113 47h-1344q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1344q66 0 113 47t47 113z"/></svg>',
  data() {
    return {
      rows: 3,
      cols: 3,
    }
  },
  mounted() {
    this.resize()
  },
  methods: {
    resize() {
      var startX
      var startWidth
      var $handle
      // var $table
      var pressed = false
      let tables = document.querySelectorAll('.editr--content')
      for (let i = 0; i < tables.length; i++) {
        tables[i].onmousedown = (e) => {
          if (e.target.tagName === 'TH') {
            $handle = e.target
            pressed = true
            startX = event.pageX
            startWidth = parseFloat(getComputedStyle($handle).width)

            // $table = $handle.closest('.table-resizable').addClass('resizing')
          }
        }
      }
      document.onmousemove = (e) => {
        if (pressed) {
          $handle.style.width = startWidth + (event.pageX - startX) + 'px'
        }
      }
      document.onmouseup = (e) => {
        if (pressed) {
          // $table.removeClass('resizing')
          pressed = false
        }
      }
    },
    insertTable() {
      // const th = '<tr>' + '<th><br></th>'.repeat(this.cols) + '</tr>'
      const rows = ('<tr>' + '<td><br></td>'.repeat(this.cols) + '</tr>').repeat(this.rows)
      this.$emit(
        'exec',
        'insertHTML',
        `<table style="width:100%;"><tbody>${rows}</tbody>
          </table>
          `
      )
      this.$parent.closeDashboard()
    }
  },
}
</script>
<style lang="stylus" scoped>
.form {
  display: flex;
  align-content: flex-end;
  background: #fff;
  z-index 1000
  span, div {
    margin-right: 1rem;
  }
  input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    input[type="number"]{
        -moz-appearance: textfield;
    }
}
</style>
