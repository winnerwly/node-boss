
const axios = require('axios')
var qs = require('qs');

function sleep(ms) {
  console.log('----------------------------')
  console.log(`随机等待时间${ms}秒`)
  console.log('----------------------------')
  return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

function Boss(config) {
  // 牛人列表请求地址
  this.listUrl = 'https://www.zhipin.com/wapi/zpjob/rec/geek/list'
  // 打招呼请求地址
  this.helloUrl = 'https://www.zhipin.com/wapi/zpboss/h5/chat/start?_=1636084604512'
  this.count = config.count
  this.limit = config.limit || 60
  this.headers = {
    'Cookie': config.cookie,
    'User-Agent': 'PostmanRuntime/7.26.8'
  }
  this.main()
}

// 获取候选人列表
// @param page 当前页数。从1开始
Boss.prototype.getCandidateList = function () {
  const listData = {
    // 年龄
    "age": this.limit['age'],
    // 性别
    "gender": 0,
    // 是否与同事交换过简历
    "exchangeResumeWithColleague": 1301,
    // 跳槽频率
    "switchJobFrequency": 0,
    // 活跃状态
    "activation": 0,
    // 近期有没有看过
    "recentNotView": 0,
    // 院校
    "school": 0,
    // 专业
    "major": this.limit['major'],
    // 工作经验
    "experience": this.limit['experience'],
    // 学历
    "degree": this.limit['degree'],
    // 薪水
    "salary": 0,
    // 求职意向
    "intention": 0,
    // 职位ID
    "jobId": this.limit['jobId'],
    // 是否覆盖筛选记录
    "coverScreenMemory": 1,
    // 分页ID
    "page": 1
  }
  return axios({
    url: this.listUrl,
    headers: this.headers,
    params: listData
  })
}

// 候选人打招呼限制：根据条件过滤
Boss.prototype.filterGuy = function (someGuy) {
  console.log('----------------------------')
  console.log('应聘者姓名' + someGuy['geekCard']['geekName'])
  console.log('应聘者年龄' + someGuy['geekCard']['ageDesc'])
  console.log('应聘者职位:', someGuy['geekCard']['expectPositionName'])
  console.log('应聘者工作年限', someGuy['geekCard']['geekWorkYear'])
  console.log('应聘者学历', someGuy['geekCard']['geekDegree'])
  console.log('应聘者大学', someGuy['showEdus'][0]['school'])
  console.log('----------------------------')
  return someGuy['geekCard']['expectPositionName'].indexOf(this.limit['intention']) !== -1
}

// 打招呼
Boss.prototype.sayHelloToSomeGuy = async function (encryptJobId, expectId, securityId, someGuy) {
  console.log('----------------------------')
  console.log('打招呼To：' + someGuy['geekCard']['geekName'] + '...')
  console.log('----------------------------')
  const helloData = {
    "jid": encryptJobId,
    "expectId": expectId,
    "securityId": securityId
  }
  const { data: hello } = await axios({
    method: 'post',
    url: this.helloUrl,
    headers: {
      ...this.headers,
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(helloData)
  })
  if (hello.zpData.limitTitle) {
    console.log(hello.zpData.limitTitle)
  }
  if (hello['code'] == 0) {
    console.log('----------------------------')
    console.log('打招呼成功！')
    console.log('----------------------------')
    this.count = this.count - 1
    return 1
  } else {
    console.log('----------------------------')
    console.log('打招呼失败：' + hello['message'])
    console.log('----------------------------')
    return 0
  }
}

// 主方法
Boss.prototype.main = async function () {
  const { data: lists } = await this.getCandidateList(this.limit)
  console.log('----------------------------')
  console.log('读取简历列表')
  console.log('----------------------------')
  encryptJobId = lists['zpData']['encryptJobId']
  for (const i in lists['zpData']['geekList']) {
    if (this.count > 0) {
      const someGuy = lists['zpData']['geekList'][i]
      const is = this.filterGuy(someGuy)
      if (is) {
        console.log('----------------------------')
        console.log('应聘者职位符合要求')
        console.log('----------------------------')
        expectId = someGuy['geekCard']['expectId']
        securityId = someGuy['geekCard']['securityId']
        await this.sayHelloToSomeGuy(encryptJobId, expectId, securityId, someGuy)
        // 随机等7-13s
        await sleep(parseInt(Math.random() * 7 + 7))
      } else if (this.count > 0) {
        console.log('----------------------------')
        console.log('应聘者职位不符合要求')
        console.log('----------------------------')
        this.main()
        break
      }
    } else {
      console.log('----------------------------')
      console.log('今日额度已使用完毕')
      console.log('----------------------------')
      break
    }
  }
}

module.exports = Boss
