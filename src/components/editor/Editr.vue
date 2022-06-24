<template>
  <div class="editr" :class="{ fullscreen: fullscreen }">
    <div class="editr--toolbar">
      <Btn
        v-for="(module, i) in modules"
        :module="module"
        :options="mergedOptions"
        :key="module.title + i"
        :ref="'btn-' + module.title"
        :title="i18n[module.title]"
      />
      <div class="fs-btn" v-if="!hideCancelFC" @click="handleFullscreen">
        {{ fullscreen ? '取消全屏' : '全屏' }}
      </div>
    </div>
    <!-- 输入框本体 -->
    <div
      class="editr--content"
      ref="content"
      contenteditable
      tabindex="1"
      :placeholder="placeholder"
    ></div>
    <button
      v-if="fullscreen && !hideCancelFC"
      size="mini"
      @click="handleFullscreen"
      id="cancel-fullscreen"
      >取消全屏</button
    >
    <button
      v-if="hideCancelFC"
      size="mini"
      @click="handleSingleFcCancel"
      id="cancel-fullscreen"
      >取消</button
    >
    <button
      v-if="hideCancelFC"
      type="primary"
      size="mini"
      @click="handleSingleFcSave"
      id="fullscreen-save"
      >保存</button
    >
    <div class="table-menu">
      <div class="menu-wrap">
        <ul>
          <li
            v-for="(item, i) in tableMenu"
            :key="i"
            @click="(e) => menuClick(e, item.prop)"
          >
            <i v-html="item.icon"></i>{{ item.label }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// import ajax from '../../ajax'
import bus from './bus.js'
import i18n from './locales/cn'
// import debounce from "debounce";
import Btn from './Button.vue'

import bold from './modules/bold.js'
import italic from './modules/italic.js'
import underline from './modules/underline.js'

// import alignLeft from './modules/alignLeft.js'
// import alignCenter from './modules/alignCenter.js'
// import alignRight from './modules/alignRight.js'

import headings from './modules/headings.vue'
// import hyperlink from './modules/hyperlink.vue'
// import code from './modules/code.js'
import listOrdered from './modules/listOrdered.js'
import listUnordered from './modules/listUnordered.js'

import image from './modules/image.vue'
import table from './modules/table.vue'
import mixins from './mixin/index'
import menu from './menu/index'
// import removeFormat from './modules/removeFormat.js'
// import separator from './modules/separator.js'

const modules = [
  headings,
  bold,
  italic,
  underline,
  // alignLeft,
  // alignCenter,
  // alignRight,
  // hyperlink,
  // code,
  listOrdered,
  listUnordered,
  image,
  table,
  // removeFormat,
]

export default {
  model: {
    // 使用 html 的值进行 emit
    // 在 blur 时进行 emit
    prop: 'html',
    event: 'blur',
  },
  mixins: [mixins],
  props: {
    html: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入内容',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    options: Object,
  },
  components: { Btn },

  data() {
    return {
      selection: '',
      fullscreen: false,
      i18n,
      hideCancelFC: false,
      table: null,
      rowIndex: 0,
      columnIndex: 0,
      cells: null,
    }
  },

  computed: {
    mergedOptions() {
      return { ...bus.options, ...this.options }
    },
    modules() {
      const customIcons = this.mergedOptions.iconOverrides
      return modules
        .filter(
          (m) =>
            this.mergedOptions.hideModules === undefined ||
            !this.mergedOptions.hideModules[m.title]
        )
        .map((mod) => {
          if (
            customIcons !== undefined &&
            customIcons[mod.title] !== undefined
          ) {
            mod.icon = customIcons[mod.title]
          }
          return mod
        })
        .concat(this.mergedOptions.customModules)
    },
    btnsWithDashboards() {
      if (this.modules) return this.modules.filter((m) => m.render)
      return []
    },
    innerHTML: {
      get() {
        return this.$refs.content.innerHTML
      },
      set(html) {
        if (this.$refs.content.innerHTML !== html) {
          this.$refs.content.innerHTML = html
        }
      },
    },
    tableMenu() {
      return menu
    },
  },
  mounted() {
    this.unwatch = this.$watch('html', this.syncHTML, { immediate: true })
    document.addEventListener('click', this.onDocumentClick)
    this.$refs.content.addEventListener('focus', this.onFocus)
    // this.$refs.content.addEventListener('input', this.onInput)
    this.$refs.content.addEventListener('blur', this.onContentBlur, {
      capture: true,
    })
    this.$refs.content.oncontextmenu = () => {
      return false
    }
    this.$refs.content.addEventListener('contextmenu', this.onContextmenu)
    this.$refs.content.addEventListener('paste', this.onPaste)
    this.$refs.content.style.maxHeight = this.mergedOptions.maxHeight
  },
  beforeDestroy() {
    this.unwatch()
    document.removeEventListener('click', this.onDocumentClick)

    this.$refs.content.removeEventListener('blur', this.onContentBlur)
    // this.$refs.content.removeEventListener('input', this.onInput)
    this.$refs.content.removeEventListener('focus', this.onFocus)
  },
  watch: {
    fullscreen(v) {
      if (v) this.$refs.content.style.maxHeight = ''
      else this.$refs.content.style.maxHeight = '250px'
    }
  },
  methods: {
    onContextmenu(e) {
      this.$nextTick(() => {
        // console.log(e)
        if (e.target.tagName !== 'TD') return false
        let menu = document.getElementsByClassName('table-menu')[0]
        let target = e.target
        let params = {
          table: target.parentElement.parentElement.parentElement,
          rowIndex: target.parentElement.rowIndex,
          columnIndex: target.cellIndex,
          cells: target.parentElement.cells,
        }
        menu.params = params
        menu.style.display = 'block'
        menu.style.left = e.clientX + 'px'
        menu.style.top = e.clientY + 'px'
        this.addClass('table--cell', e)
        document.addEventListener('click', () => {
          menu.style.display = 'none'
        })
      })
    },
    addClass(className, e) {
      this.removeClass(className)
      e.target.classList.add('table--cell')
    },
    removeClass(className) {
      let cell = document.getElementsByClassName(className)
      if (cell.length) {
        for (let i = 0; i < cell.length; i++) {
          cell[i].classList.remove(className)
        }
      }
    },
    menuClick(e, prop) {
      let params = e.target.parentElement.parentElement.parentElement.params
      console.log(params, e, 'men')
      this.$nextTick(() => {
        this[prop](params)
        this.onContentBlur()
      })
    },
    handleFullscreen() {
      this.$emit('fullscreen')
      this.fullscreen = !this.fullscreen
      // this.hideCancelFC = true
    },
    handleSingleFcCancel() {
      this.$emit('singleFcCancel')
    },
    handleSingleFcSave() {
      this.$emit('singleFcSave')
    },
    saveSelection() {
      if (window.getSelection !== undefined) {
        this.selection = window.getSelection()
        if (this.selection.getRangeAt && this.selection.rangeCount) {
          return this.selection.getRangeAt(0)
        }
      } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange()
      }
      return null
    },
    restoreSelection(range) {
      if (range) {
        if (window.getSelection !== undefined) {
          this.selection = window.getSelection()
          this.selection.removeAllRanges()
          this.selection.addRange(range)
        } else if (document.selection && range.select) range.select()
      }
    },
    clearSelection() {
      this.selection = null
      const selection = window.getSelection()
      if (selection) {
        if (selection.empty !== undefined) {
          selection.empty()
        }
        if (selection.removeAllRanges !== undefined) {
          selection.removeAllRanges()
        }
      }
    },
    exec(cmd, arg, sel) {
      this.$refs.content.focus()
      sel !== false && this.selection && this.restoreSelection(this.selection)
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand#%E5%91%BD%E4%BB%A4
      document.execCommand(cmd, false, arg || '')
      this.clearSelection()

      this.$nextTick(this.emit)
    },
    onDocumentClick(e) {
      for (let i = 0; i < this.btnsWithDashboards.length; i++) {
        const btn = this.$refs[`btn-${this.btnsWithDashboards[i].title}`][0]
        if (btn && btn.showDashboard && !btn.$el.contains(e.target))
          btn.closeDashboard()
      }
      if (e.target.tagName === 'TD') {
        this.removeClass('table--cell')
        this.addClass('table--cell', e)
      } else {
        this.removeClass('table--cell')
      }
    },
    emit() {
      this.$emit('input', this.$refs.content.innerHTML)
      this.$emit('change', this.$refs.content.innerHTML)
    },
    onInput: function() {
      this.emit()
    },

    onFocus() {
      document.execCommand(
        'defaultParagraphSeparator',
        false,
        this.mergedOptions.paragraphSeparator
      )
    },
    onContentBlur() {
      // save focus to restore it later
      this.selection = this.saveSelection()
      this.$emit('blur', this.$refs.content.innerHTML)
    },
    onPaste(e) {
      e.preventDefault()
      let files = e.clipboardData.files
      if (files.length > 0) {
        let file = files[0]
        if (/\.(jpg|jpeg|png|bmp|gif|webp)$/i.test(file.name) === false) {
          // 后缀名不合法，不是图片
          return
        }
        let form = new FormData()
        form.append('file', file)
        // ajax
        //   .post('/pms/lx/img/upload.do', form)
        //   .then((res) => {
        //     if (typeof res !== 'object') throw new Error('上传错误' + res)
        //     let img = `<img src="${res[0]}" />`
        //     document.execCommand('insertHTML', false, img)
        //   })
        //   .catch((err) => {
        //     throw new Error(err)
        //   })
      } else {
        // get a plain representation of the clipboard
        let text =
          e.clipboardData.getData('text/html') ||
          e.clipboardData.getData('text/plain')

        // insert that plain text text manually
        document.execCommand('insertHTML', false, text)
      }
    },
    syncHTML() {
      if (this.html !== this.$refs.content.innerHTML) this.innerHTML = this.html
    }
  },
}
</script>

