<script setup lang="ts" generic="T extends any, O extends any">
import Tesseract, { createWorker } from 'tesseract.js'
import { ref } from 'vue'
import { handleAnalyzeEBill } from '~/composables/e-bill'

defineOptions({
  name: 'IndexPage',
})

const src = ref()
const input = ref()
const progress = ref(0)
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

      src.value = img.src
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
          const _progress = Math.floor(m.progress * 100)

          progress.value = _progress
        }
      },
    },
  ).then((res) => {
    console.log(res)

    Object.assign(options, handleAnalyzeEBill(res.data))
    // Object.assign(options, handleAnalyzeEntryBill(res.data))
  })
}

function copyResult() {
  const text = options.map((item: any) => `${item.name}: ${item.value}`).join('\n')

  navigator.clipboard.writeText(text)
    .then(() => {
      alert('复制成功')
    })
    .catch((err) => {
      alert('复制失败')
    })
}
</script>

<template>
  <div class="Menu">
    <div class="MenuInner">
      <canvas id="canvas" absolute op-0 />
      <input ref="input" absolute op-0 accept="image/*" type="file" @change="handleChange">

      <div class="progress-bar" :style="`--p: ${progress}%`" v-text="`${progress}%`" />

      <button @click="handleChoose">
        进账单
      </button>
      <button @click="handleChoose">
        结算业务单
      </button>
      <button @click="handleChoose">
        通用文字
      </button>
      <button @click="handleChoose">
        支票
      </button>
    </div>

    <div class="Display">
      <img :src="src">
      <!-- 渲染 options 为 2xn的表格 (竖着的 k:v) -->

      <table v-if="options.length">
        <tr v-for="(option, index) in options" :key="index">
          <td class="name">
            {{ option.name }}
          </td>
          <td>{{ option.value }}</td>
        </tr>
      </table>

      <button v-if="src && options.length" @click="copyResult">
        复制结果
      </button>
    </div>
  </div>
</template>

<style>
.progress-bar {
  position: absolute;
  display: flex;

  justify-content: center;
  align-items: center;

  top: 120px;

  height: 20px;
  width: 100%;

  color: red;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  background-color: #1c262850;
}

.progress-bar::before {
  z-index: -1;
  content: '';
  position: absolute;
  display: block;

  left: 0;

  height: 100%;
  width: var(--p, 0);

  transition: 0.25s;
  border-radius: 8px;
  background-color: #1c2628;
}

table td.name {
  width: 100px;
}

.Display {
  position: relative;
  display: flex;

  flex-direction: column;

  justify-content: center;
  align-items: center;

  margin-bottom: 50px;

  top: 50px;

  width: 100%;
  /* height: 50%; */
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
