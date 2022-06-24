export default {
  methods: {
    insertRowAbove({ table, rowIndex, cells }) {
      // console.log(rowIndex)
      console.log(this.cells, cells, 'cells')
      let length = cells.length
      let tr = table.insertRow(rowIndex)
      if (length) {
        for (let i = 0; i < length; i++) {
          let td = tr.insertCell(i)
          td.innerHTML = '<br>'
        }
      }
    },
    insertRowBelow({ table, rowIndex, cells }) {
      // console.log(rowIndex)
      let length = cells.length
      let tr = table.insertRow(rowIndex + 1)
      if (length) {
        for (let i = 0; i < length; i++) {
          let td = tr.insertCell(i)
          td.innerHTML = '<br>'
        }
      }
    },
    insertColumnLeft({ table, columnIndex }) {
      // console.log(columnIndex)
      let trs = table.getElementsByTagName('tr')
      for (let i = 0; i < trs.length; i++) {
        let td = trs[i].insertCell(columnIndex)
        td.innerHTML = '<br>'
      }
    },
    insertColumnRight({ table, columnIndex }) {
      // console.log(columnIndex)
      let trs = table.getElementsByTagName('tr')
      for (let i = 0; i < trs.length; i++) {
        let td = trs[i].insertCell(columnIndex + 1)
        td.innerHTML = '<br>'
      }
    },
    deleteCurrentRow({ table, rowIndex }) {
      table.deleteRow(rowIndex)
    },
    deleteCurrentColumn({ table, columnIndex }) {
      let trs = table.getElementsByTagName('tr')
      for (let i = 0; i < trs.length; i++) {
        trs[i].deleteCell(columnIndex)
      }
    },
    deleteTable({ table }) {
      table.remove()
    }
  }
}
