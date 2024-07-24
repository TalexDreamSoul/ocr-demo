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

export function handleAnalyzeEntryBill(res: any) {
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
