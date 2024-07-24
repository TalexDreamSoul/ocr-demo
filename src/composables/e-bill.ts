// 发票
function analyzeEBill(words: any) {
  const marjor = ['发票号码', '开票日期', '名称', '统一社会信用代码', '价税合计']

  for (const word of words) {
    const text = word.line.text.trim().replaceAll(' ', '')

    if (text.includes('发票号码')) {
      // 取出:后的所有数字
      const regex = /\d+/g
      const nums = text.match(regex)!
      options.push({
        name: '发票号码',
        value: nums[0],
      })
    }
    else if (text.includes('票日期:')) {
      const left = text.split(':')[1].replaceAll(' ', '')
      options.push({
        name: '开票日期',
        value: left,
      })
    }
    else if (text.includes('|名称')) {
      const arr = text.split(':')

      const nowLen = options.length
      arr.forEach((item) => {
        if (arr.includes(':')) {
          const curLen = options.length

          const left = item.split(':')[1].replaceAll(' ', '')
          options.push({
            name: (curLen - nowLen >= 1) ? '购买方名称' : '销售方名称',
            value: left,
          })
        }
      })
    }
    else if (text.includes('|') && text.includes('社会信用')) {
      const arr = text.split(':')

      console.log('社会信用代码', arr)
    }
  }
  console.log(word.line.text.trim())
}

function compareText(text1: string, text2: string) {
  const len = Math.min(text1.length, text2.length)

  let count = 0

  for (let i = 0; i < len; i++) {
    if (text1[i] === text2[i])
      count++
  }

  return count / len
}

const processors: any = []

processors.push((line: string) => {
  const keyWords = ['发票号码', '票号码', '发号码', '票号']

  // 只要任意一项匹配
  const matched = keyWords.some(word => line.includes(word))

  if (matched) {
    // 获取发票号码
    const regex = /\d+/g
    const nums = line.match(regex)!

    return {
      name: '发票号码',
      value: nums[0],
    }
  }
})

processors.push((line: string) => {
  const keyWords = ['开票日期：', '开票日期', '票日期']

  // 只要任意一项匹配
  const matched = keyWords.some(word => line.includes(word))

  if (matched) {
    // 获取发票日期 (xxxx年xx月xx日)
    const regex = /\d+年\d+月\d+日/g
    const dates = line.match(regex)!
    return {
      name: '开票日期',
      value: dates[0],
    }
  }
})

processors.push((line: string) => {
  // 包含公司
  if (!line.includes('公司'))
    return

  // 提取 名称: 后面的所有中文
  const regex = /名称:(.*)/g
  const matches = line.match(regex)
  if (!matches)
    return

  const data = []

  // const companies = matches[0].spilit("|")

  // 从:开始取 取到公司两个字 不断地取
  let startIndex = line.indexOf(':')
  while (startIndex < line.length) {
    const endIndex = line.indexOf('公司', startIndex)
    if (endIndex === -1)
      break

    const company = line.substring(startIndex + 1, endIndex + 2)
    data.push({
      name: '销售方名称',
      value: company,
    })

    startIndex = line.indexOf(':', endIndex + 3)
    if (startIndex === -1)
      break
  }

  if (data.length > 1)
    data.at(-1).name = '购买方名称'

  return data
})

processors.push((line: string) => {
  if (!line.includes('纳税'))
    return

  // 取出整段文本中的所有以数字+大写字母组合的文本（18位）
  const regex = /\b[A-Z0-9]{18}\b/g
  const nums = line.match(regex)!
  if (!nums)
    return

  const data: any = []

  nums.forEach(num => data.push({ name: '统一社会信用代码', value: num }))

  return data
})

processors.push((line: string) => {
  // 如果包含 费 / 服务 / 次 / . 这种表示是费用 直接返回文本
  if (line.includes('费') || line.includes('服务') || line.includes('次') || line.includes('.')) {
    if (line.includes('合计'))
      return

    if (!/\d+\.\d+/.test(line))
      return

    return {
      name: '费用',
      value: line.replaceAll('\n', ''),
    }
  }
})

// 如果包含合计 则直接返回 取出来的所有数字（包括小数） 合法小数
processors.push((line: string) => {
  if (line.includes('合计')) {
    // 取出所有合法小数
    // 比如可以识别 -48.54 3616.37 4.9
    const regex = /-?\d+\.\d+/g
    const nums = line.match(regex)!

    return {
      name: line.includes('税') ? '价税合计' : '合计',
      value: nums[0],
    }
  }
})

// 如果包含关键字
processors.push((line: string) => {
  const keyWords = ['开票人', '票人', '人:', '开票']

  const matched = keyWords.some(word => line.includes(word))

  if (matched) {
    // 获取开票人
    const regex = /\d+/g
    const nums = line.match(regex)!
    if (nums?.length) {
      return {
        name: '开票人',
        value: nums[0],
      }
    }
  }

  // 文本中包含任意三个字满足 开 开头 人 结尾
  const regex = /开.{0,2}人/
  if (regex.test(line)) {
    // 获取开票人
    const regex = /\d+/g
    const nums = line.match(regex)!
    if (nums?.length) {
      return {
        name: '开票人',
        value: nums[0],
      }
    }
  }
})

export function handleAnalyzeEBill(res: any) {
  const data: any = []
  const { lines, text } = res

  const tempText = text.replaceAll(' ', '')
  console.log(tempText, lines)

  lines.forEach((line: string) => {
    processors.forEach((processor) => {
      const result = processor(line.text.replaceAll(' ', ''))

      if (result)
        Array.isArray(result) ? data.push(...result) : data.push(result)
    })
  })

  console.log('@', data, text)

  return data
}
