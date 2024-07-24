<script setup lang="ts" generic="T extends any, O extends any">
import Tesseract, { createWorker } from 'tesseract.js'
import { ref } from 'vue'
import { handleAnalyzeEBill } from '~/composables/e-bill'

defineOptions({
  name: 'IndexPage',
})

const input = ref()
const options = reactive<any>([])
function handleChoose() {
  options.length = 0
  input.value.value = ''

  input.value.click()
}

function handleChange(e: any) {
  const file = e.target!.files[0]!

  const reader = new FileReader()

  reader.onload = function (e) {
    const img = new Image()
    img.onload = function () {
      const canvas: any = document.getElementById('canvas')!
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      setTimeout(() => {
        analyzeImage()
      }, 200)
    }

    img.src = e.target!.result!
  }

  reader.readAsDataURL(file)
}

function analyzeImage() {
  const canvas: any = document.getElementById('canvas')!

  Tesseract.recognize(
    canvas,
    'chi_sim', // 指定中文简体进行识别
    {
      logger: (m) => {
        // console.log(m)
        if (m.status === 'recognizing text') {
          const progress = Math.floor(m.progress * 100)

          if (progress % 10 === 0)
            console.log('progress', progress)
        }
      },
    },
  ).then((res) => {
    console.log(res)

    Object.assign(options, handleAnalyzeEBill(res.data))
    // Object.assign(options, handleAnalyzeEntryBill(res.data))
  })
}

// 计算两端文本的相似度
</script>

<template>
  <div class="Menu">
    <div class="MenuInner">
      <canvas id="canvas" absolute op-0 />
      <input ref="input" absolute op-0 accept="image/*" type="file" @change="handleChange">

      <button @touchend="handleChoose" @click="handleChoose">
        进账单
      </button>
      <button @touchend="handleChoose" @click="handleChoose">
        结算业务单
      </button>
      <button @touchend="handleChoose" @click="handleChoose">
        通用文字
      </button>
      <button @touchend="handleChoose" @click="handleChoose">
        支票
      </button>
    </div>

    <div class="Display">
      <!-- 渲染 options 为 2xn的表格 (竖着的 k:v) -->

      <table v-if="options.length">
        <tr v-for="(option, index) in options" :key="index">
          <td class="name">
            {{ option.name }}
          </td>
          <td>{{ option.value }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style>
table td.name {
  width: 100px;
}

.Display {
  position: relative;

  top: 50px;

  width: 100%;
  height: 50%;
}

.Menu {
  color: #000;

  padding: 1rem 2rem;
}

.MenuInner {
  position: relative;
  display: grid;

  grid-gap: 1rem;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;

  justify-content: center;
  align-content: center;

  left: 10%;

  width: 80%;
  height: 100px;
}

.Menu button {
  height: 56px;
  width: 150px;

  background-color: #fae6c8;
}
</style>