<style lang="stylus">
$offwhite = #f6f6f6;
$buttonWidth = 8vw;
$buttonHeight = 32px;
$svgSize = 16px;

.editr {
  border: 1px solid darken($offwhite, 7.5%);
  width: 100%;
  
  table,
  tr,
  td,
  th {
    border: 1px solid #bcc0c6;
  }

  table {
    border-collapse: collapse;
    .table--cell {
      border: 2px solid #409EFF;
    }

    tr {
      td {
        padding: 0 10px;
      }
    }
  }

  .table-menu {
    width: 150px;
    height: 220px;
    border: 1px solid #ccc;
    position: fixed;
    display: none;
    z-index: 10000;
    background: #fff;
    box-shadow: 0 3px 10px #888;
    user-select: none;
    border-radius: 5px;
    .menu-wrap {
      display: flex;
      width: 100%;
      height: 100%;
      &:before {
        content: '';
        width: 35px;
        border-right: 1px solid #e9eaec;
        background: #f8f8f9;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        padding-top: 5px;
        width: 100%
        li {
          height: 30px;
          line-height: 30px;
          padding-left: 15px;
          position relative;
          text-align: left;
          font-size: 14px;
          i {
            position: absolute;
            top: 5px;
            left: -24px
          }
          &:hover {
            cursor: pointer;
            background: #409EFF;
            color: #fff;
          }
        }
      }
    }
  }
}

