const Boss = require('./common/boss')

new Boss({
  // cookie
  cookie: '',
  // 设置打招呼次数上限
  count: 2,
  // 设置打招呼的限制条件
  limit: {
    "jobId": "1b0b8ddd141aa7f31XRz09W0EVpW", // 职位id
    'intention': 'web前端', // 求职意向：Java Node.js 前端
    "major": '60016,60008', // 专业：计算机、电子信息
    "experience": '105,106', // 经验：3-5年，5-10年
    "degree": '202,203', // 学历：大专,本科
    "age": "26,30", // 年龄：16-不限
  }
})