.editr--toolbar {
  background: $offwhite;
  border-bottom: 1px solid darken($offwhite, 7.5%);
  position: relative;
  display: flex;
  height: $buttonHeight;

  a {
    display: inline-block;
    width: $buttonWidth;
    max-width: 32px;
    height: $buttonHeight;
    color: #333;
    fill: #333;
    cursor: pointer;
    text-align: center;
    line-height: 1;

    &:hover {
      background: alpha(black, 0.1);
    }

    &:active {
      background: alpha(black, 0.2);
    }

    svg {
      width: $svgSize;
      height: $svgSize;
      margin: (($buttonHeight - $svgSize) / 2) auto;

      path {
        fill: inherit;
      }
    }

    &.vw-btn-separator {
      width: 1px;
      margin: 0 8px;

      &:hover {
        background: initial;
        cursor: default;
      }

      i.vw-separator {
        border-left: 1px solid alpha(black, 0.1);
        height: 100%;
        position: absolute;
        width: 1px;
      }
    }
  }

  .dashboard {
    box-sizing: border-box;
    width: 100%;
    position: absolute;
    top: 32px;
    left: 0;
    text-align: left;
    padding: 8px 16px;
    background: alpha(white, 0.95);
    border: 1px solid $offwhite;
  }
}

.editr--content {
  min-height: 150px;
  padding: 12px 8px 16px 8px;
  line-height: 1.33;
  font-family: inherit;
  color: inherit;
  overflow-y: auto;

  &[contenteditable=true]:empty:before {
    content: attr(placeholder);
    color: alpha(black, 0.3);
    display: block; /* For Firefox */
  }

  img {
    max-width: 100%;
  }

  &:focus {
    outline: 0;
  }

  ul, ol {
    li {
      list-style-position: inside;
    }
  }
}

@media screen and (max-width: 320px) {
  .editr--toolbar {
    a {
      margin: 0 2px;
    }

    a.vw-btn-separator {
      display: none;
    }
  }
}

.fs-btn {
  line-height: 32px;
  cursor: pointer;
}

.fullscreen {
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
  left: 0px !important;
  top: 0px !important;
  background-color: white;
  z-index: 9999;

  .editr--toolbar {
    z-index: 1;
  }

  .editr--content {
    height: 100%;
    overflow: auto;
    padding: 50px 16px;
    position: relative;
    top: -40px;
    z-index: 0;
  }
}
</style>
