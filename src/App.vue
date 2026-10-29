<script>
import { onMounted, reactive, onUnmounted, ref, inject, computed } from 'vue';//组件导入,复制进去
import getDate from '../src/js/time'//导入时间函数
import Speed11 from './components/air11.vue'
import Speed12 from './components/air12.vue'
import Speed13 from './components/air13.vue'
import Speed14 from './components/air14.vue'

export default {
  name: 'HomeView',
  components: {
    Speed11,
    Speed12,
    Speed13,
    Speed14,
  },

  setup() {
    const worker = inject("worker");

    const x_Temp1 = reactive([[0, 0, 0, 0]]);
    const x_Airquality = reactive([[0, 0, 0, 0]]);
    const x_Base = reactive
      ({
        msg: 0,//基础数据接驳
        symple: 0,//报文标志位
        comid: 0,//comID用于区分单节车两个空调
      })
    const x_Airconditioner1 = reactive({})

    const x_Airconditioner2 = reactive({})

    const replaceObject = (newObject, oldObject) => {
      for (let key in oldObject) {
        newObject[key] = oldObject[key]
      }
      // console.log(newObject)
    }
    const formatDate = () => {
      var date = new Date()// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var hour = ('0' + date.getHours()).slice(-2)
      var minute = ('0' + date.getMinutes()).slice(-2)
      var second = ('0' + date.getSeconds()).slice(-2)
      var milsec = date.getMilliseconds()
      // 拼接
      var result = hour + ':' + minute + ':' + second + ':' + milsec
      // 返回
      return result
    }

    const colorSig = (sig) => {
      if (sig) {
        return "#00ffff";
      } else {
        return '#00657F';
      }
      ;
    }//定义方法

    const colorSig2 = (sig) => {
      if (sig == 0) {
        return "#ee1402";
      } else {
        return '#00657F';
      }
      ;
    }
    //获取当前时间
    const x_TimeData = reactive({
      nowTime: "",
      nowWeek: "",
    })
    const currentTime = () => {
      setInterval(() => {
        x_TimeData.nowTime = getDate().nowTime;
        x_TimeData.nowWeek = getDate().nowWeek;
        //console.log(x_TimeData)
      }, 1000)
    };
    // ====== 可配置项默认值（运行时可通过 config.json 覆盖）======
    const DEFAULT_TITLE = '高速磁浮空调状态诊断模块'
    const DEFAULT_LOGOS = [
      { src: 'logo.png', width: 124.65, height: 41.43 }
    ]

    const title = ref(DEFAULT_TITLE)
    const logos = ref(DEFAULT_LOGOS)
    const logoGap = ref(24)
    const titleAlign = ref('center') // 主标题对齐方式：'center' 居中 | 'left' 原位置

    // logo 区域基准参数（与原设计保持一致）
    const LOGO_START_X = 39.2
    const LOGO_BASE_Y = 10.45
    const LOGO_MAX_HEIGHT = 41.43
    const LOGO_DEFAULT_WIDTH = 124.65

    // 多 logo 一行布局：从左至右依次排列，垂直方向居中对齐
    const logoItems = computed(() => {
      let cursorX = LOGO_START_X
      const list = logos.value
      return list.map((logo, index) => {
        const height = Number(logo.height) > 0 ? Number(logo.height) : LOGO_MAX_HEIGHT
        const width = Number(logo.width) > 0 ? Number(logo.width) : LOGO_DEFAULT_WIDTH
        const y = LOGO_BASE_Y + (LOGO_MAX_HEIGHT - height) / 2
        const item = { x: cursorX, y, width, height, src: logo.src }
        cursorX += width + (index < list.length - 1 ? logoGap.value : 0)
        return item
      })
    })

    // 主标题布局：居中时以画布中线对齐，左对齐时保持原位置
    const TITLE_LEFT_X = 708.5
    const titleProps = computed(() => {
      if (titleAlign.value === 'center') {
        return { x: 960, anchor: 'middle' } // 1920 / 2
      }
      return { x: TITLE_LEFT_X, anchor: 'start' }
    })

    // 运行时加载外部配置文件（打包后位于 dist/config.json，可直接修改无需重新构建）
    onMounted(async () => {
      try {
        const res = await fetch('./config.json', { cache: 'no-cache' })
        if (!res.ok) return
        // 防止 SPA fallback 返回 index.html（非 JSON）导致解析报错
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) return
        const config = await res.json()
        if (typeof config.title === 'string' && config.title.trim()) {
          title.value = config.title
        }
        if (Array.isArray(config.logos)) {
          const valid = config.logos.filter(l => l && typeof l.src === 'string' && l.src.trim())
          if (valid.length) logos.value = valid
        }
        if (typeof config.logoGap === 'number' && config.logoGap >= 0) {
          logoGap.value = config.logoGap
        }
        if (typeof config.titleAlign === 'string' && ['center', 'left'].includes(config.titleAlign)) {
          titleAlign.value = config.titleAlign
        }
      } catch (e) {
        console.warn('[配置] 加载 config.json 失败，使用默认配置', e)
      }

      currentTime()
      worker.onmessage = (event) => {
        const message = event.data;
        // 在这里处理接收到的消息
        const data_state = JSON.parse(message)//转换为双层对象
        const symple = data_state.symple    // 定义标志位并赋值
        const comid = data_state.comid     // 定义COMID并赋值
        switch (symple) {
          case "07":
            if (comid == 1030) {
              var airconditioner1_th1 = data_state.airconditioner1
              replaceObject(x_Airconditioner1, airconditioner1_th1)
              // console.log(x_Airconditioner1)
            }
            if (comid == 1031) {
              var airconditioner2_th1 = data_state.airconditioner2
              replaceObject(x_Airconditioner2, airconditioner2_th1)
            }

            if (x_Temp1.length > 100) {
              x_Temp1.shift();
              x_Temp1.push([formatDate(), x_Airconditioner1.guestroomtemp, x_Airconditioner1.targettemp, x_Airconditioner1.newtrendtemp])
            } else {
              x_Temp1.splice(0, 1)
              x_Temp1.push([formatDate(), x_Airconditioner1.guestroomtemp, x_Airconditioner1.targettemp, x_Airconditioner1.newtrendtemp])
            }
            if (x_Airquality.length > 100) {
              x_Temp1.shift();
              x_Airquality.push([formatDate(), x_Airconditioner1.co2, x_Airconditioner1.pm25, x_Airconditioner1.hcho])
              // console.log(x_Airquality)
            } else {
              x_Airquality.splice(0, 1)
              x_Airquality.push([formatDate(), x_Airconditioner1.co2, x_Airconditioner1.pm25, x_Airconditioner1.hcho])
              // console.log(x_Airquality)
            }
            break;
        }
      };
    })

    onUnmounted(() => {
      if (getDate) {
        clearInterval(getDate) // 在Vue实例销毁前，清除时间定时器
      }
    })
    return {
      x_Airconditioner1,
      x_Airconditioner2,
      x_TimeData,
      x_Airquality,
      x_Base,
      colorSig,
      colorSig2,
      x_Temp1,
      title,
      logoItems,
      titleProps
    }
  }
}
</script>

<template>
  <svg class="block" height="100%" preserveAspectRatio="none" viewBox="0 0 1920 1080" width="100%"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>

      <linearGradient id="linearGradient-1" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#FFC000" stop-opacity="0.49328784"></stop>
        <stop offset="100%" stop-color="#FFC000" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-2" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#EE4572" stop-opacity="0.494760367"></stop>
        <stop offset="100%" stop-color="#EE4572" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-3" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#EE4572" stop-opacity="0.494760367"></stop>
        <stop offset="100%" stop-color="#EE4572" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-4" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#EE4572" stop-opacity="0.494760367"></stop>
        <stop offset="100%" stop-color="#EE4572" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-5" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#EE4572" stop-opacity="0.494760367"></stop>
        <stop offset="100%" stop-color="#EE4572" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-6" x1="100%" x2="0%" y1="50%" y2="50%">
        <stop offset="0%" stop-color="#EE4572" stop-opacity="0.494760367"></stop>
        <stop offset="100%" stop-color="#EE4572" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="linearGradient-7" x1="28.1148014%" x2="28.1148624%" y1="99.9994492%" y2="-15.9417764%">
        <stop offset="0%" stop-color="#0D98FF" />
        <stop offset="100%" stop-color="#0D98FF" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="linearGradient-8" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#0E74B7" stop-opacity="0.583749624" />
        <stop offset="100%" stop-color="#1896E8" stop-opacity="0.147807515" />
      </linearGradient>
      <linearGradient id="linearGradient-9" x1="50%" x2="50%" y1="36.2928152%" y2="100%">
        <stop offset="0%" stop-color="#09446F" />
        <stop offset="100%" stop-color="#016CAB" />
      </linearGradient>
      <rect id="path-1" height="26" width="382" x="107" y="0"></rect>
      <mask id="mask-2" fill="white" height="26" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox"
        width="382" x="0" y="0">
        <use xlink:href="#path-1"></use>
      </mask>
    </defs>
    <!-- 背景 -->
    <rect fill="#000000" height="1080px" width="1920px" x="0" y="0"></rect>
    <!-- 大标题 -->
    <g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <rect id="矩形备份-2" fill="url(#linearGradient-8)" height="59" width="1920" x="0" y="0" />
      <polyline id="路径备份" fill="url(#linearGradient-9)" points="1303.50685 0 1240.76712 78 678.739726 78 616 0" />
      <g id="编组" fill="#4EB3FE" transform="translate(591.000000, 52.000000)">
        <polygon id="矩形" points="44 0 54 0 75 26 65 26" />
        <polygon id="矩形备份" opacity="0.597190494" points="22 0 32 0 53 26 43 26" />
        <polygon id="矩形备份-3" opacity="0.310084025" points="-9.09522457e-13 0 10 0 31 26 21 26" />
      </g>
      <g id="编组备份" fill="#4EB3FE"
        transform="translate(1295.500000, 65.000000) scale(-1, 1) translate(-1295.500000, -65.000000) translate(1258.000000, 52.000000)">
        <polygon id="矩形" points="44 0 54 0 75 26 65 26" />
        <polygon id="矩形备份" opacity="0.597190494" points="22 0 32 0 53 26 43 26" />
        <polygon id="矩形备份-3" opacity="0.310084025" points="-9.09522457e-13 0 10 0 31 26 21 26" />
      </g>
    </g>
    <!-- 时间模块 -->
    <text fill="#ffffff" font-family="SimHei" font-size="40" font-weight="400" height="56" letter-spacing="1.81818182"
      width="544" :text-anchor="titleProps.anchor">
      <tspan :x="titleProps.x" y="55">{{ title }}</tspan>
    </text>
    <g>
      <text fill="#ffffff" font-family="SimHei" font-size="22" font-weight="400">
        <tspan x="202" y="36">车号:CF002</tspan>
      </text>
      <text fill="#ffffff" font-family="SimHei" font-size="22">
        <tspan x="380" y="36">车厢:MC2</tspan>
      </text>
      <text fill="#ffffff" font-family="SimHei" font-size="22">
        <tspan x="1648" y="36">{{ x_TimeData.nowTime }}</tspan>
      </text>
    </g>
    <!-- logo 图标（可配置，支持一行多个，默认左上角原位置） -->
    <image v-for="(logo, index) in logoItems" :key="index"
      :height="logo.height" :width="logo.width" :x="logo.x" :y="logo.y"
      :xlink:href="logo.src" />
    <!-- 基本信息1 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-7" transform="translate(45.000000, 155.000000)">
          <rect id="矩形" fill="#0B5D9D" height="38" opacity="0.341949463" width="276" x="0" y="0"></rect>
          <g id="编组-13" transform="translate(3.000000, 76.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="正常" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="126.5" y="26">{{ x_Airconditioner1.controlmode }}</tspan>
            </text>
            <text id="正常" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="216" y="26">{{ x_Airconditioner2.controlmode }}</tspan>
            </text>
            <text id="控制模式" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">控制模式</tspan>
            </text>
          </g>
          <g id="编组-13备份" transform="translate(3.000000, 152.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="20" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="135.7" y="26">{{ x_Airconditioner1.guestroomtemp }}</tspan>
            </text>
            <text id="80备份-7" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="223" y="26">{{ x_Airconditioner2.guestroomtemp }}</tspan>
            </text>
            <text id="室内温度" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">室内温度</tspan>
            </text>
          </g>
          <g id="编组-13备份-3" transform="translate(3.000000, 228.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="16" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="135" y="26">{{ x_Airconditioner1.newtrendtemp }}</tspan>
            </text>
            <text id="80备份-7" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="223" y="26">{{ x_Airconditioner2.newtrendtemp }}</tspan>
            </text>
            <text id="新风温度" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">新风温度</tspan>
            </text>
          </g>
          <g id="编组-13备份-4" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal" transform="translate(16.000000, 273.000000)">
            <text id="19">
              <tspan x="122" y="19">是</tspan>
            </text>
            <text id="80备份-7">
              <tspan x="210" y="19">是</tspan>
            </text>
            <text id="允许启动">
              <tspan x="0" y="19">允许启动</tspan>
            </text>
          </g>
          <g id="编组-13备份-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal" transform="translate(16.000000, 197.000000)">
            <text id="19">
              <tspan x="122" y="19">{{ x_Airconditioner1.freshir_valve }}</tspan>
            </text>
            <text id="80备份-7">
              <tspan x="210" y="19">{{ x_Airconditioner2.freshir_valve }}</tspan>
            </text>
            <text id="室外温度">
              <tspan x="0" y="19">新风阀门</tspan>
            </text>
          </g>
          <text id="空调1" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="130" y="25">空调1</tspan>
          </text>
          <text id="名称" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="32" y="25">名称</tspan>
          </text>
          <text id="运行模式" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="16" y="64">运行模式</tspan>
          </text>
          <g id="编组-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            transform="translate(16.000000, 120.000000)">
            <text id="设定温度">
              <tspan x="0" y="19">设定温度</tspan>
            </text>
            <text id="18">
              <tspan x="122.491" y="19">{{ x_Airconditioner1.targettemp }}</tspan>
            </text>
            <text id="80备份-8">
              <tspan x="210" y="19">{{ x_Airconditioner2.targettemp }}</tspan>
            </text>
          </g>
          <text id="手动" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="129.5" y="64">{{ x_Airconditioner1.workmode }}</tspan>
          </text>
          <text id="自动" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="219" y="64">{{ x_Airconditioner2.workmode }}</tspan>
          </text>
          <text id="空调2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="217" y="25">空调2</tspan>
          </text>
        </g>
      </g>
    </g>
    <!-- 基本信息2 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-7备份-5" transform="translate(337.000000, 155.000000)">
          <rect id="矩形" fill="#0B5D9D" height="38" opacity="0.341949463" width="276" x="0" y="0"></rect>
          <g id="编组-13" transform="translate(3.000000, 76.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="正常" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="126.5" y="26">正常</tspan>
            </text>
            <text id="正常" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="216" y="26">正常</tspan>
            </text>
            <text id="网络信号" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">网络信号</tspan>
            </text>
          </g>
          <g id="编组-13备份" transform="translate(3.000000, 152.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="20" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="135.7" y="26">{{ x_Airconditioner1.condensingfan2 }}</tspan>
            </text>
            <text id="80备份-7" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="223" y="26">{{ x_Airconditioner2.condensingfan2 }}</tspan>
            </text>
            <text id="冷凝风机2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">冷凝风机2</tspan>
            </text>
          </g>
          <g id="编组-13备份-3" transform="translate(3.000000, 228.000000)">
            <rect id="矩形备份-6" fill="#00A1FF" height="38" opacity="0.100346157" width="273" x="0" y="0"></rect>
            <text id="16" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="135" y="26">{{ x_Airconditioner1.returnair_valve }}</tspan>
            </text>
            <text id="80备份-7" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="223" y="26">{{ x_Airconditioner2.returnair_valve }}</tspan>
            </text>
            <text id="蒸发风机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
              font-weight="normal">
              <tspan x="13" y="26">回风阀门</tspan>
            </text>
          </g>
          <g id="编组-13备份-4" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal" transform="translate(16.000000, 273.000000)">
            <text id="19">
              <tspan x="122" y="19">{{ x_Airconditioner1.exhaustfan }}</tspan>
            </text>
            <text id="80备份-7">
              <tspan x="210" y="19">{{ x_Airconditioner2.exhaustfan }}</tspan>
            </text>
            <text id="废排风机">
              <tspan x="0" y="19">废排风机</tspan>
            </text>
          </g>
          <g id="编组-13备份-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal" transform="translate(16.000000, 197.000000)">
            <text id="19">
              <tspan x="122" y="19">{{ x_Airconditioner1.compressor }}</tspan>
            </text>
            <text id="80备份-7">
              <tspan x="210" y="19">{{ x_Airconditioner2.compressor }}</tspan>
            </text>
            <text id="压缩机">
              <tspan x="0" y="19">压缩机</tspan>
            </text>
          </g>
          <text id="空调1" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="130" y="25">空调1</tspan>
          </text>
          <text id="名称" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="32" y="25">名称</tspan>
          </text>
          <text id="压力保护" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="16" y="64">压力保护</tspan>
          </text>
          <g id="编组-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            transform="translate(16.000000, 120.000000)">
            <text id="冷凝风机1">
              <tspan x="0" y="19">冷凝风机1</tspan>
            </text>
            <text id="18">
              <tspan x="122.491" y="19">{{ x_Airconditioner1.condensingfan1 }}</tspan>
            </text>
            <text id="80备份-8">
              <tspan x="210" y="19">{{ x_Airconditioner2.condensingfan1 }}</tspan>
            </text>
          </g>
          <text id="手动" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="129.5" y="64">自动</tspan>
          </text>
          <text id="自动" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="18"
            font-weight="normal">
            <tspan x="219" y="64">自动</tspan>
          </text>
          <text id="空调2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="16"
            font-weight="normal">
            <tspan x="217" y="25">空调2</tspan>
          </text>
        </g>
      </g>
    </g>
    <!-- 基本信息标题 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-5" transform="translate(24.000000, 102.000000)">
          <rect id="矩形" fill="#00A1FF" height="38" width="3" x="0" y="0"></rect>
          <rect id="矩形备份-4" fill="url(#linearGradient-7)" height="38" opacity="0.369679769" width="605" x="3" y="0">
          </rect>
          <text id="基本信息" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="20"
            font-weight="normal">
            <tspan x="34" y="26">基本信息</tspan>
          </text>
          <g id="编组" fill="#4EB3FE" transform="translate(566.146667, 13.000000)">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13">
            </polygon>
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13"></polygon>
          </g>
          <g id="上箭头" fill="#FFFFFF" fill-rule="nonzero"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)">
            <rect id="矩形" height="12" opacity="0" width="12" x="0" y="0"></rect>
            <path id="路径"
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z">
            </path>
          </g>
        </g>
      </g>
    </g>
    <!-- 蓄电池放电状态标题 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-5备份" transform="translate(656.000000, 102.000000)">
          <rect id="矩形" fill="#00A1FF" height="38" width="3.00242131" x="0" y="0"></rect>
          <rect id="矩形备份-4" fill="url(#linearGradient-7)" height="38" opacity="0.37" width="1236.99758" x="3.00242131"
            y="0"></rect>
          <text id="蓄电池充放电状态" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="20"
            font-weight="normal">
            <tspan x="30.0242131" y="26">蓄电池充放电状态</tspan>
          </text>
          <g id="编组" fill="#4EB3FE" transform="translate(1196.409201, 13.000000)">
            <polygon id="矩形" opacity="0.220115298" points="9.97030472 0 14.5022614 0 24.0193705 13 19.4874138 13">
            </polygon>
            <polygon id="矩形备份" points="-4.12191639e-13 0 4.53195669 0 14.0490657 13 9.51710905 13"></polygon>
          </g>
          <g id="上箭头" fill="#FFFFFF" fill-rule="nonzero"
            transform="translate(19.515738, 19.000000) rotate(-270.000000) translate(-19.515738, -19.000000) translate(14.011299, 13.000000)">
            <rect id="矩形" height="12" opacity="0" width="11.0088781" x="0" y="0"></rect>
            <path id="路径"
              d="M6.16084342,3.1875 L9.48070823,7.929 C9.67127046,8.2011872 9.70363815,8.56766184 9.56421451,8.874478 C9.42479088,9.18129416 9.13772906,9.37530038 8.82361582,9.37500035 L2.18491828,9.37500035 C1.87092904,9.37500035 1.5841066,9.18089984 1.44485528,8.87414166 C1.30560396,8.56738348 1.33802712,8.20107975 1.52851392,7.929 L4.84837873,3.1875 C5.00457679,2.9645217 5.24723326,2.83369413 5.50461108,2.83369413 C5.76198889,2.83369413 6.00464537,2.9645217 6.16084342,3.1875 Z">
            </path>
          </g>
        </g>
      </g>
    </g>
    <!-- 状态曲线标题 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0,0)">
        <g id="编组-5备份-3" transform="translate(24.000000, 819.000000)">
          <rect id="矩形" fill="#0D98FF" height="38" width="3" x="0" y="0"></rect>
          <rect id="矩形备份-4" fill="url(#linearGradient-7)" height="38" opacity="0.37" width="1869" x="3" y="0"></rect>
          <text id="状态曲线" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="20"
            font-weight="normal">
            <tspan x="34" y="26">状态曲线</tspan>
          </text>
          <g id="编组" fill="#4EB3FE" transform="translate(1825.146667, 13.000000)">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13">
            </polygon>
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13"></polygon>
          </g>
          <g id="上箭头" fill="#FFFFFF" fill-rule="nonzero"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)">
            <rect id="矩形" height="12" opacity="0" width="12" x="0" y="0"></rect>
            <path id="路径"
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z">
            </path>
          </g>
        </g>
      </g>
    </g>
    <g>
      <rect fill="none" fill-rule="evenodd" height="371px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="608px" x="24px" y="102px"></rect>
      <rect fill="none" fill-rule="evenodd" height="309px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="608px" x="24px" y="497px"></rect>
      <rect fill="none" fill-rule="evenodd" height="237px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="1872px" x="24px" y="819px"></rect>
      <rect fill="none" fill-rule="evenodd" height="704px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="1240px" x="656px" y="102px"></rect>
      <rect fill="none" fill-rule="evenodd" height="304px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="276px" x="45px" y="155px"></rect>
      <rect fill="none" fill-rule="evenodd" height="304px" stroke="#00A1FF" stroke-opacity="1" stroke-width="1"
        width="276px" x="337px" y="155px"></rect>

      <rect fill="none" fill-rule="evenodd" height="161px" stroke="#00A1FF" stroke-opacity="0.5" stroke-width="1"
        width="438px" x="48px" y="876px"></rect>
      <rect fill="none" fill-rule="evenodd" height="161px" stroke="#00A1FF" stroke-opacity="0.5" stroke-width="1"
        width="438px" x="510px" y="876px"></rect>
      <rect fill="none" fill-rule="evenodd" height="161px" stroke="#00A1FF" stroke-opacity="0.5" stroke-width="1"
        width="438px" x="972px" y="876px"></rect>
      <rect fill="none" fill-rule="evenodd" height="161px" stroke="#00A1FF" stroke-opacity="0.5" stroke-width="1"
        width="438px" x="1434px" y="876px"></rect>
    </g>
    <!-- 风量 -->
    <!-- 风量标题 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-5" transform="translate(24.000000, 497.000000)">
          <rect id="矩形" fill="#00A1FF" height="38" width="3" x="0" y="0"></rect>
          <rect id="矩形备份-4" fill="url(#linearGradient-7)" height="38" opacity="0.369679769" width="605" x="3" y="0">
          </rect>
          <text id="基本信息" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="20"
            font-weight="normal">
            <tspan x="34" y="26">风量分配</tspan>
          </text>
          <g id="编组" fill="#4EB3FE" transform="translate(566.146667, 13.000000)">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13">
            </polygon>
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13"></polygon>
          </g>
          <g id="上箭头" fill="#FFFFFF" fill-rule="nonzero"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)">
            <rect id="矩形" height="12" opacity="0" width="12" x="0" y="0"></rect>
            <path id="路径"
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z">
            </path>
          </g>
        </g>
      </g>
    </g>
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块备份" transform="translate(0, 0)">
        <g id="编组-12" transform="translate(35.000000, 542.000000)">
          <polygon id="路径备份-5" fill-rule="nonzero"
            points="113.504402 62.2342051 123.9766 68.3711974 113.504402 74.5081897 113.504402 71.1748142 68.2342051 71.1748142 68.2342051 65.5713113 113.504402 65.5713113"
            stroke="#3DDEFF"
            transform="translate(96.105403, 68.371197) rotate(-270.000000) translate(-96.105403, -68.371197) ">
          </polygon>
          <polygon id="路径备份-7" fill-rule="nonzero"
            points="513.504402 62.2342051 523.9766 68.3711974 513.504402 74.5081897 513.504402 71.1748142 468.234205 71.1748142 468.234205 65.5713113 513.504402 65.5713113"
            stroke="#3DDEFF"
            transform="translate(496.105403, 68.371197) rotate(-270.000000) translate(-496.105403, -68.371197) ">
          </polygon>
          <ellipse id="椭圆形" cx="122" cy="115.5" rx="4.5" ry="20" stroke="#3DDEFF"></ellipse>
          <ellipse id="椭圆形备份" cx="475" cy="143" rx="4.5" ry="39.5" stroke="#3DDEFF"></ellipse>
          <rect id="矩形" height="23" stroke="#3DDEFF" stroke-width="2" width="69.5909091" x="20" y="1"></rect>
          <rect id="矩形备份-11" height="23" stroke="#3DDEFF" stroke-width="2" width="69.5909091" x="502" y="1"></rect>
          <rect id="矩形备份-7" height="217" stroke="#3DDEFF" stroke-width="2" width="585" x="1" y="35"></rect>
          <rect id="矩形备份-8" height="173" stroke="#3DDEFF" stroke-width="2" width="382" x="105" y="58"></rect>
          <rect id="矩形备份-8" height="137" stroke="#3DDEFF" stroke-width="2" width="66" x="39" y="74"></rect>
          <rect id="矩形备份-9" height="137" stroke="#3DDEFF" stroke-width="2" width="66" x="487" y="74"></rect>
          <rect id="矩形备份-10" height="73" stroke="#3DDEFF" stroke-width="2" width="24" x="147" y="144"></rect>
          <path id="直线" d="M203,57 L203,85 L207,85 L202.5,94 L198,85 L202,85 L202,57 L203,57 Z" fill="#6DD400"
            fill-rule="nonzero"></path>
          <path id="直线备份-31" d="M117,98 L117,101.999 L139,102 L139,103 L117,102.999 L117,107 L108,102.5 L117,98 Z"
            fill="#00A1FF" fill-rule="nonzero"></path>
          <path id="直线备份-32" d="M117,121 L117,124.999 L139,125 L139,126 L117,125.999 L117,130 L108,125.5 L117,121 Z"
            fill="#00A1FF" fill-rule="nonzero"></path>
          <g id="编组-10" fill="#00A1FF" fill-rule="nonzero" transform="translate(336.500000, 109.000000)">
            <path id="直线备份-34" d="M67.5,46 L67.5,50 L89.5,50 L89.5,51 L67.5,51 L67.5,55 L58.5,50.5 L67.5,46 Z"
              transform="translate(74.000000, 50.500000) scale(-1, 1) translate(-74.000000, -50.500000) "></path>
            <path id="直线备份-39" d="M128.5,64 L128.5,68 L150.5,68 L150.5,69 L128.5,69 L128.5,73 L119.5,68.5 L128.5,64 Z"
              transform="translate(135.000000, 68.500000) scale(-1, 1) translate(-135.000000, -68.500000) "></path>
            <path id="直线备份-35" d="M67.5,17 L67.5,21 L89.5,21 L89.5,22 L67.5,22 L67.5,26 L58.5,21.5 L67.5,17 Z"
              transform="translate(74.000000, 21.500000) scale(-1, 1) translate(-74.000000, -21.500000) "></path>
            <path id="直线备份-40" d="M128.5,-4 L128.5,0 L150.5,0 L150.5,1 L128.5,1 L128.5,5 L119.5,0.5 L128.5,-4 Z"
              transform="translate(135.000000, 0.500000) scale(-1, 1) translate(-135.000000, -0.500000) "></path>
            <path id="直线备份-41" d="M128.5,32 L128.5,36 L150.5,36 L150.5,37 L128.5,37 L128.5,41 L119.5,36.5 L128.5,32 Z"
              transform="translate(135.000000, 36.500000) scale(-1, 1) translate(-135.000000, -36.500000) "></path>
            <path id="直线备份-33" d="M8.5,32 L8.5,36 L30.5,36 L30.5,37 L8.5,37 L8.5,41 L-0.5,36.5 L8.5,32 Z"
              transform="translate(15.000000, 36.500000) scale(-1, 1) translate(-15.000000, -36.500000) "></path>
          </g>
          <g id="编组-10备份-2" fill="#00A1FF" fill-rule="nonzero"
            transform="translate(235.500000, 143.500000) scale(-1, 1) translate(-235.500000, -143.500000) translate(170.500000, 109.000000)">
            <path id="直线备份-34" d="M57.5,46 L57.5,50 L79.5,50 L79.5,51 L57.5,51 L57.5,55 L48.5,50.5 L57.5,46 Z"
              transform="translate(64.000000, 50.500000) scale(-1, 1) translate(-64.000000, -50.500000) "></path>
            <path id="直线备份-39" d="M108.5,64 L108.5,68 L130.5,68 L130.5,69 L108.5,69 L108.5,73 L99.5,68.5 L108.5,64 Z"
              transform="translate(115.000000, 68.500000) scale(-1, 1) translate(-115.000000, -68.500000) "></path>
            <path id="直线备份-35" d="M57.5,17 L57.5,21 L79.5,21 L79.5,22 L57.5,22 L57.5,26 L48.5,21.5 L57.5,17 Z"
              transform="translate(64.000000, 21.500000) scale(-1, 1) translate(-64.000000, -21.500000) "></path>
            <path id="直线备份-40" d="M108.5,-4 L108.5,0 L130.5,0 L130.5,1 L108.5,1 L108.5,5 L99.5,0.5 L108.5,-4 Z"
              transform="translate(115.000000, 0.500000) scale(-1, 1) translate(-115.000000, -0.500000) "></path>
            <path id="直线备份-41" d="M108.5,32 L108.5,36 L130.5,36 L130.5,37 L108.5,37 L108.5,41 L99.5,36.5 L108.5,32 Z"
              transform="translate(115.000000, 36.500000) scale(-1, 1) translate(-115.000000, -36.500000) "></path>
            <path id="直线备份-33" d="M8.5,32 L8.5,36 L30.5,36 L30.5,37 L8.5,37 L8.5,41 L-0.5,36.5 L8.5,32 Z"
              transform="translate(15.000000, 36.500000) scale(-1, 1) translate(-15.000000, -36.500000) "></path>
          </g>
          <g id="编组-9" fill="#B620E0" fill-rule="nonzero" transform="translate(88.000000, 198.500000)">
            <path id="直线备份-12"
              d="M186.666667,-0.5 L186.666,14.388 L190.666667,14.388125 L186.166667,23.388125 L181.666667,14.388125 L185.666,14.388 L185.666667,-0.5 L186.666667,-0.5 Z">
            </path>
            <path id="直线备份-19"
              d="M142.222604,27.9440625 L142.222,31.944 L157.110729,31.9440625 L157.110729,32.9440625 L142.222,32.944 L142.222604,36.9440625 L133.222604,32.4440625 L142.222604,27.9440625 Z">
            </path>
            <path id="直线备份-20"
              d="M66.2226042,27.9440625 L66.222,31.944 L81.1107292,31.9440625 L81.1107292,32.9440625 L66.222,32.944 L66.2226042,36.9440625 L57.2226042,32.4440625 L66.2226042,27.9440625 Z">
            </path>
            <path id="直线备份-21"
              d="M221.222604,27.9440625 L221.222,31.944 L236.110729,31.9440625 L236.110729,32.9440625 L221.222,32.944 L221.222604,36.9440625 L212.222604,32.4440625 L221.222604,27.9440625 Z"
              transform="translate(224.166667, 32.444062) scale(-1, 1) translate(-224.166667, -32.444062) "></path>
            <path id="直线备份-22"
              d="M297.222604,27.9440625 L297.222,31.944 L312.110729,31.9440625 L312.110729,32.9440625 L297.222,32.944 L297.222604,36.9440625 L288.222604,32.4440625 L297.222604,27.9440625 Z">
            </path>
            <path id="直线备份-14"
              d="M270.333333,-0.5 L270.333,14.388 L274.333333,14.388125 L269.833333,23.388125 L265.333333,14.388125 L269.333,14.388 L269.333333,-0.5 L270.333333,-0.5 Z">
            </path>
            <path id="直线备份-16"
              d="M354,-0.5 L353.999,14.388 L358,14.388125 L353.5,23.388125 L349,14.388125 L352.999,14.388 L353,-0.5 L354,-0.5 Z">
            </path>
            <path id="直线备份-17"
              d="M103,-0.5 L103,14.388 L107,14.388125 L102.5,23.388125 L98,14.388125 L102,14.388 L102,-0.5 L103,-0.5 Z">
            </path>
            <path id="直线备份-23" d="M1,-0.5 L1,46.5 L5,46.5 L0.5,55.5 L-4,46.5 L0,46.5 L0,-0.5 L1,-0.5 Z"></path>
            <path id="直线备份-24" d="M427,-0.5 L427,46.5 L431,46.5 L426.5,55.5 L422,46.5 L426,46.5 L426,-0.5 L427,-0.5 Z">
            </path>
          </g>
          <path id="直线备份-7"
            d="M231,57 L231,71.888 L235,71.888125 L230.5,80.888125 L226,71.888125 L230,71.888 L230,57 L231,57 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-11"
            d="M179.444062,53.4440625 L188.444062,57.9440625 L179.444062,62.4440625 L179.444,58.444 L164.555938,58.4440625 L164.555938,57.4440625 L179.444,57.444 L179.444062,53.4440625 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-18"
            d="M272.444062,53.4440625 L281.444062,57.9440625 L272.444062,62.4440625 L272.444,58.444 L257.555938,58.4440625 L257.555938,57.4440625 L272.444,57.444 L272.444062,53.4440625 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-26"
            d="M382.444062,53.4440625 L391.444062,57.9440625 L382.444062,62.4440625 L382.444,58.444 L367.555938,58.4440625 L367.555938,57.4440625 L382.444,57.444 L382.444062,53.4440625 Z"
            fill="#EE4572" fill-rule="nonzero"
            transform="translate(379.500000, 57.944062) scale(-1, 1) translate(-379.500000, -57.944062) "></path>
          <path id="直线备份-27"
            d="M442.444062,53.4440625 L451.444062,57.9440625 L442.444062,62.4440625 L442.444,58.444 L427.555938,58.4440625 L427.555938,57.4440625 L442.444,57.444 L442.444062,53.4440625 Z"
            fill="#EE4572" fill-rule="nonzero"
            transform="translate(439.500000, 57.944062) scale(-1, 1) translate(-439.500000, -57.944062) "></path>
          <path id="直线备份-13"
            d="M140.444062,53.4440625 L149.444062,57.9440625 L140.444062,62.4440625 L140.444,58.444 L125.555938,58.4440625 L125.555938,57.4440625 L140.444,57.444 L140.444062,53.4440625 Z"
            fill="#6DD400" fill-rule="nonzero"></path>
          <path id="直线备份-15"
            d="M217.444062,53.4440625 L226.444062,57.9440625 L217.444062,62.4440625 L217.444,58.444 L202.555938,58.4440625 L202.555938,57.4440625 L217.444,57.444 L217.444062,53.4440625 Z"
            fill="#6DD400" fill-rule="nonzero"></path>
          <use id="矩形" mask="url(#mask-2)" stroke="#979797" stroke-dasharray="5" stroke-width="2" xlink:href="#path-1">
          </use>
          <text id="图例" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="113" y="17">图例</tspan>
          </text>
          <g id="编组-11" transform="translate(147.055938, 4.000000)">
            <path id="直线备份-29"
              d="M14.388125,4.44406249 L23.388125,8.94406249 L14.388125,13.4440625 L14.388,9.444 L-0.5,9.44406249 L-0.5,8.44406249 L14.388,8.444 L14.388125,4.44406249 Z"
              fill="#6DD400" fill-rule="nonzero"></path>
            <path id="直线备份-30"
              d="M74.388125,4.44406249 L83.388125,8.94406249 L74.388125,13.4440625 L74.388,9.444 L59.5,9.44406249 L59.5,8.44406249 L74.388,8.444 L74.388125,4.44406249 Z"
              fill="#00A1FF" fill-rule="nonzero"></path>
            <path id="直线备份-36"
              d="M157.388125,4.44406249 L166.388125,8.94406249 L157.388125,13.4440625 L157.388,9.444 L142.5,9.44406249 L142.5,8.44406249 L157.388,8.444 L157.388125,4.44406249 Z"
              fill="#EE4572" fill-rule="nonzero"></path>
            <path id="直线备份-37"
              d="M241.388125,4.44406249 L250.388125,8.94406249 L241.388125,13.4440625 L241.388,9.444 L226.5,9.44406249 L226.5,8.44406249 L241.388,8.444 L241.388125,4.44406249 Z"
              fill="#B620E0" fill-rule="nonzero"></path>
            <polygon id="路径备份-5" fill-rule="nonzero"
              points="305.623104 7 309.944062 9.5 305.623104 12 305.623104 10.6420973 286.944062 10.6420973 286.944062 8.35942249 305.623104 8.35942249"
              stroke="#3DDEFF" stroke-width="0.5"></polygon>
            <text id="回风" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
              font-weight="normal">
              <tspan x="25.4440625" y="13">回风</tspan>
            </text>
            <text id="制冷送风" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
              font-weight="normal">
              <tspan x="84.4440625" y="13">制冷送风</tspan>
            </text>
            <text id="制热送风" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
              font-weight="normal">
              <tspan x="168.444062" y="13">制热送风</tspan>
            </text>
            <text id="废排" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
              font-weight="normal">
              <tspan x="252.444062" y="13">废排</tspan>
            </text>
            <text id="新风" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
              font-weight="normal">
              <tspan x="312.444062" y="13">新风</tspan>
            </text>
          </g>
          <path id="直线备份-25"
            d="M328.444062,53.4440625 L337.444062,57.9440625 L328.444062,62.4440625 L328.444,58.444 L313.555938,58.4440625 L313.555938,57.4440625 L328.444,57.444 L328.444062,53.4440625 Z"
            fill="#6DD400" fill-rule="nonzero"
            transform="translate(325.500000, 57.944062) scale(-1, 1) translate(-325.500000, -57.944062) "></path>
          <path id="直线备份-28"
            d="M472.444062,53.4440625 L481.444062,57.9440625 L472.444062,62.4440625 L472.444,58.444 L457.555938,58.4440625 L457.555938,57.4440625 L472.444,57.444 L472.444062,53.4440625 Z"
            fill="#6DD400" fill-rule="nonzero"
            transform="translate(469.500000, 57.944062) scale(-1, 1) translate(-469.500000, -57.944062) "></path>
          <path id="直线备份-8"
            d="M286,57 L286,71.888 L290,71.888125 L285.5,80.888125 L281,71.888125 L285,71.888 L285,57 L286,57 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-9"
            d="M341,57 L341,71.888 L345,71.888125 L340.5,80.888125 L336,71.888125 L340,71.888 L340,57 L341,57 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-10"
            d="M396,57 L396,71.888 L400,71.888125 L395.5,80.888125 L391,71.888125 L395,71.888 L395,57 L396,57 Z"
            fill="#EE4572" fill-rule="nonzero"></path>
          <path id="直线备份-2" d="M258,57 L258,85 L262,85 L257.5,94 L253,85 L257,85 L257,57 L258,57 Z" fill="#6DD400"
            fill-rule="nonzero"></path>
          <path id="直线备份-3" d="M313,57 L313,85 L317,85 L312.5,94 L308,85 L312,85 L312,57 L313,57 Z" fill="#6DD400"
            fill-rule="nonzero"></path>
          <path id="直线备份-4" d="M368,57 L368,85 L372,85 L367.5,94 L363,85 L367,85 L367,57 L368,57 Z" fill="#6DD400"
            fill-rule="nonzero"></path>
          <path id="直线备份-5" d="M423,57 L423,85 L427,85 L422.5,94 L418,85 L422,85 L422,57 L423,57 Z" fill="#6DD400"
            fill-rule="nonzero"></path>
          <path id="形状" d="M59.0001692,25 L59,49 L67,49 L67,73 M62,73 L61.9992553,55.4864865 L54,55.4864865 L54,25"
            fill-rule="nonzero" stroke="#3DDEFF" stroke-width="2"></path>
          <path id="形状备份"
            d="M532.000169,25 L532,49 L540,49 L540,73 M535,73 L534.999255,55.4864865 L527,55.4864865 L527,25"
            fill-rule="nonzero" stroke="#3DDEFF" stroke-width="2"
            transform="translate(533.500000, 49.000000) scale(-1, 1) translate(-533.500000, -49.000000) "></path>
          <path id="路径-49"
            d="M159.5,137.168 L159.5,144.86777 L158.5,144.86777 L158.5,138.168 L136.079,138.168 L136.079309,178.168 L117.5,178.168 L117.5,182.168 L108.5,177.668 L117.5,173.168 L117.5,177.168 L135.079,177.168 L135.079309,137.168 L159.5,137.168 Z"
            fill="#3F0F4C" fill-rule="nonzero"></path>
          <text id="空调室外机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="25" y="17">空调室外机</tspan>
          </text>
          <text id="空调室外机备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="507" y="17">空调室外机</tspan>
          </text>
          <text id="冷媒管路" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="8" y="67">冷媒管路</tspan>
          </text>
          <text id="1100" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="68.988" y="67">1100</tspan>
          </text>
          <text id="冷媒管路" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="536" y="69">冷媒管路</tspan>
          </text>
          <text id="1100" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="500.988" y="69">1100</tspan>
          </text>
          <text id="客室" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="306" y="163">客室</tspan>
          </text>
          <text id="空调室内机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="68.5" y="113">空</tspan>
            <tspan x="68.5" y="130">调</tspan>
            <tspan x="68.5" y="147">室</tspan>
            <tspan x="68.5" y="164">内</tspan>
            <tspan x="68.5" y="181">机</tspan>
          </text>
          <text id="卫生间" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="153.5" y="167">卫</tspan>
            <tspan x="153.5" y="184">生</tspan>
            <tspan x="153.5" y="201">间</tspan>
          </text>
          <text id="通过台" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="14.5" y="124">通</tspan>
            <tspan x="14.5" y="141">过</tspan>
            <tspan x="14.5" y="158">台</tspan>
          </text>
          <text id="通过台备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="564.5" y="124">通</tspan>
            <tspan x="564.5" y="141">过</tspan>
            <tspan x="564.5" y="158">台</tspan>
          </text>
          <text id="1100" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="525.488" y="226">1100</tspan>
          </text>
          <text id="1100备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="453.488" y="222">1100</tspan>
          </text>
          <text id="1100备份-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="52.488" y="226">1100</tspan>
          </text>
          <text id="800" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="116.2" y="223">800</tspan>
          </text>
          <text id="1900" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="113.794" y="89">1900</tspan>
          </text>
          <text id="1900备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="453.794" y="96">1900</tspan>
          </text>
          <text id="3000" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="115.6" y="51">3000</tspan>
          </text>
          <text id="3000备份-2" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="421.6" y="51">3000</tspan>
          </text>
          <text id="3000备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="154.6" y="51">3000</tspan>
          </text>
          <text id="3000备份-3" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="460.6" y="51">3000</tspan>
          </text>
          <text id="300" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="138.2" y="131">300</tspan>
          </text>
          <text id="空调室内机备份" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="12"
            font-weight="normal">
            <tspan x="519.5" y="113">空</tspan>
            <tspan x="519.5" y="130">调</tspan>
            <tspan x="519.5" y="147">室</tspan>
            <tspan x="519.5" y="164">内</tspan>
            <tspan x="519.5" y="181">机</tspan>
          </text>
        </g>
      </g>
    </g>
    <!-- 空调1 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-8备份-2" transform="translate(683.000000, 208.000000)">
          <g id="编组-37">
            <g id="25向右箭头备份-4" fill-rule="nonzero"
              transform="translate(333.789342, 127.157732) rotate(-360.000000) translate(-333.789342, -127.157732) translate(299.683940, 84.198787)">
              <rect id="矩形" fill="#000000" height="18.9688852" opacity="0" width="19.0095686" x="0" y="1.13589324e-13">
              </rect>
              <polygon id="路径" fill="url(#linearGradient-1)"
                points="57.7386068 3.34745033 68.2108051 9.48444259 57.7386068 15.6214349 57.7386068 12.2880594 0 12.2880594 0 6.68455645 57.7386068 6.68455645">
              </polygon>
              <polygon id="路径备份" fill="url(#linearGradient-1)"
                points="57.7386068 39.0535871 68.2108051 45.1905794 57.7386068 51.3275717 57.7386068 47.9941962 0 47.9941962 0 42.3906933 57.7386068 42.3906933">
              </polygon>
              <polygon id="路径备份-3" fill="url(#linearGradient-1)"
                points="57.7386068 73.6439072 68.2108051 79.7808994 57.7386068 85.9178917 57.7386068 82.5845163 0 82.5845163 0 76.9810133 57.7386068 76.9810133">
              </polygon>
            </g>
            <g id="25向右箭头备份-5" fill-rule="nonzero"
              transform="translate(242.821416, 329.340722) rotate(-90.000000) translate(-242.821416, -329.340722) translate(16.614879, 96.300843)">
              <polygon id="路径备份-3" fill="url(#linearGradient-2)"
                points="57.7386068 453.805774 68.2108051 459.942766 57.7386068 466.079758 57.7386068 462.746383 0 462.746383 0 457.14288 57.7386068 457.14288">
              </polygon>
              <polygon id="路径备份-4" fill="url(#linearGradient-2)"
                points="57.7386068 420.331271 68.2108051 426.468263 57.7386068 432.605255 57.7386068 429.27188 0 429.27188 0 423.668377 57.7386068 423.668377">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-2)"
                points="57.7386068 387.972584 68.2108051 394.109576 57.7386068 400.246569 57.7386068 396.913193 0 396.913193 0 391.30969 57.7386068 391.30969">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-3)"
                points="106.160344 284.201624 114.057412 287.549074 106.160344 290.896525 106.160344 289.07832 62.6197555 289.07832 62.6197555 286.021864 106.160344 286.021864">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-4)"
                points="323.628011 180.755138 330.48033 184.109768 323.628011 187.464398 323.628011 185.642293 285.847659 185.642293 285.847659 182.579282 323.628011 182.579282"
                transform="translate(308.163995, 184.109768) rotate(-270.000000) translate(-308.163995, -184.109768) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-4)"
                points="464.522461 140.585734 471.37478 143.940364 464.522461 147.294994 464.522461 145.472889 426.742109 145.472889 426.742109 142.409878 464.522461 142.409878"
                transform="translate(449.058445, 143.940364) scale(-1, -1) rotate(-270.000000) translate(-449.058445, -143.940364) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-5)"
                points="308.006239 33.4745033 314.873254 36.8219536 308.006239 40.1694039 308.006239 38.3511991 270.144857 38.3511991 270.144857 35.294743 308.006239 35.294743"
                transform="translate(292.509056, 36.821954) scale(-1, -1) rotate(-180.000000) translate(-292.509056, -36.821954) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-5)"
                points="308.006239 0 314.873254 3.34745033 308.006239 6.69490065 308.006239 4.87669587 270.144857 4.87669587 270.144857 1.82023971 308.006239 1.82023971"
                transform="translate(292.509056, 3.347450) scale(-1, -1) translate(-292.509056, -3.347450) "></polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-6)"
                points="111.319885 191.588832 118.530251 194.936282 111.319885 198.283732 111.319885 196.465528 71.5654349 196.465528 71.5654349 193.409071 111.319885 193.409071"
                transform="translate(95.047843, 194.936282) scale(-1, -1) translate(-95.047843, -194.936282) ">
              </polygon>
            </g>
            <rect id="矩形备份-42" height="25.1027096" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(429.490186, 518.251512) rotate(-360.000000) translate(-429.490186, -518.251512) "
              width="181.521743" x="338.729315" y="505.700157"></rect>
            <rect id="矩形备份-43" height="19.5236258" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(428.837186, 470.829299) rotate(-360.000000) translate(-428.837186, -470.829299) "
              width="182.827744" x="337.423314" y="461.067486"></rect>
            <path id="形状"
              d="M96.1697345,204.852369 L96.1697345,30.5256424 L163.006021,30.5256424 M182.410104,31.0265813 L202.892192,31.0265813 M219.062261,31.0265813 L243.856367,31.0265813 M263.571159,30.0264736 L406.620516,30.0264736 M420.421063,30.0264736 L437.387739,30.0264736 M451.481936,30.0264736 L466.457043,30.0264736 M482.252462,30.0264736 L575.023222,30.0264736 L575.023222,64.03634 M575.023222,72.337553 L575.023222,78.4106672 M575.023222,86.0743588 L575.023222,93.7380504 M575.023222,101.289913 L575.023222,200.614708 M575.023222,207.435474 L575.023222,214.387957 M575.023222,221.371478 L575.023222,228.765298 M575.023222,237.281788 L575.023222,313.554333 L506.368348,313.554333 M491.575219,313.554333 L479.460132,313.554333 M462.441973,313.554333 L445.622289,313.554333 M424.882707,313.554333 L248.301967,313.554333 L229.842307,313.554333 M169.971589,313.499134 L158.78949,313.499134 M194.572207,313.499134 L183.390108,313.499134 M218.054616,313.499134 L206.872517,313.499134 M148.725601,312.941226 L97.2879444,312.941226 L97.2879444,258.791984 L97.2879444,245.992219 M96.7288394,232.602418 L96.7288394,220.328433"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(336.025762, 171.790404) rotate(-360.000000) translate(-336.025762, -171.790404) ">
            </path>
            <rect id="矩形备份-45" height="154.537456" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(327.080083, 125.484007) rotate(-360.000000) translate(-327.080083, -125.484007) "
              width="46.4061336" x="303.877016" y="48.2152796"></rect>
            <path id="路径-5备份"
              d="M209.668041,142.221259 L209.668041,213.633533 L310.713071,213.633533 L310.713071,59.312562 C310.713071,57.6506296 312.060333,56.3033673 313.722265,56.3033673 C315.384198,56.3033673 316.73146,57.6506296 316.73146,59.312562 L316.73146,190.348658 C316.73146,192.16886 318.207025,193.644425 320.027227,193.644425 C321.847429,193.644425 323.322994,192.16886 323.322994,190.348658 L323.322994,59.3210315 C323.322994,57.6544216 324.674048,56.3033673 326.340658,56.3033673 C328.007268,56.3033673 329.358322,57.6544216 329.358322,59.3210315 L329.358322,190.352702 C329.358322,192.170671 330.832077,193.644425 332.650045,193.644425 C334.468013,193.644425 335.941768,192.170671 335.941768,190.352702 L335.941768,58.8613369 C335.941768,57.4486093 337.08701,56.3033673 338.499737,56.3033673 C339.912465,56.3033673 341.057707,57.4486093 341.057707,58.8613369 L341.057707,204.001477 L341.057707,204.001477"
              stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(275.362874, 134.968450) rotate(-360.000000) translate(-275.362874, -134.968450) ">
            </path>
            <polygon id="路径-8备份-3"
              points="204.775873 141.105442 214.56021 141.105442 204.775873 124.368191 214.56021 124.368191"
              stroke="#3DDEFF" stroke-width="2.81718018"
              transform="translate(209.668041, 132.736816) rotate(-360.000000) translate(-209.668041, -132.736816) ">
            </polygon>
            <path id="形状"
              d="M209.668041,123.252374 L209.668041,115.441656 L3.87278755,115.441656 L3.87278755,135.254551 C5.61533755,135.861443 6.53491508,137.763018 5.92672146,139.501839 C5.59097673,140.461731 4.83473778,141.216351 3.87278755,141.551377 C1.48863651,141.936128 -0.131528812,144.17663 0.254047024,146.555678 C0.554827641,148.41153 2.01295518,149.866537 3.87278755,150.166674 C5.61533755,150.534131 6.72943228,152.241606 6.36118779,153.980426 C6.09727787,155.226588 5.12162151,156.200156 3.87278755,156.463501 C1.48863651,156.848252 -0.131528812,159.088754 0.254047024,161.467802 C0.554827641,163.323654 2.01295518,164.778661 3.87278755,165.078798 C5.61533755,165.446254 6.72943228,167.153729 6.36118779,168.89255 C6.09727787,170.138711 5.12162151,171.11228 3.87278755,171.375625 C1.48863651,171.634631 -0.233683111,173.773198 0.0258790101,176.152246 C0.24647141,178.174113 1.84658436,179.770801 3.87278755,179.990922 L3.87278755,182.322374 L3.87278755,220.298294 M3.87278755,234.229119 L3.87278755,248.399247 M3.87278755,265.4034 L3.87278755,332.499111 M3.87278755,346.025074 L3.87278755,359.79028 M3.87278755,320.193873 L3.87278755,360.458684 L3.87278755,381.391905 C5.61533755,381.759362 6.72943228,383.466837 6.36118779,385.205657 C6.09727787,386.451819 5.12162151,387.425387 3.87278755,387.688732 C1.48863651,388.057219 -0.144741031,390.284537 0.224536706,392.663586 C0.515890097,394.540612 1.99173592,396.013299 3.87278755,396.304029 C6.24281604,396.935781 7.65086933,399.365093 7.01776259,401.730049 C6.60758844,403.262245 5.40827025,404.458997 3.87278755,404.868293 C1.48863651,405.236781 -0.144741031,407.464099 0.224536706,409.843147 C0.515890097,411.720173 1.99173592,413.19286 3.87278755,413.48359 C5.61533755,413.688982 6.86109375,415.265077 6.65526191,417.003897 C6.48287938,418.460146 5.33215929,419.608403 3.87278755,419.780417 C1.48863651,420.148904 -0.144741031,422.376222 0.224536706,424.755271 C0.515890097,426.632297 1.99173592,428.104984 3.87278755,428.395714 L3.87278755,443.465977 L192.894893,443.465977 L192.894893,455.765773"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(104.834021, 285.603715) rotate(-360.000000) translate(-104.834021, -285.603715) ">
            </path>
            <rect id="矩形" fill="#3DDEFF" height="4.4632671" stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(181.709112, 443.491788) rotate(-360.000000) translate(-181.709112, -443.491788) "
              width="12.3003091" x="175.558957" y="441.260155"></rect>
            <path id="形状结合"
              d="M194.31098,456.290177 L194.310841,461.977648 C193.935955,461.269533 193.190508,460.786948 192.332106,460.786948 C191.096966,460.786948 190.095686,461.786085 190.095686,463.018582 C190.095686,464.251079 191.096966,465.250215 192.332106,465.250215 C193.190508,465.250215 193.935955,464.767631 194.310841,464.059516 L194.31098,468.564162 L189.83814,468.564162 L189.83814,456.290177 L194.31098,456.290177 Z"
              fill="#3DDEFF" stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(192.074560, 462.427170) rotate(-360.000000) translate(-192.074560, -462.427170) ">
            </path>
            <polyline id="路径-10备份" points="192.335788 469.155574 192.335788 526.06223 254.955543 526.06223"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(223.645665, 497.608902) rotate(-360.000000) translate(-223.645665, -497.608902) ">
            </polyline>
            <g id="编组-4" stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(281.792581, 526.062230) rotate(-360.000000) translate(-281.792581, -526.062230) translate(254.955543, 518.251512)">
              <path id="矩形备份-46"
                d="M7.26850512,0.740600166 L7.26850512,14.8808347 L0.558964322,12.9679257 L0.558964322,2.65350912 L7.26850512,0.740600166 Z">
              </path>
              <polyline id="路径-12备份" points="7.82746944 2.23163355 53.6740762 8.14073334 7.82746944 14.5056181">
              </polyline>
              <polyline id="路径-13备份"
                points="7.82746944 7.4629156 50.7726702 7.81071743 53.6740762 7.81071743 7.82746944 4.4632671 7.82746944 11.1581678 48.1097036 8.36862581">
              </polyline>
            </g>
            <path id="形状"
              d="M332.112028,351.994813 L241.464512,351.994813 L241.464512,363.321325 L155.178224,363.321325 L155.178224,351.994813 L97.2879444,351.994813 L97.2879444,449.070872 M97.2879444,459.113223 L97.2879444,469.155574 M97.2879444,478.082108 L97.2879444,487.008643 M97.2879444,498.16681 L97.2879444,562.884183 L181.153688,562.884183 M201.281467,563.442092 L219.172826,563.442092 M237.064184,563.442092 L250.482703,563.442092 M265.019432,563.442092 L429.396291,563.442092 M446.169439,563.442092 L460.706168,563.442092 M479.715737,563.442092 L494.252466,563.442092 M508.789195,562.884183 L575.88179,562.884183 L575.88179,500.398444 M575.88179,489.240276 L575.88179,478.082108 M575.88179,468.039757 L575.88179,456.88159 M575.88179,444.607605 L575.88179,351.994813 L436.10555,351.994813 M414.859562,352.552721 L393.613573,352.552721 M372.367585,352.552721 L353.358016,352.552721"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(336.584867, 457.997406) rotate(-360.000000) translate(-336.584867, -457.997406) ">
            </path>
            <path id="路径-14备份"
              d="M307.776024,526.06223 L513.2675,526.06223 C514.12248,526.06223 514.815578,525.369131 514.815578,524.514151 C514.815578,523.659171 514.12248,522.966073 513.2675,522.966073 L345.221022,522.966073 C344.291924,522.966073 343.538741,522.21289 343.538741,521.283792 C343.538741,520.354694 344.291924,519.601511 345.221022,519.601511 L513.095327,519.601511 C514.045396,519.601511 514.815578,518.831328 514.815578,517.88126 C514.815578,516.931192 514.045396,516.161009 513.095327,516.161009 L345.005877,516.161009 C344.1956,516.161009 343.538741,515.50415 343.538741,514.693874 C343.538741,513.883597 344.1956,513.226738 345.005877,513.226738 L513.175286,513.226738 C514.081194,513.226738 514.815578,512.492354 514.815578,511.586446 C514.815578,510.680537 514.081194,509.946154 513.175286,509.946154 L286.822565,509.946154 L286.822565,509.946154 L286.822565,406.669835 L74.364641,406.669835"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(294.590110, 466.366032) rotate(-360.000000) translate(-294.590110, -466.366032) ">
            </path>
            <polyline id="路径-15备份"
              points="342.556571 465.882512 514.770852 465.882512 489.255388 470.626449 514.770852 475.776087 342.556571 475.776087"
              stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(428.663712, 470.829299) rotate(-360.000000) translate(-428.663712, -470.829299) ">
            </polyline>
            <path id="形状"
              d="M74.364641,406.669835 L34.7080615,406.669835 L34.7080615,391.61955 C32.3046238,391.228927 30.6735945,388.968063 31.0650557,386.569769 C31.3698422,384.702488 32.8367764,383.238694 34.7080615,382.934559 C36.9496373,382.591008 38.4876924,380.499236 38.1434037,378.262458 C37.8711836,376.493896 36.4804166,375.106105 34.7080615,374.834468 C32.3046238,374.443845 30.6735945,372.18298 31.0650557,369.784686 C31.3698422,367.917406 32.8367764,366.453611 34.7080615,366.149477 C36.9496373,365.805925 38.4876924,363.714154 38.1434037,361.477376 C37.8711836,359.708814 36.4804166,358.321023 34.7080615,358.049386 C32.3046238,357.658762 30.6735945,355.397898 31.0650557,352.999604 C31.3698422,351.132324 32.8367764,349.668529 34.7080615,349.364395 C36.9496373,349.036674 38.5005534,346.957736 38.1721295,344.720958 C37.9094115,342.931679 36.5011779,341.526459 34.7080615,341.264303 L34.7080615,255.821957 M34.7080615,300.624568 L34.7080615,290.774763 M34.7080615,282.214825 L34.7080615,273.674474 L34.7080615,211.608216 C32.3046238,211.235404 30.6591246,208.988979 31.0327362,206.590685 C31.3272359,204.700228 32.8135496,203.217095 34.7080615,202.923226 C36.9496373,202.595505 38.5005534,200.516567 38.1721295,198.279789 C37.9094115,196.49051 36.5011779,195.08529 34.7080615,194.823134 C32.3046238,194.450322 30.6591246,192.203897 31.0327362,189.805603 C31.3272359,187.915146 32.8135496,186.432013 34.7080615,186.138143 C36.9496373,185.810422 38.5005534,183.731485 38.1721295,181.494706 C37.9094115,179.705427 36.5011779,178.300208 34.7080615,178.038052 C32.3046238,177.66524 30.6591246,175.418815 31.0327362,173.020521 C31.3272359,171.130063 32.8135496,169.646931 34.7080615,169.353061 C36.9496373,169.02534 38.5005534,166.946403 38.1721295,164.709624 C37.9094115,162.920345 36.5011779,161.515125 34.7080615,161.25297 L34.7080615,145.568709 L91.5601704,145.568709"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(61.270006, 276.119272) rotate(-360.000000) translate(-61.270006, -276.119272) ">
            </path>
            <path id="路径-17备份"
              d="M100.222635,145.568709 L168.94159,145.568709 L168.94159,235.676633 L224.637599,235.676633 C224.985009,233.369258 227.137138,231.780392 229.444514,232.127802 C231.278024,232.403865 232.717282,233.843123 232.993345,235.676633 L232.993345,235.676633 L232.993345,235.676633 C233.310978,237.87505 235.350639,239.399725 237.549056,239.082092 C239.313509,238.827159 240.699581,237.441087 240.954514,235.676633 L240.954514,235.676633 L240.954514,235.676633 C241.301925,233.369258 243.454054,231.780392 245.761429,232.127802 C247.59494,232.403865 249.034198,233.843123 249.310261,235.676633 L249.310261,235.676633 L249.310261,235.676633 C249.627894,237.87505 251.667555,239.399725 253.865971,239.082092 C255.630425,238.827159 257.016497,237.441087 257.27143,235.676633 L257.27143,235.676633 L257.27143,235.676633 C257.61884,233.369258 259.770969,231.780392 262.078345,232.127802 C263.911855,232.403865 265.351113,233.843123 265.627176,235.676633 L265.627176,235.676633 L265.627176,235.676633 C265.944809,237.87505 267.98447,239.399725 270.182886,239.082092 C271.94734,238.827159 273.333412,237.441087 273.588345,235.676633 L273.588345,235.676633 L273.588345,235.676633 L354.592695,235.676633 L354.592695,293.97234 L363.654599,293.97234 L373.485795,284.137326"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(236.854215, 219.770525) rotate(-360.000000) translate(-236.854215, -219.770525) ">
            </path>
            <polyline id="路径-18备份" points="341.057707 203.591182 341.057707 213.633533 363.421905 213.633533"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(352.239806, 208.612357) rotate(-360.000000) translate(-352.239806, -208.612357) ">
            </polyline>
            <path id="路径-19备份"
              d="M373.485795,214.055566 L385.098571,214.055566 C385.354417,212.095062 387.151123,210.713163 389.111627,210.969008 C390.721281,211.179068 391.988126,212.445912 392.198185,214.055566 L392.198185,214.055566 L392.198185,214.055566 C392.750678,217.032481 395.611828,218.997863 398.588743,218.44537 C400.819372,218.031382 402.564559,216.286195 402.978547,214.055566 L402.978547,214.055566 L402.978547,214.055566 C403.234392,212.095062 405.031098,210.713163 406.991603,210.969008 C408.601257,211.179068 409.868101,212.445912 410.078161,214.055566 L410.078161,214.055566 L410.078161,214.055566 C410.327628,215.989783 412.097852,217.355542 414.032069,217.106075 C415.624044,216.900749 416.877251,215.647542 417.082577,214.055566 L417.082577,214.055566 L417.082577,214.055566 C417.338422,212.095062 419.135129,210.713163 421.095633,210.969008 C422.705287,211.179068 423.972131,212.445912 424.182191,214.055566 L424.182191,214.055566 L424.182191,214.055566 C424.431658,215.989783 426.201883,217.355542 428.136099,217.106075 C429.728075,216.900749 430.981281,215.647542 431.186607,214.055566 L431.186607,214.055566 L431.186607,214.055566 L439.46018,214.055566 L439.46018,277.235089 L417.082577,277.235089"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(406.472987, 232.044509) rotate(-360.000000) translate(-406.472987, -232.044509) ">
            </path>
            <g id="编组-5" stroke="#3DDEFF"
              transform="translate(457.910644, 248.781761) rotate(-360.000000) translate(-457.910644, -248.781761) translate(439.460180, 231.486601)">
              <g id="编组-35备份-3">
                <line id="路径-20" stroke-width="1.11792864" x1="0" x2="23.8522752" y1="6.61345914" y2="6.61345914">
                </line>
                <ellipse id="椭圆形" cx="29.9863358" cy="6.69490065" rx="5.59133087" ry="5.57697201"
                  stroke-width="2.23585729"></ellipse>
              </g>
              <line id="路径-20备份-2" stroke-width="1.11792864" x1="0" x2="23.4824083" y1="27.337511" y2="27.337511">
              </line>
              <ellipse id="椭圆形备份-6" cx="30.1916678" cy="27.8954194" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729"></ellipse>
              <line id="路径-7" stroke-width="1.11792864" x1="11.7412042" x2="11.7412042" y1="21.2005187" y2="32.3586865">
              </line>
            </g>
            <g id="编组-35备份-4" stroke="#3DDEFF"
              transform="translate(336.025762, 253.802936) scale(-1, 1) rotate(-360.000000) translate(-336.025762, -253.802936) translate(317.575299, 247.108036)">
              <line id="路径-20" stroke-width="1.11792864" x1="0" x2="24.6006182" y1="7.25280904" y2="7.25280904"></line>
              <ellipse id="椭圆形" cx="30.1916678" cy="6.69490065" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729">
              </ellipse>
            </g>
            <g id="编组-35备份-5" stroke="#3DDEFF"
              transform="translate(336.025762, 276.677180) scale(-1, 1) rotate(-360.000000) translate(-336.025762, -276.677180) translate(317.575299, 269.424371)">
              <line id="路径-20" stroke-width="1.11792864" x1="0" x2="24.6006182" y1="7.25280904" y2="7.25280904"></line>
              <ellipse id="椭圆形" cx="30.1916678" cy="7.81071743" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729">
              </ellipse>
              <line id="路径-8" stroke-width="1.11792864" x1="12.8594141" x2="12.8594141" y1="13.3898013" y2="0"></line>
            </g>
            <ellipse id="椭圆形备份-7" cx="394.731783" cy="279.466722" rx="20.407542" ry="20.3620722" stroke="#3DDEFF"
              stroke-width="1.67689297"
              transform="translate(394.731783, 279.466722) rotate(-360.000000) translate(-394.731783, -279.466722) ">
            </ellipse>
            <polyline id="路径-21备份"
              points="363.421905 211.401899 363.421905 215.865166 372.367585 211.401899 372.367585 215.865166"
              stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(367.894745, 213.633533) rotate(-360.000000) translate(-367.894745, -213.633533) ">
            </polyline>
            <g id="螺旋2备份" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(396.306775, 279.085664) scale(-1, 1) rotate(-570.000000) translate(-396.306775, -279.085664) translate(384.565570, 267.165379)">
              <rect id="矩形" height="23.4321523" opacity="0" width="23.4824083" x="0" y="0.408417286"></rect>
              <path id="路径"
                d="M21.9199182,17.3540898 C21.2656431,18.0235835 20.5402512,18.6234882 19.7579658,19.1370066 C19.3668232,19.3937659 18.9614571,19.6289285 18.5442382,19.840095 C18.1270193,20.0512614 17.6979477,20.2384317 17.2593937,20.4016058 C15.5075486,21.0567017 13.6110991,21.313461 11.745467,21.1550861 C11.2784663,21.1166922 10.8138362,21.0495029 10.3539472,20.9583174 C9.89405824,20.8671319 9.43891038,20.7519501 8.9908742,20.6103726 C8.09480185,20.3272176 7.23191735,19.9432786 6.4164441,19.4705537 C5.60334141,18.9978287 4.84239107,18.4291191 4.14781647,17.7860212 C4.10514635,17.7452277 4.06010568,17.7068338 4.01743557,17.6660403 L3.88942523,17.5412601 C3.80408501,17.459673 3.72111534,17.3732868 3.63814568,17.2893001 C3.47457692,17.1165275 3.31337872,16.9413554 3.16166276,16.7565847 C2.85586029,16.3918426 2.576134,16.0031044 2.32011333,15.5999684 C1.8128131,14.7912969 1.41692929,13.9082371 1.14431468,12.9891831 C0.871700074,12.0701291 0.727095805,11.1102815 0.710501873,10.1480343 C0.69390794,9.18578716 0.807694906,8.22114037 1.04712165,7.29008825 C1.28891895,6.3566365 1.65635603,5.45917904 2.13995063,4.62411168 L2.23240254,4.46813645 C2.26321984,4.41534483 2.29640771,4.36495284 2.32722501,4.31456084 C2.38885962,4.21137723 2.45760591,4.11299285 2.52398164,4.01220886 C2.55716951,3.96181687 2.59272793,3.91382449 2.6259158,3.86343249 L2.67806816,3.78904431 C2.69466209,3.76504812 2.71362658,3.74105193 2.73022052,3.71705574 L2.8368958,3.57067899 L2.9483122,3.42910147 L3.00283512,3.35711291 L3.05972861,3.28752396 L3.17351557,3.14834607 L3.29204366,3.01156779 L3.35130771,2.94437846 L3.41057175,2.87718913 L3.5314704,2.74281048 L3.65473961,2.61323106 L3.71637422,2.54844135 L3.78037939,2.48605126 L3.91076029,2.35887146 C4.25923287,2.02292481 4.6361522,1.7157736 5.03677714,1.44221704 C5.43977264,1.17106011 5.8641032,0.935897461 6.30502769,0.736729095 C6.74595219,0.537560728 7.20584117,0.376786263 7.67521241,0.256805319 C8.14458364,0.139223994 8.62343712,0.0624361901 9.10703173,0.0240422881 C10.0718504,-0.0479462782 11.0508924,0.0408396202 11.9872643,0.302398078 C12.454265,0.431977497 12.914154,0.602350437 13.3527079,0.81111728 L13.5162767,0.892704322 L13.5992463,0.933497842 C13.6276931,0.947895556 13.6537692,0.95989365 13.6798454,0.974291363 L13.9998713,1.15186316 C14.104176,1.21425325 14.2084807,1.28144258 14.3104149,1.34383267 C14.336491,1.36063 14.3625672,1.37502772 14.3886434,1.39182505 L14.4645014,1.44461666 L14.6138468,1.55019989 C15.0121011,1.83335492 15.3866499,2.15010461 15.7351225,2.49564973 C16.0859656,2.84599409 16.3988798,3.23713196 16.6691238,3.65706527 C17.2072414,4.49693187 17.5675668,5.45677943 17.712171,6.44782202 C17.8567753,7.44126424 17.7903996,8.4659015 17.517785,9.4329479 C17.2427998,10.3999943 16.7592052,11.3094499 16.1096713,12.0725287 L16.0480366,12.1445172 C16.0385544,12.1565153 16.0290722,12.1685134 16.0172193,12.1805115 L15.986402,12.2141062 L15.8583917,12.3508845 C15.775422,12.4444696 15.6805996,12.5308559 15.5905182,12.6220414 C15.5691832,12.643638 15.543107,12.6652345 15.5194014,12.6868311 L15.4482845,12.7492212 L15.3771677,12.8116113 C15.3653149,12.8212098 15.353462,12.8332079 15.3416092,12.8428063 L15.3036802,12.8716018 L15.1543349,12.9915827 C15.142482,13.0011812 15.1282587,13.0107796 15.1164059,13.0203781 L15.0784769,13.0491736 L15.0002483,13.1043648 C14.5854,13.4043171 14.1278816,13.6394798 13.6490281,13.8170516 C13.1678041,13.9874245 12.665245,14.1026062 12.1579448,14.1386005 C12.0299344,14.1505986 11.9042946,14.1529982 11.7762843,14.1577975 C11.745467,14.1601971 11.7122791,14.1577975 11.6814618,14.1577975 L11.5866394,14.1553979 L11.4918169,14.1529982 C11.4609996,14.1529982 11.4278117,14.148199 11.3969944,14.148199 L11.2049789,14.1362009 L11.015334,14.1146043 C10.9845167,14.1098051 10.9513288,14.1074055 10.9205115,14.1026062 L10.825689,14.0882085 C10.7616839,14.07861 10.7000493,14.0690116 10.6360441,14.0570135 C10.5104043,14.0306177 10.3847645,14.0066215 10.2614953,13.9706272 L10.1690434,13.946631 L10.1216322,13.9346329 C10.1074088,13.9298337 10.0908149,13.9250344 10.0765915,13.9202352 L9.89405824,13.8626444 C9.65226094,13.7786577 9.4128342,13.6826729 9.18288971,13.5674912 L9.09754948,13.5242981 C9.06910274,13.5099004 9.040656,13.493103 9.01220926,13.4787053 L8.84626993,13.3851202 L8.68270117,13.2843362 L8.59973151,13.2339442 C8.57365533,13.2171469 8.54757915,13.1979499 8.51913241,13.178753 L8.36030477,13.0683705 C8.30815241,13.0299766 8.25837061,12.9891831 8.20621825,12.9507892 L8.13036027,12.8907987 C8.10428409,12.8716018 8.08057847,12.8500052 8.05687286,12.8284086 L7.90989803,12.7036284 C7.86248679,12.6604353 7.81507555,12.6148425 7.77003488,12.5716494 C7.72262364,12.5260566 7.67758297,12.4828635 7.63017173,12.4348711 C7.58513106,12.3868787 7.53771982,12.3388864 7.49504971,12.290894 L7.36466881,12.139718 C7.19635893,11.9333508 7.04464297,11.7149855 6.91189151,11.484622 L6.86210971,11.3982358 C6.84551578,11.3694403 6.82892185,11.3406449 6.81469848,11.3094499 L6.72698769,11.1294785 C6.69854095,11.069488 6.67246477,11.0070979 6.64638859,10.9471074 C6.63216522,10.9159124 6.62031241,10.8847173 6.6084596,10.8535223 L6.57290118,10.7599371 C6.48044927,10.5103768 6.40933241,10.2512179 6.35718005,9.98965948 C6.30502769,9.72810103 6.27895151,9.45934371 6.27183983,9.19298602 C6.26472814,8.92662832 6.28132208,8.65787101 6.3168805,8.39151331 C6.39273848,7.86119754 6.55630724,7.34287986 6.79810455,6.86535571 C6.92137376,6.62779344 7.06360747,6.39982964 7.22243511,6.18386395 L7.28406971,6.10467652 L7.31488702,6.063883 C7.32436926,6.05188491 7.33622207,6.03748719 7.34570432,6.0254891 L7.47371466,5.87191349 L7.60883668,5.72553674 C7.62068949,5.71353865 7.63017173,5.70154055 7.64439511,5.68954246 L7.68232409,5.65354817 L7.75581151,5.58155961 C8.15643645,5.20241982 8.63766049,4.90486708 9.15918409,4.72489567 C9.68070768,4.54252463 10.2377897,4.47293569 10.78776,4.52092806 C11.3377304,4.56652082 11.8782185,4.73209452 12.3641836,5.00325146 C12.6059809,5.13763011 12.8359254,5.3008042 13.0445349,5.48317523 C13.0990578,5.52876799 13.146469,5.57676037 13.1986214,5.62475275 L13.2365504,5.66074703 L13.2744794,5.69914093 L13.3503373,5.77832835 C13.3764135,5.80472416 13.3977486,5.83351959 13.4214542,5.8599154 C13.4451598,5.88871082 13.4688654,5.91510663 13.4902005,5.94390206 C13.5352412,6.00149291 13.5802818,6.05908376 13.6205814,6.11907424 C13.7059216,6.23665556 13.779409,6.36383536 13.8481553,6.49341478 C13.8813432,6.55820449 13.914531,6.6229942 13.9429778,6.69258315 C13.9572011,6.72617781 13.9737951,6.75977248 13.9856479,6.79336714 L14.0235769,6.89655075 C14.0378003,6.93014542 14.0472825,6.9661397 14.0591353,6.99973436 C14.0709881,7.03572865 14.0828409,7.06932331 14.0923232,7.10531759 C14.1112877,7.17490654 14.1326227,7.24689511 14.1468461,7.31888367 C14.180034,7.46286081 14.201369,7.60683794 14.2155924,7.75321469 C14.2701153,8.33632208 14.1681811,8.9362268 13.9263838,9.47134181 L13.8789726,9.56972618 L13.855267,9.62011818 L13.8291908,9.66811055 L13.7770385,9.76409531 L13.720145,9.85768045 L13.6916982,9.90567282 L13.6608809,9.95126558 L13.5992463,10.0424511 L13.5328706,10.131237 L13.4996827,10.1744301 L13.4641243,10.2176233 L13.3930074,10.3016099 C13.3693018,10.3304054 13.3432256,10.3544016 13.31952,10.383197 C13.2721088,10.4359886 13.2152153,10.4911798 13.1606924,10.5439714 C13.0469054,10.6471551 12.9260068,10.7431398 12.7956259,10.8271265 C12.6676155,10.9135128 12.530123,10.9855013 12.3902598,11.0478914 C12.2480261,11.1102815 12.1034218,11.1606735 11.9540764,11.1990674 C11.804731,11.2374613 11.6530151,11.2614575 11.4989286,11.2758552 C11.3448421,11.2902529 11.1907555,11.2902529 11.0390396,11.2782548 C10.8849531,11.2662567 10.7332371,11.2422605 10.5838917,11.2038666 C10.4345463,11.1678724 10.2875715,11.1174804 10.1453378,11.0550903 C9.86087038,10.9327097 9.59773802,10.7599371 9.36779353,10.5535699 L9.28482386,10.4743825 C9.27060049,10.4623844 9.25637712,10.4455871 9.24215375,10.4311894 L9.19948364,10.3855966 C9.14259016,10.3256061 9.0904378,10.2608164 9.040656,10.1960267 C8.9410924,10.0640477 8.85575218,9.92007054 8.78463533,9.76889455 C8.64240162,9.46654257 8.56417308,9.13539516 8.55232027,8.80184814 C8.54046746,8.46830112 8.59736094,8.13235447 8.71588903,7.82040402 C8.83678769,7.50845357 9.0216915,7.2204993 9.25400656,6.98293703 L9.25874768,6.97813779 C9.54795622,6.68298467 10.0173275,6.68298467 10.3089066,6.97333856 C10.6004857,7.26609206 10.6004857,7.7412166 10.3136477,8.03636972 L10.3041654,8.04596819 C10.209343,8.13955333 10.1382261,8.24753618 10.0884443,8.36991674 C10.0386625,8.48989769 10.0149569,8.62427634 10.0173275,8.75625538 C10.019698,8.88823442 10.0481448,9.02021346 10.1026677,9.1401944 C10.1287439,9.20018487 10.1619317,9.25777573 10.2022313,9.31056734 C10.2211958,9.33696315 10.2425308,9.36335896 10.2638659,9.38735515 L10.2804598,9.4065521 C10.2852009,9.41375095 10.2923126,9.41855019 10.2994243,9.42574905 L10.3397239,9.46654257 C10.4511403,9.56972618 10.5791506,9.65611246 10.7166432,9.71850255 C10.7853895,9.7496976 10.8565063,9.7760934 10.9323643,9.79529035 C11.0058517,9.81448731 11.0817097,9.82888502 11.1575677,9.83608388 C11.2334257,9.84328273 11.3116542,9.84568235 11.3875122,9.83848349 C11.4633701,9.83368426 11.5392281,9.82168616 11.6150861,9.80488883 C11.6885735,9.7880915 11.7620609,9.76169569 11.8331778,9.73290026 C11.9042946,9.70410484 11.9730409,9.66811055 12.0370461,9.62731703 C12.1010513,9.58652351 12.1626859,9.53853113 12.2219499,9.48813914 C12.2503967,9.46174333 12.2788434,9.43534752 12.3072901,9.40415248 C12.3215135,9.38735515 12.3381074,9.37295743 12.3523308,9.35855972 L12.3950009,9.31056734 C12.4021126,9.30336848 12.4092243,9.29377001 12.416336,9.28657115 L12.4353005,9.26017535 L12.4756,9.20978335 L12.5111585,9.15699173 L12.530123,9.13059593 L12.5467169,9.10420012 L12.5799047,9.04900888 L12.6107221,8.99381765 L12.627316,8.96502222 L12.6415394,8.9362268 L12.6699861,8.87863594 C12.8145904,8.56908511 12.8809661,8.21874075 12.8525194,7.87319563 C12.8264432,7.52765052 12.7102856,7.19170387 12.5158996,6.90614923 C12.492194,6.87015494 12.4661178,6.83656028 12.4400416,6.800566 C12.4281888,6.78376866 12.4115949,6.76697133 12.3997421,6.750174 C12.3855187,6.73337667 12.3736659,6.71657934 12.3570719,6.699782 L12.3120313,6.65178963 C12.3049196,6.64459077 12.2978079,6.63499229 12.2883256,6.62779344 L12.2622495,6.60379725 C12.2290616,6.5726022 12.1958737,6.53660792 12.1603153,6.50781249 C12.0228227,6.38303231 11.8734773,6.27504946 11.7146497,6.18386395 C11.3969944,5.99909329 11.036669,5.88391159 10.6692319,5.8479173 C10.3017949,5.81192302 9.92487555,5.85271654 9.5740324,5.97029786 C9.22081869,6.08547957 8.89605173,6.2798487 8.62106656,6.5342083 L8.5689142,6.58220068 L8.54283802,6.60619687 L8.51676184,6.63259268 L8.41482769,6.73817591 L8.31763465,6.85095799 C8.31052297,6.86055647 8.30104072,6.87015494 8.29392904,6.87975342 L8.27022342,6.90854885 L8.22518274,6.9661397 C8.10665465,7.12211493 7.99997937,7.28768863 7.9051569,7.46046119 C7.72262364,7.80840592 7.59461331,8.18994533 7.53534926,8.5810832 C7.50453196,8.77785195 7.49030859,8.97702032 7.49267915,9.17378907 C7.49504971,9.37295743 7.51164365,9.5721258 7.54720207,9.76649493 C7.5827605,9.96326368 7.6325423,10.1552332 7.69891803,10.3424035 L7.72499421,10.4119924 C7.73447645,10.4359886 7.74158814,10.4599848 7.75107039,10.4815814 L7.80796387,10.6183596 L7.87196904,10.7527383 C7.88145128,10.7743349 7.89567465,10.7959314 7.90752746,10.817528 L7.94308589,10.8823177 C8.04027892,11.0550903 8.15169533,11.220664 8.27496454,11.3766392 L8.36978701,11.4918209 C8.40297488,11.5302148 8.43616274,11.5662091 8.46935061,11.6022034 C8.50253847,11.6381977 8.54046746,11.6741919 8.57602589,11.7101862 C8.61395488,11.7461805 8.6495133,11.7821748 8.68744229,11.8181691 C9.29193555,12.3748806 10.0434036,12.7660185 10.8470241,12.9315922 C10.8968059,12.9411907 10.9489582,12.9507892 10.99874,12.9603877 L11.074598,12.9747854 C11.1006742,12.9795846 11.1243798,12.9819842 11.150456,12.9843838 L11.3021719,13.0035808 L11.4562585,13.0155789 C11.4823346,13.0179785 11.5084108,13.0203781 11.5321164,13.0203781 L11.6079744,13.0227777 L11.6838324,13.0251774 C11.7099086,13.0251774 11.7359848,13.027577 11.7596904,13.027577 C11.8616245,13.0251774 11.9659292,13.0251774 12.0678634,13.0179785 C12.4779706,12.9939823 12.8833367,12.907596 13.2744794,12.775617 C13.6632515,12.6364391 14.0354297,12.4540681 14.37442,12.2141062 L14.4384252,12.170913 L14.4692425,12.1493165 C14.4787247,12.1421176 14.4905776,12.1325191 14.5000598,12.1253203 L14.623329,12.0293355 L14.6541463,12.0053393 C14.6636286,11.9981405 14.6731108,11.988542 14.6849636,11.9813432 L14.7442277,11.9309512 L14.8034917,11.8805592 C14.8224562,11.8637618 14.8437913,11.8469645 14.8627558,11.8277675 C14.9386137,11.755779 15.0144717,11.6885896 15.0879591,11.6070026 L15.1993755,11.4918209 L15.2278223,11.4630255 C15.2373045,11.453427 15.2444162,11.4438285 15.2538984,11.4318304 L15.3060508,11.37184 C15.8655034,10.7311417 16.2874634,9.96566329 16.5340018,9.14499364 C16.7781697,8.32192436 16.846916,7.44606347 16.7354996,6.59179915 C16.6217126,5.73753483 16.3253924,4.90966632 15.8702445,4.17778256 C15.6426706,3.81304049 15.3771677,3.47229461 15.0761063,3.16274378 C14.7703038,2.85079333 14.4384252,2.56283906 14.087582,2.30607984 L13.9548306,2.21009508 L13.8884549,2.16210271 C13.8671198,2.14530538 13.8434142,2.13330728 13.8197086,2.11650995 C13.7272567,2.0589191 13.6371753,1.99892862 13.5447234,1.94133777 L13.260256,1.77816369 C13.2365504,1.76376597 13.2128447,1.75176788 13.1891391,1.73976979 L13.1156517,1.7037755 L12.9710474,1.62938732 C12.5799047,1.43741781 12.1721681,1.27904296 11.7525787,1.1566624 C10.9157704,0.909501654 10.0339214,0.815916517 9.16392521,0.868708133 C8.72774184,0.89510394 8.29392904,0.95989365 7.86722791,1.06067764 C7.44289735,1.16386125 7.02567848,1.30303915 6.62268297,1.47821133 C6.21968747,1.65338351 5.83091534,1.85975073 5.46347826,2.10211224 C5.09604118,2.34447374 4.74993916,2.62042991 4.42754276,2.92278189 L4.30664411,3.0379636 L4.24738006,3.09555445 L4.18811602,3.15554492 L4.07195849,3.27552587 L3.95817152,3.39790643 L3.90127804,3.46029652 L3.84675512,3.52268661 L3.73533872,3.64746679 L3.62866343,3.77704621 L3.57414051,3.84183592 L3.52198815,3.90662563 L3.41768344,4.03860467 L3.31574928,4.17298333 C3.29915535,4.1945799 3.28256141,4.21857608 3.26596748,4.24017265 L3.21618568,4.30736198 C3.18299782,4.35295474 3.14980995,4.3985475 3.11899265,4.44414026 C3.05735804,4.5377254 2.99098231,4.62891091 2.93171827,4.72249605 C2.90090097,4.77048843 2.87008366,4.81608119 2.84163692,4.86407356 L2.75392613,5.0080507 C2.29403715,5.77592874 1.93845288,6.61099611 1.7013967,7.47965814 C1.46434052,8.34832017 1.34581243,9.25057687 1.34818299,10.1528336 C1.35055356,11.0550903 1.47382277,11.9597466 1.72036119,12.8308082 C1.96452906,13.7018699 2.32722501,14.5369373 2.79659625,15.3096145 C3.03365243,15.6935536 3.29204366,16.0654945 3.57888164,16.4158388 C3.72111534,16.591011 3.87046074,16.761384 4.02454725,16.9269577 C4.10277579,17.0085447 4.17863377,17.0901317 4.25923287,17.1717188 L4.38013152,17.2916997 C4.42043107,17.3324932 4.46310118,17.3708871 4.50340073,17.4092811 C5.16004635,18.0355816 5.8830677,18.5922932 6.66061196,19.0578192 C7.43815623,19.5233453 8.26548229,19.9072843 9.12599622,20.1904393 C9.55506791,20.3320168 9.99362184,20.4495982 10.4369169,20.5455829 C10.8802119,20.6391681 11.3282481,20.7111566 11.7786549,20.7543498 C13.5826524,20.9343212 15.42932,20.7111566 17.1432362,20.0944546 C17.5723079,19.940879 17.9918973,19.7633072 18.4020045,19.5641388 C18.8121117,19.3649704 19.2103661,19.1394063 19.5967676,18.8946451 C20.3672002,18.4051229 21.0854804,17.8292144 21.7350144,17.1813173 C21.7847962,17.1309253 21.8653953,17.1309253 21.9151771,17.1837169 C21.9673294,17.2245104 21.9673294,17.3036978 21.9199182,17.3540898 L21.9199182,17.3540898 Z">
              </path>
            </g>
            <g id="风机备份" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(443.373915, 123.810282) rotate(-360.000000) translate(-443.373915, -123.810282) translate(410.386722, 90.893687)">
              <rect id="矩形" height="65.8331897" opacity="0" width="65.9743853" x="0" y="0"></rect>
              <path id="形状"
                d="M32.9871926,63.0901401 C49.6787121,63.0681958 63.2034611,49.5723919 63.2254525,32.9165949 C63.2034611,16.2607979 49.6787121,2.76499397 32.9871926,2.74304959 C16.2956732,2.76499397 2.77092418,16.2607979 2.74893274,32.9165949 C2.77092418,49.5723919 16.2956732,63.0681958 32.9871926,63.0901401 Z M32.9871926,65.8331897 C14.7768879,65.8126169 0.0206169954,51.0879267 0,32.9165949 C0.0206169954,14.745263 14.7768879,0.0205728718 32.9871926,0 C51.1974974,0.0205728718 65.9537683,14.745263 65.9743853,32.9165949 C65.9537683,51.0879267 51.1974974,65.8126169 32.9871926,65.8331897 Z">
              </path>
              <path id="形状"
                d="M21.1091601,20.5034575 C21.1091601,26.6015486 25.9624885,31.5456782 31.9508623,31.5479969 L33.6224118,31.5479969 L33.6224118,9.46451729 L31.9508623,9.46451729 C25.9640985,9.46683489 21.111436,14.4084061 21.1091601,20.5048573 L21.1091601,20.5034575 Z M27.3156119,50.3055163 C29.8069965,48.841167 31.6250658,46.428928 32.3698367,43.5995025 C33.1146075,40.7700769 32.7250672,37.7552552 31.2869163,35.2183115 L30.4525163,33.7499057 L11.661332,44.7902457 L12.4943575,46.262851 C13.9325948,48.8000239 16.3017848,50.651379 19.0806151,51.4095475 C21.8594454,52.1677159 24.8202318,51.7705769 27.311488,50.3055163 L27.3156119,50.3055163 Z M49.827918,29.3950816 C44.6409592,26.3482671 38.0106672,28.158556 35.016286,33.4391468 L34.1832606,34.9103522 L52.9648224,45.9548916 L53.7978478,44.4836862 C55.2365491,41.9467861 55.6265428,38.9317533 54.8820152,36.1020102 C54.1374877,33.2722672 52.3194422,30.8596698 49.827918,29.3950816 L49.827918,29.3950816 Z">
              </path>
            </g>
            <g id="风机备份-2" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(440.019285, 412.806827) rotate(-360.000000) translate(-440.019285, -412.806827) translate(407.032092, 379.890232)">
              <rect id="矩形" height="65.8331897" opacity="0" width="65.9743853" x="0" y="0"></rect>
              <path id="形状"
                d="M32.9871926,63.0901401 C49.6787121,63.0681958 63.2034611,49.5723919 63.2254525,32.9165949 C63.2034611,16.2607979 49.6787121,2.76499397 32.9871926,2.74304959 C16.2956732,2.76499397 2.77092418,16.2607979 2.74893274,32.9165949 C2.77092418,49.5723919 16.2956732,63.0681958 32.9871926,63.0901401 Z M32.9871926,65.8331897 C14.7768879,65.8126169 0.0206169954,51.0879267 0,32.9165949 C0.0206169954,14.745263 14.7768879,0.0205728718 32.9871926,0 C51.1974974,0.0205728718 65.9537683,14.745263 65.9743853,32.9165949 C65.9537683,51.0879267 51.1974974,65.8126169 32.9871926,65.8331897 Z">
              </path>
              <path id="形状"
                d="M18.8727402,21.6192743 C18.8727402,27.7173653 23.7260687,32.661495 29.7144425,32.6638137 L31.3859919,32.6638137 L31.3859919,10.5803341 L29.7144425,10.5803341 C23.7276786,10.5826517 18.8750161,15.5242229 18.8727402,21.620674 L18.8727402,21.6192743 Z M25.0791921,51.4213331 C27.5705767,49.9569838 29.388646,47.5447448 30.1334168,44.7153192 C30.8781877,41.8858937 30.4886474,38.871072 29.0504965,36.3341283 L28.2160965,34.8657225 L9.42491218,45.9060625 L10.2579376,47.3786677 C11.696175,49.9158407 14.0653649,51.7671958 16.8441953,52.5253642 C19.6230256,53.2835327 22.5838119,52.8863937 25.0750682,51.4213331 L25.0791921,51.4213331 Z M47.5914982,30.5108984 C42.4045393,27.4640839 35.7742473,29.2743728 32.7798662,34.5549636 L31.9468407,36.026169 L50.7284026,47.0707084 L51.561428,45.599503 C53.0001293,43.0626028 53.3901229,40.0475701 52.6455954,37.217827 C51.9010679,34.388084 50.0830223,31.9754866 47.5914982,30.5108984 L47.5914982,30.5108984 Z">
              </path>
            </g>
            <line id="路径-2" stroke="#3DDEFF" stroke-width="2"
              transform="translate(167.948877, 354.226446) rotate(-360.000000) translate(-167.948877, -354.226446) "
              x1="164.807955" x2="171.089799" y1="354.226446" y2="354.226446"></line>
            <line id="路径-2备份" stroke="#3DDEFF" stroke-width="2"
              transform="translate(226.095793, 354.226446) rotate(-360.000000) translate(-226.095793, -354.226446) "
              x1="222.954871" x2="229.236715" y1="354.226446" y2="354.226446"></line>
            <path id="路径-3"
              d="M167.948877,351.436904 L167.948877,400.455535 C164.516814,401.201478 162.339284,404.588421 163.085226,408.020484 C163.614187,410.454217 165.515144,412.355174 167.948877,412.884134 L167.948877,412.884134 L167.948877,412.884134 L167.948877,423.407086 L142.575446,423.407086 L142.575446,443.59197"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(153.652964, 397.514437) rotate(-360.000000) translate(-153.652964, -397.514437) ">
            </path>
            <ellipse id="椭圆形" cx="142.571765" cy="443.491788" fill="#3DDEFF" rx="2.7955248" ry="2.78954194"
              transform="translate(142.571765, 443.491788) rotate(-360.000000) translate(-142.571765, -443.491788) ">
            </ellipse>
            <ellipse id="椭圆形备份-4" cx="226.437509" cy="406.669835" fill="#3DDEFF" rx="2.23656048" ry="2.23057762"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(226.437509, 406.669835) rotate(-360.000000) translate(-226.437509, -406.669835) ">
            </ellipse>
            <line id="路径-4" stroke="#3DDEFF" stroke-width="2"
              transform="translate(226.095793, 379.110041) rotate(-360.000000) translate(-226.095793, -379.110041) "
              x1="226.095793" x2="226.095793" y1="351.436904" y2="406.783178"></line>
            <polygon id="路径-5" fill="#3DDEFF"
              points="188.60125 486.039648 195.809098 486.039648 188.60125 503.892716 195.803493 503.892716"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(192.205174, 494.966182) rotate(-360.000000) translate(-192.205174, -494.966182) ">
            </polygon>
            <line id="路径-6" stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(195.970967, 495.286001) rotate(-360.000000) translate(-195.970967, -495.286001) "
              x1="192.335788" x2="199.606147" y1="495.286001" y2="495.286001"></line>
            <ellipse id="椭圆形" cx="202.631474" cy="494.81936" rx="3.68207849" ry="3.67300199" stroke="#3DDEFF"
              stroke-width="1.11792864"
              transform="translate(202.631474, 494.819360) rotate(-360.000000) translate(-202.631474, -494.819360) ">
            </ellipse>
            <g id="编组-6" transform="translate(518.837981, 0.000000)">
              <rect id="矩形" fill="#3DDEFF" height="20.084702" opacity="0.544363839" width="46.9648166" x="10.0789922"
                y="0.512528508"></rect>
              <text id="室外机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
                font-weight="normal">
                <tspan x="14.5772972" y="13.9913928">室外机</tspan>
              </text>
              <line id="路径-9" stroke="#238AA4" stroke-width="1.11792864" x1="0.574207873" x2="10.6380972"
                y1="30.0816731" y2="20.0393221"></line>
            </g>
            <g id="编组-6备份" transform="translate(518.837981, 323.586865)">
              <rect id="矩形" fill="#3DDEFF" height="20.084702" opacity="0.544363839" width="46.9648166" x="10.0789922"
                y="0.512528508"></rect>
              <text id="室内机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
                font-weight="normal">
                <tspan x="14.5772972" y="13.9913928">室内机</tspan>
              </text>
              <line id="路径-9" stroke="#238AA4" stroke-width="1.11792864" x1="0.574207873" x2="10.6380972"
                y1="30.0816731" y2="20.0393221"></line>
            </g>
            <text id="CV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="227.000295" y="206.414893">CV</tspan>
            </text>
            <text id="DLEP" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="392.495363" y="232.078896">DLEP</tspan>
            </text>
            <text id="PV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="446.169439" y="281.174835">PV</tspan>
            </text>
            <text id="LPT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="287.383631" y="258.858499">LPT</tspan>
            </text>
            <text id="LPS" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="287.383631" y="281.174835">LPS</tspan>
            </text>
            <text id="SLFP1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="227.000295" y="258.858499">SLFP1</tspan>
            </text>
            <text id="LSV" fill="#3DDEFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="176.680849" y="137.234471">LSV</tspan>
            </text>
            <text id="SLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(108.472578, 176.745757) rotate(-270.000000) translate(-108.472578, -176.745757) ">
              <tspan x="86.7608763" y="181.245757">SLMC2</tspan>
            </text>
            <text id="SLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(118.536467, 382.557106) rotate(-270.000000) translate(-118.536467, -382.557106) ">
              <tspan x="95.2361045" y="387.057106">SLMC2</tspan>
            </text>
            <text id="EV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(218.111349, 494.334972) rotate(-360.000000) translate(-218.111349, -494.334972) ">
              <tspan x="209.108936" y="498.834972">EV</tspan>
            </text>
            <text id="FT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(184.035498, 430.723643) rotate(-360.000000) translate(-184.035498, -430.723643) ">
              <tspan x="175.562639" y="435.223643">FT</tspan>
            </text>
            <text id="HPV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(112.174551, 325.820750) rotate(-360.000000) translate(-112.174551, -325.820750) ">
              <tspan x="98.4061543" y="330.32075">HPV</tspan>
            </text>
            <text id="LPV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(146.898161, 325.820750) rotate(-360.000000) translate(-146.898161, -325.820750) ">
              <tspan x="134.188872" y="330.32075">LPV</tspan>
            </text>
            <text id="SC" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(178.385346, 460.855325) rotate(-360.000000) translate(-178.385346, -460.855325) ">
              <tspan x="168.853379" y="465.355325">SC</tspan>
            </text>
            <text id="RD" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(275.669609, 543.438454) rotate(-360.000000) translate(-275.669609, -543.438454) ">
              <tspan x="266.137642" y="547.938454">RD</tspan>
            </text>
            <text id="LLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(117.418258, 472.423651) rotate(-270.000000) translate(-117.418258, -472.423651) ">
              <tspan x="94.6474482" y="476.923651">LLMC2</tspan>
            </text>
            <text id="SLFC1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(87.785695, 174.602258) rotate(-270.000000) translate(-87.785695, -174.602258) ">
              <tspan x="67.6626539" y="179.102258">SLFC1</tspan>
            </text>
            <text id="SLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(76.603595, 381.001094) rotate(-270.000000) translate(-76.603595, -381.001094) ">
              <tspan x="55.4214473" y="385.501094">SLFC2</tspan>
            </text>
            <text id="LLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(76.044491, 473.070123) rotate(-270.000000) translate(-76.044491, -473.070123) ">
              <tspan x="54.8623423" y="477.570123">LLFC2</tspan>
            </text>
            <text id="SLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(53.121187, 192.399084) rotate(-270.000000) translate(-53.121187, -192.399084) ">
              <tspan x="31.939039" y="196.899084">SLFC2</tspan>
            </text>
            <text id="SLFC3" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(49.766557, 370.957200) rotate(-270.000000) translate(-49.766557, -370.957200) ">
              <tspan x="28.5844092" y="375.4572">SLFC3</tspan>
            </text>
            <text id="LLFP2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(19.574890, 408.959785) rotate(-270.000000) translate(-19.574890, -408.959785) ">
              <tspan x="-0.548151217" y="413.459785">LLFP2</tspan>
            </text>
            <text id="LLFP1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(19.574890, 164.617349) rotate(-270.000000) translate(-19.574890, -164.617349) ">
              <tspan x="0.510956192" y="169.117349">LLFP1</tspan>
            </text>
            <text id="HPS" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="478.597527" y="241.041692">HPS</tspan>
            </text>
            <text id="HPT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="478.597527" y="262.245468">HPT</tspan>
            </text>
            <text id="PV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="333.230237" y="293.493139">PV</tspan>
            </text>
            <g id="插座备份" fill-rule="nonzero" transform="translate(84.987635, 103.183740)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-5" fill-rule="nonzero" transform="translate(84.987635, 133.315422)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-6" fill-rule="nonzero" transform="translate(84.987635, 433.516254)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-7" fill-rule="nonzero" transform="translate(84.987635, 394.456666)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
          </g>
          <g id="编组-7" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(418.214191, 163.430363)">
            <text id="冷凝风机">
              <tspan x="0" y="14">冷凝风机</tspan>
            </text>
          </g>
          <g id="编组-7备份-3" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(413.741352, 535.072563)">
            <text id="蒸发器">
              <tspan x="0" y="14">蒸发器</tspan>
            </text>
          </g>
          <g id="编组-7备份-2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="15.651001"
            font-weight="normal" transform="translate(243.773444, 47.386034)">
            <text id="冷凝器">
              <tspan x="0" y="17">冷凝器</tspan>
            </text>
          </g>
          <g id="编组-7备份-4" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(489.779626, 435.749611)">
            <text id="电加热器">
              <tspan x="0" y="14">电加热器</tspan>
            </text>
          </g>
          <g id="编组-7备份" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(466.297218, 374.352138)">
            <text id="蒸发风机">
              <tspan x="0" y="14">蒸发风机</tspan>
            </text>
          </g>
        </g>
      </g>
    </g>
    <!-- 空调2 -->
    <g id="页面-1" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
      <g id="高速磁浮空调状态监控模块" transform="translate(0, 0)">
        <g id="编组-8备份-3" transform="translate(1295.000000, 208.000000)">
          <g id="编组-37">
            <g id="25向右箭头备份-4" fill-rule="nonzero"
              transform="translate(333.789342, 127.157732) rotate(-360.000000) translate(-333.789342, -127.157732) translate(299.683940, 84.198787)">
              <rect id="矩形" fill="#000000" height="18.9688852" opacity="0" width="19.0095686" x="0" y="1.13589324e-13">
              </rect>
              <polygon id="路径" fill="url(#linearGradient-1)"
                points="57.7386068 3.34745033 68.2108051 9.48444259 57.7386068 15.6214349 57.7386068 12.2880594 0 12.2880594 0 6.68455645 57.7386068 6.68455645">
              </polygon>
              <polygon id="路径备份" fill="url(#linearGradient-1)"
                points="57.7386068 39.0535871 68.2108051 45.1905794 57.7386068 51.3275717 57.7386068 47.9941962 0 47.9941962 0 42.3906933 57.7386068 42.3906933">
              </polygon>
              <polygon id="路径备份-3" fill="url(#linearGradient-1)"
                points="57.7386068 73.6439072 68.2108051 79.7808994 57.7386068 85.9178917 57.7386068 82.5845163 0 82.5845163 0 76.9810133 57.7386068 76.9810133">
              </polygon>
            </g>
            <g id="25向右箭头备份-5" fill-rule="nonzero"
              transform="translate(242.821416, 329.340722) rotate(-90.000000) translate(-242.821416, -329.340722) translate(16.614879, 96.300843)">
              <polygon id="路径备份-3" fill="url(#linearGradient-2)"
                points="57.7386068 453.805774 68.2108051 459.942766 57.7386068 466.079758 57.7386068 462.746383 0 462.746383 0 457.14288 57.7386068 457.14288">
              </polygon>
              <polygon id="路径备份-4" fill="url(#linearGradient-2)"
                points="57.7386068 420.331271 68.2108051 426.468263 57.7386068 432.605255 57.7386068 429.27188 0 429.27188 0 423.668377 57.7386068 423.668377">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-2)"
                points="57.7386068 387.972584 68.2108051 394.109576 57.7386068 400.246569 57.7386068 396.913193 0 396.913193 0 391.30969 57.7386068 391.30969">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-3)"
                points="106.160344 284.201624 114.057412 287.549074 106.160344 290.896525 106.160344 289.07832 62.6197555 289.07832 62.6197555 286.021864 106.160344 286.021864">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-4)"
                points="323.628011 180.755138 330.48033 184.109768 323.628011 187.464398 323.628011 185.642293 285.847659 185.642293 285.847659 182.579282 323.628011 182.579282"
                transform="translate(308.163995, 184.109768) rotate(-270.000000) translate(-308.163995, -184.109768) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-4)"
                points="464.522461 140.585734 471.37478 143.940364 464.522461 147.294994 464.522461 145.472889 426.742109 145.472889 426.742109 142.409878 464.522461 142.409878"
                transform="translate(449.058445, 143.940364) scale(-1, -1) rotate(-270.000000) translate(-449.058445, -143.940364) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-5)"
                points="308.006239 33.4745033 314.873254 36.8219536 308.006239 40.1694039 308.006239 38.3511991 270.144857 38.3511991 270.144857 35.294743 308.006239 35.294743"
                transform="translate(292.509056, 36.821954) scale(-1, -1) rotate(-180.000000) translate(-292.509056, -36.821954) ">
              </polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-5)"
                points="308.006239 0 314.873254 3.34745033 308.006239 6.69490065 308.006239 4.87669587 270.144857 4.87669587 270.144857 1.82023971 308.006239 1.82023971"
                transform="translate(292.509056, 3.347450) scale(-1, -1) translate(-292.509056, -3.347450) "></polygon>
              <polygon id="路径备份-5" fill="url(#linearGradient-6)"
                points="111.319885 191.588832 118.530251 194.936282 111.319885 198.283732 111.319885 196.465528 71.5654349 196.465528 71.5654349 193.409071 111.319885 193.409071"
                transform="translate(95.047843, 194.936282) scale(-1, -1) translate(-95.047843, -194.936282) ">
              </polygon>
            </g>
            <rect id="矩形备份-42" height="25.1027096" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(429.490186, 518.251512) rotate(-360.000000) translate(-429.490186, -518.251512) "
              width="181.521743" x="338.729315" y="505.700157"></rect>
            <rect id="矩形备份-43" height="19.5236258" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(428.837186, 470.829299) rotate(-360.000000) translate(-428.837186, -470.829299) "
              width="182.827744" x="337.423314" y="461.067486"></rect>
            <path id="形状"
              d="M96.1697345,204.852369 L96.1697345,30.5256424 L163.006021,30.5256424 M182.410104,31.0265813 L202.892192,31.0265813 M219.062261,31.0265813 L243.856367,31.0265813 M263.571159,30.0264736 L406.620516,30.0264736 M420.421063,30.0264736 L437.387739,30.0264736 M451.481936,30.0264736 L466.457043,30.0264736 M482.252462,30.0264736 L575.023222,30.0264736 L575.023222,64.03634 M575.023222,72.337553 L575.023222,78.4106672 M575.023222,86.0743588 L575.023222,93.7380504 M575.023222,101.289913 L575.023222,200.614708 M575.023222,207.435474 L575.023222,214.387957 M575.023222,221.371478 L575.023222,228.765298 M575.023222,237.281788 L575.023222,313.554333 L506.368348,313.554333 M491.575219,313.554333 L479.460132,313.554333 M462.441973,313.554333 L445.622289,313.554333 M424.882707,313.554333 L248.301967,313.554333 L229.842307,313.554333 M169.971589,313.499134 L158.78949,313.499134 M194.572207,313.499134 L183.390108,313.499134 M218.054616,313.499134 L206.872517,313.499134 M148.725601,312.941226 L97.2879444,312.941226 L97.2879444,258.791984 L97.2879444,245.992219 M96.7288394,232.602418 L96.7288394,220.328433"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(336.025762, 171.790404) rotate(-360.000000) translate(-336.025762, -171.790404) ">
            </path>
            <rect id="矩形备份-45" height="154.537456" stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(327.080083, 125.484007) rotate(-360.000000) translate(-327.080083, -125.484007) "
              width="46.4061336" x="303.877016" y="48.2152796"></rect>
            <path id="路径-5备份"
              d="M209.668041,142.221259 L209.668041,213.633533 L310.713071,213.633533 L310.713071,59.312562 C310.713071,57.6506296 312.060333,56.3033673 313.722265,56.3033673 C315.384198,56.3033673 316.73146,57.6506296 316.73146,59.312562 L316.73146,190.348658 C316.73146,192.16886 318.207025,193.644425 320.027227,193.644425 C321.847429,193.644425 323.322994,192.16886 323.322994,190.348658 L323.322994,59.3210315 C323.322994,57.6544216 324.674048,56.3033673 326.340658,56.3033673 C328.007268,56.3033673 329.358322,57.6544216 329.358322,59.3210315 L329.358322,190.352702 C329.358322,192.170671 330.832077,193.644425 332.650045,193.644425 C334.468013,193.644425 335.941768,192.170671 335.941768,190.352702 L335.941768,58.8613369 C335.941768,57.4486093 337.08701,56.3033673 338.499737,56.3033673 C339.912465,56.3033673 341.057707,57.4486093 341.057707,58.8613369 L341.057707,204.001477 L341.057707,204.001477"
              stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(275.362874, 134.968450) rotate(-360.000000) translate(-275.362874, -134.968450) ">
            </path>
            <polygon id="路径-8备份-3"
              points="204.775873 141.105442 214.56021 141.105442 204.775873 124.368191 214.56021 124.368191"
              stroke="#3DDEFF" stroke-width="2.81718018"
              transform="translate(209.668041, 132.736816) rotate(-360.000000) translate(-209.668041, -132.736816) ">
            </polygon>
            <path id="形状"
              d="M209.668041,123.252374 L209.668041,115.441656 L3.87278755,115.441656 L3.87278755,135.254551 C5.61533755,135.861443 6.53491508,137.763018 5.92672146,139.501839 C5.59097673,140.461731 4.83473778,141.216351 3.87278755,141.551377 C1.48863651,141.936128 -0.131528812,144.17663 0.254047024,146.555678 C0.554827641,148.41153 2.01295518,149.866537 3.87278755,150.166674 C5.61533755,150.534131 6.72943228,152.241606 6.36118779,153.980426 C6.09727787,155.226588 5.12162151,156.200156 3.87278755,156.463501 C1.48863651,156.848252 -0.131528812,159.088754 0.254047024,161.467802 C0.554827641,163.323654 2.01295518,164.778661 3.87278755,165.078798 C5.61533755,165.446254 6.72943228,167.153729 6.36118779,168.89255 C6.09727787,170.138711 5.12162151,171.11228 3.87278755,171.375625 C1.48863651,171.634631 -0.233683111,173.773198 0.0258790101,176.152246 C0.24647141,178.174113 1.84658436,179.770801 3.87278755,179.990922 L3.87278755,182.322374 L3.87278755,220.298294 M3.87278755,234.229119 L3.87278755,248.399247 M3.87278755,265.4034 L3.87278755,332.499111 M3.87278755,346.025074 L3.87278755,359.79028 M3.87278755,320.193873 L3.87278755,360.458684 L3.87278755,381.391905 C5.61533755,381.759362 6.72943228,383.466837 6.36118779,385.205657 C6.09727787,386.451819 5.12162151,387.425387 3.87278755,387.688732 C1.48863651,388.057219 -0.144741031,390.284537 0.224536706,392.663586 C0.515890097,394.540612 1.99173592,396.013299 3.87278755,396.304029 C6.24281604,396.935781 7.65086933,399.365093 7.01776259,401.730049 C6.60758844,403.262245 5.40827025,404.458997 3.87278755,404.868293 C1.48863651,405.236781 -0.144741031,407.464099 0.224536706,409.843147 C0.515890097,411.720173 1.99173592,413.19286 3.87278755,413.48359 C5.61533755,413.688982 6.86109375,415.265077 6.65526191,417.003897 C6.48287938,418.460146 5.33215929,419.608403 3.87278755,419.780417 C1.48863651,420.148904 -0.144741031,422.376222 0.224536706,424.755271 C0.515890097,426.632297 1.99173592,428.104984 3.87278755,428.395714 L3.87278755,443.465977 L192.894893,443.465977 L192.894893,455.765773"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(104.834021, 285.603715) rotate(-360.000000) translate(-104.834021, -285.603715) ">
            </path>
            <rect id="矩形" fill="#3DDEFF" height="4.4632671" stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(181.709112, 443.491788) rotate(-360.000000) translate(-181.709112, -443.491788) "
              width="12.3003091" x="175.558957" y="441.260155"></rect>
            <path id="形状结合"
              d="M194.31098,456.290177 L194.310841,461.977648 C193.935955,461.269533 193.190508,460.786948 192.332106,460.786948 C191.096966,460.786948 190.095686,461.786085 190.095686,463.018582 C190.095686,464.251079 191.096966,465.250215 192.332106,465.250215 C193.190508,465.250215 193.935955,464.767631 194.310841,464.059516 L194.31098,468.564162 L189.83814,468.564162 L189.83814,456.290177 L194.31098,456.290177 Z"
              fill="#3DDEFF" stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(192.074560, 462.427170) rotate(-360.000000) translate(-192.074560, -462.427170) ">
            </path>
            <polyline id="路径-10备份" points="192.335788 469.155574 192.335788 526.06223 254.955543 526.06223"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(223.645665, 497.608902) rotate(-360.000000) translate(-223.645665, -497.608902) ">
            </polyline>
            <g id="编组-4" stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(281.792581, 526.062230) rotate(-360.000000) translate(-281.792581, -526.062230) translate(254.955543, 518.251512)">
              <path id="矩形备份-46"
                d="M7.26850512,0.740600166 L7.26850512,14.8808347 L0.558964322,12.9679257 L0.558964322,2.65350912 L7.26850512,0.740600166 Z">
              </path>
              <polyline id="路径-12备份" points="7.82746944 2.23163355 53.6740762 8.14073334 7.82746944 14.5056181">
              </polyline>
              <polyline id="路径-13备份"
                points="7.82746944 7.4629156 50.7726702 7.81071743 53.6740762 7.81071743 7.82746944 4.4632671 7.82746944 11.1581678 48.1097036 8.36862581">
              </polyline>
            </g>
            <path id="形状"
              d="M332.112028,351.994813 L241.464512,351.994813 L241.464512,363.321325 L155.178224,363.321325 L155.178224,351.994813 L97.2879444,351.994813 L97.2879444,449.070872 M97.2879444,459.113223 L97.2879444,469.155574 M97.2879444,478.082108 L97.2879444,487.008643 M97.2879444,498.16681 L97.2879444,562.884183 L181.153688,562.884183 M201.281467,563.442092 L219.172826,563.442092 M237.064184,563.442092 L250.482703,563.442092 M265.019432,563.442092 L429.396291,563.442092 M446.169439,563.442092 L460.706168,563.442092 M479.715737,563.442092 L494.252466,563.442092 M508.789195,562.884183 L575.88179,562.884183 L575.88179,500.398444 M575.88179,489.240276 L575.88179,478.082108 M575.88179,468.039757 L575.88179,456.88159 M575.88179,444.607605 L575.88179,351.994813 L436.10555,351.994813 M414.859562,352.552721 L393.613573,352.552721 M372.367585,352.552721 L353.358016,352.552721"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(336.584867, 457.997406) rotate(-360.000000) translate(-336.584867, -457.997406) ">
            </path>
            <path id="路径-14备份"
              d="M307.776024,526.06223 L513.2675,526.06223 C514.12248,526.06223 514.815578,525.369131 514.815578,524.514151 C514.815578,523.659171 514.12248,522.966073 513.2675,522.966073 L345.221022,522.966073 C344.291924,522.966073 343.538741,522.21289 343.538741,521.283792 C343.538741,520.354694 344.291924,519.601511 345.221022,519.601511 L513.095327,519.601511 C514.045396,519.601511 514.815578,518.831328 514.815578,517.88126 C514.815578,516.931192 514.045396,516.161009 513.095327,516.161009 L345.005877,516.161009 C344.1956,516.161009 343.538741,515.50415 343.538741,514.693874 C343.538741,513.883597 344.1956,513.226738 345.005877,513.226738 L513.175286,513.226738 C514.081194,513.226738 514.815578,512.492354 514.815578,511.586446 C514.815578,510.680537 514.081194,509.946154 513.175286,509.946154 L286.822565,509.946154 L286.822565,509.946154 L286.822565,406.669835 L74.364641,406.669835"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(294.590110, 466.366032) rotate(-360.000000) translate(-294.590110, -466.366032) ">
            </path>
            <polyline id="路径-15备份"
              points="342.556571 465.882512 514.770852 465.882512 489.255388 470.626449 514.770852 475.776087 342.556571 475.776087"
              stroke="#3DDEFF" stroke-width="1.67689297"
              transform="translate(428.663712, 470.829299) rotate(-360.000000) translate(-428.663712, -470.829299) ">
            </polyline>
            <path id="形状"
              d="M74.364641,406.669835 L34.7080615,406.669835 L34.7080615,391.61955 C32.3046238,391.228927 30.6735945,388.968063 31.0650557,386.569769 C31.3698422,384.702488 32.8367764,383.238694 34.7080615,382.934559 C36.9496373,382.591008 38.4876924,380.499236 38.1434037,378.262458 C37.8711836,376.493896 36.4804166,375.106105 34.7080615,374.834468 C32.3046238,374.443845 30.6735945,372.18298 31.0650557,369.784686 C31.3698422,367.917406 32.8367764,366.453611 34.7080615,366.149477 C36.9496373,365.805925 38.4876924,363.714154 38.1434037,361.477376 C37.8711836,359.708814 36.4804166,358.321023 34.7080615,358.049386 C32.3046238,357.658762 30.6735945,355.397898 31.0650557,352.999604 C31.3698422,351.132324 32.8367764,349.668529 34.7080615,349.364395 C36.9496373,349.036674 38.5005534,346.957736 38.1721295,344.720958 C37.9094115,342.931679 36.5011779,341.526459 34.7080615,341.264303 L34.7080615,255.821957 M34.7080615,300.624568 L34.7080615,290.774763 M34.7080615,282.214825 L34.7080615,273.674474 L34.7080615,211.608216 C32.3046238,211.235404 30.6591246,208.988979 31.0327362,206.590685 C31.3272359,204.700228 32.8135496,203.217095 34.7080615,202.923226 C36.9496373,202.595505 38.5005534,200.516567 38.1721295,198.279789 C37.9094115,196.49051 36.5011779,195.08529 34.7080615,194.823134 C32.3046238,194.450322 30.6591246,192.203897 31.0327362,189.805603 C31.3272359,187.915146 32.8135496,186.432013 34.7080615,186.138143 C36.9496373,185.810422 38.5005534,183.731485 38.1721295,181.494706 C37.9094115,179.705427 36.5011779,178.300208 34.7080615,178.038052 C32.3046238,177.66524 30.6591246,175.418815 31.0327362,173.020521 C31.3272359,171.130063 32.8135496,169.646931 34.7080615,169.353061 C36.9496373,169.02534 38.5005534,166.946403 38.1721295,164.709624 C37.9094115,162.920345 36.5011779,161.515125 34.7080615,161.25297 L34.7080615,145.568709 L91.5601704,145.568709"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(61.270006, 276.119272) rotate(-360.000000) translate(-61.270006, -276.119272) ">
            </path>
            <path id="路径-17备份"
              d="M100.222635,145.568709 L168.94159,145.568709 L168.94159,235.676633 L224.637599,235.676633 C224.985009,233.369258 227.137138,231.780392 229.444514,232.127802 C231.278024,232.403865 232.717282,233.843123 232.993345,235.676633 L232.993345,235.676633 L232.993345,235.676633 C233.310978,237.87505 235.350639,239.399725 237.549056,239.082092 C239.313509,238.827159 240.699581,237.441087 240.954514,235.676633 L240.954514,235.676633 L240.954514,235.676633 C241.301925,233.369258 243.454054,231.780392 245.761429,232.127802 C247.59494,232.403865 249.034198,233.843123 249.310261,235.676633 L249.310261,235.676633 L249.310261,235.676633 C249.627894,237.87505 251.667555,239.399725 253.865971,239.082092 C255.630425,238.827159 257.016497,237.441087 257.27143,235.676633 L257.27143,235.676633 L257.27143,235.676633 C257.61884,233.369258 259.770969,231.780392 262.078345,232.127802 C263.911855,232.403865 265.351113,233.843123 265.627176,235.676633 L265.627176,235.676633 L265.627176,235.676633 C265.944809,237.87505 267.98447,239.399725 270.182886,239.082092 C271.94734,238.827159 273.333412,237.441087 273.588345,235.676633 L273.588345,235.676633 L273.588345,235.676633 L354.592695,235.676633 L354.592695,293.97234 L363.654599,293.97234 L373.485795,284.137326"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(236.854215, 219.770525) rotate(-360.000000) translate(-236.854215, -219.770525) ">
            </path>
            <polyline id="路径-18备份" points="341.057707 203.591182 341.057707 213.633533 363.421905 213.633533"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(352.239806, 208.612357) rotate(-360.000000) translate(-352.239806, -208.612357) ">
            </polyline>
            <path id="路径-19备份"
              d="M373.485795,214.055566 L385.098571,214.055566 C385.354417,212.095062 387.151123,210.713163 389.111627,210.969008 C390.721281,211.179068 391.988126,212.445912 392.198185,214.055566 L392.198185,214.055566 L392.198185,214.055566 C392.750678,217.032481 395.611828,218.997863 398.588743,218.44537 C400.819372,218.031382 402.564559,216.286195 402.978547,214.055566 L402.978547,214.055566 L402.978547,214.055566 C403.234392,212.095062 405.031098,210.713163 406.991603,210.969008 C408.601257,211.179068 409.868101,212.445912 410.078161,214.055566 L410.078161,214.055566 L410.078161,214.055566 C410.327628,215.989783 412.097852,217.355542 414.032069,217.106075 C415.624044,216.900749 416.877251,215.647542 417.082577,214.055566 L417.082577,214.055566 L417.082577,214.055566 C417.338422,212.095062 419.135129,210.713163 421.095633,210.969008 C422.705287,211.179068 423.972131,212.445912 424.182191,214.055566 L424.182191,214.055566 L424.182191,214.055566 C424.431658,215.989783 426.201883,217.355542 428.136099,217.106075 C429.728075,216.900749 430.981281,215.647542 431.186607,214.055566 L431.186607,214.055566 L431.186607,214.055566 L439.46018,214.055566 L439.46018,277.235089 L417.082577,277.235089"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(406.472987, 232.044509) rotate(-360.000000) translate(-406.472987, -232.044509) ">
            </path>
            <g id="编组-5" stroke="#3DDEFF"
              transform="translate(457.910644, 248.781761) rotate(-360.000000) translate(-457.910644, -248.781761) translate(439.460180, 231.486601)">
              <g id="编组-35备份-3">
                <line id="路径-20" stroke-width="1.11792864" x1="0" x2="23.8522752" y1="6.61345914" y2="6.61345914">
                </line>
                <ellipse id="椭圆形" cx="29.9863358" cy="6.69490065" rx="5.59133087" ry="5.57697201"
                  stroke-width="2.23585729"></ellipse>
              </g>
              <line id="路径-20备份-2" stroke-width="1.11792864" x1="0" x2="23.4824083" y1="27.337511" y2="27.337511">
              </line>
              <ellipse id="椭圆形备份-6" cx="30.1916678" cy="27.8954194" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729"></ellipse>
              <line id="路径-7" stroke-width="1.11792864" x1="11.7412042" x2="11.7412042" y1="21.2005187" y2="32.3586865">
              </line>
            </g>
            <g id="编组-35备份-4" stroke="#3DDEFF"
              transform="translate(336.025762, 253.802936) scale(-1, 1) rotate(-360.000000) translate(-336.025762, -253.802936) translate(317.575299, 247.108036)">
              <line id="路径-20" stroke-width="1.11792864" x1="0" x2="24.6006182" y1="7.25280904" y2="7.25280904"></line>
              <ellipse id="椭圆形" cx="30.1916678" cy="6.69490065" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729">
              </ellipse>
            </g>
            <g id="编组-35备份-5" stroke="#3DDEFF"
              transform="translate(336.025762, 276.677180) scale(-1, 1) rotate(-360.000000) translate(-336.025762, -276.677180) translate(317.575299, 269.424371)">
              <line id="路径-20" stroke-width="1.11792864" x1="0" x2="24.6006182" y1="7.25280904" y2="7.25280904"></line>
              <ellipse id="椭圆形" cx="30.1916678" cy="7.81071743" rx="5.59133087" ry="5.57697201"
                stroke-width="2.23585729">
              </ellipse>
              <line id="路径-8" stroke-width="1.11792864" x1="12.8594141" x2="12.8594141" y1="13.3898013" y2="0"></line>
            </g>
            <ellipse id="椭圆形备份-7" cx="394.731783" cy="279.466722" rx="20.407542" ry="20.3620722" stroke="#3DDEFF"
              stroke-width="1.67689297"
              transform="translate(394.731783, 279.466722) rotate(-360.000000) translate(-394.731783, -279.466722) ">
            </ellipse>
            <polyline id="路径-21备份"
              points="363.421905 211.401899 363.421905 215.865166 372.367585 211.401899 372.367585 215.865166"
              stroke="#3DDEFF" stroke-width="2.23585729"
              transform="translate(367.894745, 213.633533) rotate(-360.000000) translate(-367.894745, -213.633533) ">
            </polyline>
            <g id="螺旋2备份" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(396.306775, 279.085664) scale(-1, 1) rotate(-570.000000) translate(-396.306775, -279.085664) translate(384.565570, 267.165379)">
              <rect id="矩形" height="23.4321523" opacity="0" width="23.4824083" x="0" y="0.408417286"></rect>
              <path id="路径"
                d="M21.9199182,17.3540898 C21.2656431,18.0235835 20.5402512,18.6234882 19.7579658,19.1370066 C19.3668232,19.3937659 18.9614571,19.6289285 18.5442382,19.840095 C18.1270193,20.0512614 17.6979477,20.2384317 17.2593937,20.4016058 C15.5075486,21.0567017 13.6110991,21.313461 11.745467,21.1550861 C11.2784663,21.1166922 10.8138362,21.0495029 10.3539472,20.9583174 C9.89405824,20.8671319 9.43891038,20.7519501 8.9908742,20.6103726 C8.09480185,20.3272176 7.23191735,19.9432786 6.4164441,19.4705537 C5.60334141,18.9978287 4.84239107,18.4291191 4.14781647,17.7860212 C4.10514635,17.7452277 4.06010568,17.7068338 4.01743557,17.6660403 L3.88942523,17.5412601 C3.80408501,17.459673 3.72111534,17.3732868 3.63814568,17.2893001 C3.47457692,17.1165275 3.31337872,16.9413554 3.16166276,16.7565847 C2.85586029,16.3918426 2.576134,16.0031044 2.32011333,15.5999684 C1.8128131,14.7912969 1.41692929,13.9082371 1.14431468,12.9891831 C0.871700074,12.0701291 0.727095805,11.1102815 0.710501873,10.1480343 C0.69390794,9.18578716 0.807694906,8.22114037 1.04712165,7.29008825 C1.28891895,6.3566365 1.65635603,5.45917904 2.13995063,4.62411168 L2.23240254,4.46813645 C2.26321984,4.41534483 2.29640771,4.36495284 2.32722501,4.31456084 C2.38885962,4.21137723 2.45760591,4.11299285 2.52398164,4.01220886 C2.55716951,3.96181687 2.59272793,3.91382449 2.6259158,3.86343249 L2.67806816,3.78904431 C2.69466209,3.76504812 2.71362658,3.74105193 2.73022052,3.71705574 L2.8368958,3.57067899 L2.9483122,3.42910147 L3.00283512,3.35711291 L3.05972861,3.28752396 L3.17351557,3.14834607 L3.29204366,3.01156779 L3.35130771,2.94437846 L3.41057175,2.87718913 L3.5314704,2.74281048 L3.65473961,2.61323106 L3.71637422,2.54844135 L3.78037939,2.48605126 L3.91076029,2.35887146 C4.25923287,2.02292481 4.6361522,1.7157736 5.03677714,1.44221704 C5.43977264,1.17106011 5.8641032,0.935897461 6.30502769,0.736729095 C6.74595219,0.537560728 7.20584117,0.376786263 7.67521241,0.256805319 C8.14458364,0.139223994 8.62343712,0.0624361901 9.10703173,0.0240422881 C10.0718504,-0.0479462782 11.0508924,0.0408396202 11.9872643,0.302398078 C12.454265,0.431977497 12.914154,0.602350437 13.3527079,0.81111728 L13.5162767,0.892704322 L13.5992463,0.933497842 C13.6276931,0.947895556 13.6537692,0.95989365 13.6798454,0.974291363 L13.9998713,1.15186316 C14.104176,1.21425325 14.2084807,1.28144258 14.3104149,1.34383267 C14.336491,1.36063 14.3625672,1.37502772 14.3886434,1.39182505 L14.4645014,1.44461666 L14.6138468,1.55019989 C15.0121011,1.83335492 15.3866499,2.15010461 15.7351225,2.49564973 C16.0859656,2.84599409 16.3988798,3.23713196 16.6691238,3.65706527 C17.2072414,4.49693187 17.5675668,5.45677943 17.712171,6.44782202 C17.8567753,7.44126424 17.7903996,8.4659015 17.517785,9.4329479 C17.2427998,10.3999943 16.7592052,11.3094499 16.1096713,12.0725287 L16.0480366,12.1445172 C16.0385544,12.1565153 16.0290722,12.1685134 16.0172193,12.1805115 L15.986402,12.2141062 L15.8583917,12.3508845 C15.775422,12.4444696 15.6805996,12.5308559 15.5905182,12.6220414 C15.5691832,12.643638 15.543107,12.6652345 15.5194014,12.6868311 L15.4482845,12.7492212 L15.3771677,12.8116113 C15.3653149,12.8212098 15.353462,12.8332079 15.3416092,12.8428063 L15.3036802,12.8716018 L15.1543349,12.9915827 C15.142482,13.0011812 15.1282587,13.0107796 15.1164059,13.0203781 L15.0784769,13.0491736 L15.0002483,13.1043648 C14.5854,13.4043171 14.1278816,13.6394798 13.6490281,13.8170516 C13.1678041,13.9874245 12.665245,14.1026062 12.1579448,14.1386005 C12.0299344,14.1505986 11.9042946,14.1529982 11.7762843,14.1577975 C11.745467,14.1601971 11.7122791,14.1577975 11.6814618,14.1577975 L11.5866394,14.1553979 L11.4918169,14.1529982 C11.4609996,14.1529982 11.4278117,14.148199 11.3969944,14.148199 L11.2049789,14.1362009 L11.015334,14.1146043 C10.9845167,14.1098051 10.9513288,14.1074055 10.9205115,14.1026062 L10.825689,14.0882085 C10.7616839,14.07861 10.7000493,14.0690116 10.6360441,14.0570135 C10.5104043,14.0306177 10.3847645,14.0066215 10.2614953,13.9706272 L10.1690434,13.946631 L10.1216322,13.9346329 C10.1074088,13.9298337 10.0908149,13.9250344 10.0765915,13.9202352 L9.89405824,13.8626444 C9.65226094,13.7786577 9.4128342,13.6826729 9.18288971,13.5674912 L9.09754948,13.5242981 C9.06910274,13.5099004 9.040656,13.493103 9.01220926,13.4787053 L8.84626993,13.3851202 L8.68270117,13.2843362 L8.59973151,13.2339442 C8.57365533,13.2171469 8.54757915,13.1979499 8.51913241,13.178753 L8.36030477,13.0683705 C8.30815241,13.0299766 8.25837061,12.9891831 8.20621825,12.9507892 L8.13036027,12.8907987 C8.10428409,12.8716018 8.08057847,12.8500052 8.05687286,12.8284086 L7.90989803,12.7036284 C7.86248679,12.6604353 7.81507555,12.6148425 7.77003488,12.5716494 C7.72262364,12.5260566 7.67758297,12.4828635 7.63017173,12.4348711 C7.58513106,12.3868787 7.53771982,12.3388864 7.49504971,12.290894 L7.36466881,12.139718 C7.19635893,11.9333508 7.04464297,11.7149855 6.91189151,11.484622 L6.86210971,11.3982358 C6.84551578,11.3694403 6.82892185,11.3406449 6.81469848,11.3094499 L6.72698769,11.1294785 C6.69854095,11.069488 6.67246477,11.0070979 6.64638859,10.9471074 C6.63216522,10.9159124 6.62031241,10.8847173 6.6084596,10.8535223 L6.57290118,10.7599371 C6.48044927,10.5103768 6.40933241,10.2512179 6.35718005,9.98965948 C6.30502769,9.72810103 6.27895151,9.45934371 6.27183983,9.19298602 C6.26472814,8.92662832 6.28132208,8.65787101 6.3168805,8.39151331 C6.39273848,7.86119754 6.55630724,7.34287986 6.79810455,6.86535571 C6.92137376,6.62779344 7.06360747,6.39982964 7.22243511,6.18386395 L7.28406971,6.10467652 L7.31488702,6.063883 C7.32436926,6.05188491 7.33622207,6.03748719 7.34570432,6.0254891 L7.47371466,5.87191349 L7.60883668,5.72553674 C7.62068949,5.71353865 7.63017173,5.70154055 7.64439511,5.68954246 L7.68232409,5.65354817 L7.75581151,5.58155961 C8.15643645,5.20241982 8.63766049,4.90486708 9.15918409,4.72489567 C9.68070768,4.54252463 10.2377897,4.47293569 10.78776,4.52092806 C11.3377304,4.56652082 11.8782185,4.73209452 12.3641836,5.00325146 C12.6059809,5.13763011 12.8359254,5.3008042 13.0445349,5.48317523 C13.0990578,5.52876799 13.146469,5.57676037 13.1986214,5.62475275 L13.2365504,5.66074703 L13.2744794,5.69914093 L13.3503373,5.77832835 C13.3764135,5.80472416 13.3977486,5.83351959 13.4214542,5.8599154 C13.4451598,5.88871082 13.4688654,5.91510663 13.4902005,5.94390206 C13.5352412,6.00149291 13.5802818,6.05908376 13.6205814,6.11907424 C13.7059216,6.23665556 13.779409,6.36383536 13.8481553,6.49341478 C13.8813432,6.55820449 13.914531,6.6229942 13.9429778,6.69258315 C13.9572011,6.72617781 13.9737951,6.75977248 13.9856479,6.79336714 L14.0235769,6.89655075 C14.0378003,6.93014542 14.0472825,6.9661397 14.0591353,6.99973436 C14.0709881,7.03572865 14.0828409,7.06932331 14.0923232,7.10531759 C14.1112877,7.17490654 14.1326227,7.24689511 14.1468461,7.31888367 C14.180034,7.46286081 14.201369,7.60683794 14.2155924,7.75321469 C14.2701153,8.33632208 14.1681811,8.9362268 13.9263838,9.47134181 L13.8789726,9.56972618 L13.855267,9.62011818 L13.8291908,9.66811055 L13.7770385,9.76409531 L13.720145,9.85768045 L13.6916982,9.90567282 L13.6608809,9.95126558 L13.5992463,10.0424511 L13.5328706,10.131237 L13.4996827,10.1744301 L13.4641243,10.2176233 L13.3930074,10.3016099 C13.3693018,10.3304054 13.3432256,10.3544016 13.31952,10.383197 C13.2721088,10.4359886 13.2152153,10.4911798 13.1606924,10.5439714 C13.0469054,10.6471551 12.9260068,10.7431398 12.7956259,10.8271265 C12.6676155,10.9135128 12.530123,10.9855013 12.3902598,11.0478914 C12.2480261,11.1102815 12.1034218,11.1606735 11.9540764,11.1990674 C11.804731,11.2374613 11.6530151,11.2614575 11.4989286,11.2758552 C11.3448421,11.2902529 11.1907555,11.2902529 11.0390396,11.2782548 C10.8849531,11.2662567 10.7332371,11.2422605 10.5838917,11.2038666 C10.4345463,11.1678724 10.2875715,11.1174804 10.1453378,11.0550903 C9.86087038,10.9327097 9.59773802,10.7599371 9.36779353,10.5535699 L9.28482386,10.4743825 C9.27060049,10.4623844 9.25637712,10.4455871 9.24215375,10.4311894 L9.19948364,10.3855966 C9.14259016,10.3256061 9.0904378,10.2608164 9.040656,10.1960267 C8.9410924,10.0640477 8.85575218,9.92007054 8.78463533,9.76889455 C8.64240162,9.46654257 8.56417308,9.13539516 8.55232027,8.80184814 C8.54046746,8.46830112 8.59736094,8.13235447 8.71588903,7.82040402 C8.83678769,7.50845357 9.0216915,7.2204993 9.25400656,6.98293703 L9.25874768,6.97813779 C9.54795622,6.68298467 10.0173275,6.68298467 10.3089066,6.97333856 C10.6004857,7.26609206 10.6004857,7.7412166 10.3136477,8.03636972 L10.3041654,8.04596819 C10.209343,8.13955333 10.1382261,8.24753618 10.0884443,8.36991674 C10.0386625,8.48989769 10.0149569,8.62427634 10.0173275,8.75625538 C10.019698,8.88823442 10.0481448,9.02021346 10.1026677,9.1401944 C10.1287439,9.20018487 10.1619317,9.25777573 10.2022313,9.31056734 C10.2211958,9.33696315 10.2425308,9.36335896 10.2638659,9.38735515 L10.2804598,9.4065521 C10.2852009,9.41375095 10.2923126,9.41855019 10.2994243,9.42574905 L10.3397239,9.46654257 C10.4511403,9.56972618 10.5791506,9.65611246 10.7166432,9.71850255 C10.7853895,9.7496976 10.8565063,9.7760934 10.9323643,9.79529035 C11.0058517,9.81448731 11.0817097,9.82888502 11.1575677,9.83608388 C11.2334257,9.84328273 11.3116542,9.84568235 11.3875122,9.83848349 C11.4633701,9.83368426 11.5392281,9.82168616 11.6150861,9.80488883 C11.6885735,9.7880915 11.7620609,9.76169569 11.8331778,9.73290026 C11.9042946,9.70410484 11.9730409,9.66811055 12.0370461,9.62731703 C12.1010513,9.58652351 12.1626859,9.53853113 12.2219499,9.48813914 C12.2503967,9.46174333 12.2788434,9.43534752 12.3072901,9.40415248 C12.3215135,9.38735515 12.3381074,9.37295743 12.3523308,9.35855972 L12.3950009,9.31056734 C12.4021126,9.30336848 12.4092243,9.29377001 12.416336,9.28657115 L12.4353005,9.26017535 L12.4756,9.20978335 L12.5111585,9.15699173 L12.530123,9.13059593 L12.5467169,9.10420012 L12.5799047,9.04900888 L12.6107221,8.99381765 L12.627316,8.96502222 L12.6415394,8.9362268 L12.6699861,8.87863594 C12.8145904,8.56908511 12.8809661,8.21874075 12.8525194,7.87319563 C12.8264432,7.52765052 12.7102856,7.19170387 12.5158996,6.90614923 C12.492194,6.87015494 12.4661178,6.83656028 12.4400416,6.800566 C12.4281888,6.78376866 12.4115949,6.76697133 12.3997421,6.750174 C12.3855187,6.73337667 12.3736659,6.71657934 12.3570719,6.699782 L12.3120313,6.65178963 C12.3049196,6.64459077 12.2978079,6.63499229 12.2883256,6.62779344 L12.2622495,6.60379725 C12.2290616,6.5726022 12.1958737,6.53660792 12.1603153,6.50781249 C12.0228227,6.38303231 11.8734773,6.27504946 11.7146497,6.18386395 C11.3969944,5.99909329 11.036669,5.88391159 10.6692319,5.8479173 C10.3017949,5.81192302 9.92487555,5.85271654 9.5740324,5.97029786 C9.22081869,6.08547957 8.89605173,6.2798487 8.62106656,6.5342083 L8.5689142,6.58220068 L8.54283802,6.60619687 L8.51676184,6.63259268 L8.41482769,6.73817591 L8.31763465,6.85095799 C8.31052297,6.86055647 8.30104072,6.87015494 8.29392904,6.87975342 L8.27022342,6.90854885 L8.22518274,6.9661397 C8.10665465,7.12211493 7.99997937,7.28768863 7.9051569,7.46046119 C7.72262364,7.80840592 7.59461331,8.18994533 7.53534926,8.5810832 C7.50453196,8.77785195 7.49030859,8.97702032 7.49267915,9.17378907 C7.49504971,9.37295743 7.51164365,9.5721258 7.54720207,9.76649493 C7.5827605,9.96326368 7.6325423,10.1552332 7.69891803,10.3424035 L7.72499421,10.4119924 C7.73447645,10.4359886 7.74158814,10.4599848 7.75107039,10.4815814 L7.80796387,10.6183596 L7.87196904,10.7527383 C7.88145128,10.7743349 7.89567465,10.7959314 7.90752746,10.817528 L7.94308589,10.8823177 C8.04027892,11.0550903 8.15169533,11.220664 8.27496454,11.3766392 L8.36978701,11.4918209 C8.40297488,11.5302148 8.43616274,11.5662091 8.46935061,11.6022034 C8.50253847,11.6381977 8.54046746,11.6741919 8.57602589,11.7101862 C8.61395488,11.7461805 8.6495133,11.7821748 8.68744229,11.8181691 C9.29193555,12.3748806 10.0434036,12.7660185 10.8470241,12.9315922 C10.8968059,12.9411907 10.9489582,12.9507892 10.99874,12.9603877 L11.074598,12.9747854 C11.1006742,12.9795846 11.1243798,12.9819842 11.150456,12.9843838 L11.3021719,13.0035808 L11.4562585,13.0155789 C11.4823346,13.0179785 11.5084108,13.0203781 11.5321164,13.0203781 L11.6079744,13.0227777 L11.6838324,13.0251774 C11.7099086,13.0251774 11.7359848,13.027577 11.7596904,13.027577 C11.8616245,13.0251774 11.9659292,13.0251774 12.0678634,13.0179785 C12.4779706,12.9939823 12.8833367,12.907596 13.2744794,12.775617 C13.6632515,12.6364391 14.0354297,12.4540681 14.37442,12.2141062 L14.4384252,12.170913 L14.4692425,12.1493165 C14.4787247,12.1421176 14.4905776,12.1325191 14.5000598,12.1253203 L14.623329,12.0293355 L14.6541463,12.0053393 C14.6636286,11.9981405 14.6731108,11.988542 14.6849636,11.9813432 L14.7442277,11.9309512 L14.8034917,11.8805592 C14.8224562,11.8637618 14.8437913,11.8469645 14.8627558,11.8277675 C14.9386137,11.755779 15.0144717,11.6885896 15.0879591,11.6070026 L15.1993755,11.4918209 L15.2278223,11.4630255 C15.2373045,11.453427 15.2444162,11.4438285 15.2538984,11.4318304 L15.3060508,11.37184 C15.8655034,10.7311417 16.2874634,9.96566329 16.5340018,9.14499364 C16.7781697,8.32192436 16.846916,7.44606347 16.7354996,6.59179915 C16.6217126,5.73753483 16.3253924,4.90966632 15.8702445,4.17778256 C15.6426706,3.81304049 15.3771677,3.47229461 15.0761063,3.16274378 C14.7703038,2.85079333 14.4384252,2.56283906 14.087582,2.30607984 L13.9548306,2.21009508 L13.8884549,2.16210271 C13.8671198,2.14530538 13.8434142,2.13330728 13.8197086,2.11650995 C13.7272567,2.0589191 13.6371753,1.99892862 13.5447234,1.94133777 L13.260256,1.77816369 C13.2365504,1.76376597 13.2128447,1.75176788 13.1891391,1.73976979 L13.1156517,1.7037755 L12.9710474,1.62938732 C12.5799047,1.43741781 12.1721681,1.27904296 11.7525787,1.1566624 C10.9157704,0.909501654 10.0339214,0.815916517 9.16392521,0.868708133 C8.72774184,0.89510394 8.29392904,0.95989365 7.86722791,1.06067764 C7.44289735,1.16386125 7.02567848,1.30303915 6.62268297,1.47821133 C6.21968747,1.65338351 5.83091534,1.85975073 5.46347826,2.10211224 C5.09604118,2.34447374 4.74993916,2.62042991 4.42754276,2.92278189 L4.30664411,3.0379636 L4.24738006,3.09555445 L4.18811602,3.15554492 L4.07195849,3.27552587 L3.95817152,3.39790643 L3.90127804,3.46029652 L3.84675512,3.52268661 L3.73533872,3.64746679 L3.62866343,3.77704621 L3.57414051,3.84183592 L3.52198815,3.90662563 L3.41768344,4.03860467 L3.31574928,4.17298333 C3.29915535,4.1945799 3.28256141,4.21857608 3.26596748,4.24017265 L3.21618568,4.30736198 C3.18299782,4.35295474 3.14980995,4.3985475 3.11899265,4.44414026 C3.05735804,4.5377254 2.99098231,4.62891091 2.93171827,4.72249605 C2.90090097,4.77048843 2.87008366,4.81608119 2.84163692,4.86407356 L2.75392613,5.0080507 C2.29403715,5.77592874 1.93845288,6.61099611 1.7013967,7.47965814 C1.46434052,8.34832017 1.34581243,9.25057687 1.34818299,10.1528336 C1.35055356,11.0550903 1.47382277,11.9597466 1.72036119,12.8308082 C1.96452906,13.7018699 2.32722501,14.5369373 2.79659625,15.3096145 C3.03365243,15.6935536 3.29204366,16.0654945 3.57888164,16.4158388 C3.72111534,16.591011 3.87046074,16.761384 4.02454725,16.9269577 C4.10277579,17.0085447 4.17863377,17.0901317 4.25923287,17.1717188 L4.38013152,17.2916997 C4.42043107,17.3324932 4.46310118,17.3708871 4.50340073,17.4092811 C5.16004635,18.0355816 5.8830677,18.5922932 6.66061196,19.0578192 C7.43815623,19.5233453 8.26548229,19.9072843 9.12599622,20.1904393 C9.55506791,20.3320168 9.99362184,20.4495982 10.4369169,20.5455829 C10.8802119,20.6391681 11.3282481,20.7111566 11.7786549,20.7543498 C13.5826524,20.9343212 15.42932,20.7111566 17.1432362,20.0944546 C17.5723079,19.940879 17.9918973,19.7633072 18.4020045,19.5641388 C18.8121117,19.3649704 19.2103661,19.1394063 19.5967676,18.8946451 C20.3672002,18.4051229 21.0854804,17.8292144 21.7350144,17.1813173 C21.7847962,17.1309253 21.8653953,17.1309253 21.9151771,17.1837169 C21.9673294,17.2245104 21.9673294,17.3036978 21.9199182,17.3540898 L21.9199182,17.3540898 Z">
              </path>
            </g>
            <g id="风机备份" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(443.373915, 123.810282) rotate(-360.000000) translate(-443.373915, -123.810282) translate(410.386722, 90.893687)">
              <rect id="矩形" height="65.8331897" opacity="0" width="65.9743853" x="0" y="0"></rect>
              <path id="形状"
                d="M32.9871926,63.0901401 C49.6787121,63.0681958 63.2034611,49.5723919 63.2254525,32.9165949 C63.2034611,16.2607979 49.6787121,2.76499397 32.9871926,2.74304959 C16.2956732,2.76499397 2.77092418,16.2607979 2.74893274,32.9165949 C2.77092418,49.5723919 16.2956732,63.0681958 32.9871926,63.0901401 Z M32.9871926,65.8331897 C14.7768879,65.8126169 0.0206169954,51.0879267 0,32.9165949 C0.0206169954,14.745263 14.7768879,0.0205728718 32.9871926,0 C51.1974974,0.0205728718 65.9537683,14.745263 65.9743853,32.9165949 C65.9537683,51.0879267 51.1974974,65.8126169 32.9871926,65.8331897 Z">
              </path>
              <path id="形状"
                d="M21.1091601,20.5034575 C21.1091601,26.6015486 25.9624885,31.5456782 31.9508623,31.5479969 L33.6224118,31.5479969 L33.6224118,9.46451729 L31.9508623,9.46451729 C25.9640985,9.46683489 21.111436,14.4084061 21.1091601,20.5048573 L21.1091601,20.5034575 Z M27.3156119,50.3055163 C29.8069965,48.841167 31.6250658,46.428928 32.3698367,43.5995025 C33.1146075,40.7700769 32.7250672,37.7552552 31.2869163,35.2183115 L30.4525163,33.7499057 L11.661332,44.7902457 L12.4943575,46.262851 C13.9325948,48.8000239 16.3017848,50.651379 19.0806151,51.4095475 C21.8594454,52.1677159 24.8202318,51.7705769 27.311488,50.3055163 L27.3156119,50.3055163 Z M49.827918,29.3950816 C44.6409592,26.3482671 38.0106672,28.158556 35.016286,33.4391468 L34.1832606,34.9103522 L52.9648224,45.9548916 L53.7978478,44.4836862 C55.2365491,41.9467861 55.6265428,38.9317533 54.8820152,36.1020102 C54.1374877,33.2722672 52.3194422,30.8596698 49.827918,29.3950816 L49.827918,29.3950816 Z">
              </path>
            </g>
            <g id="风机备份-2" fill="#3DDEFF" fill-rule="nonzero"
              transform="translate(440.019285, 412.806827) rotate(-360.000000) translate(-440.019285, -412.806827) translate(407.032092, 379.890232)">
              <rect id="矩形" height="65.8331897" opacity="0" width="65.9743853" x="0" y="0"></rect>
              <path id="形状"
                d="M32.9871926,63.0901401 C49.6787121,63.0681958 63.2034611,49.5723919 63.2254525,32.9165949 C63.2034611,16.2607979 49.6787121,2.76499397 32.9871926,2.74304959 C16.2956732,2.76499397 2.77092418,16.2607979 2.74893274,32.9165949 C2.77092418,49.5723919 16.2956732,63.0681958 32.9871926,63.0901401 Z M32.9871926,65.8331897 C14.7768879,65.8126169 0.0206169954,51.0879267 0,32.9165949 C0.0206169954,14.745263 14.7768879,0.0205728718 32.9871926,0 C51.1974974,0.0205728718 65.9537683,14.745263 65.9743853,32.9165949 C65.9537683,51.0879267 51.1974974,65.8126169 32.9871926,65.8331897 Z">
              </path>
              <path id="形状"
                d="M18.8727402,21.6192743 C18.8727402,27.7173653 23.7260687,32.661495 29.7144425,32.6638137 L31.3859919,32.6638137 L31.3859919,10.5803341 L29.7144425,10.5803341 C23.7276786,10.5826517 18.8750161,15.5242229 18.8727402,21.620674 L18.8727402,21.6192743 Z M25.0791921,51.4213331 C27.5705767,49.9569838 29.388646,47.5447448 30.1334168,44.7153192 C30.8781877,41.8858937 30.4886474,38.871072 29.0504965,36.3341283 L28.2160965,34.8657225 L9.42491218,45.9060625 L10.2579376,47.3786677 C11.696175,49.9158407 14.0653649,51.7671958 16.8441953,52.5253642 C19.6230256,53.2835327 22.5838119,52.8863937 25.0750682,51.4213331 L25.0791921,51.4213331 Z M47.5914982,30.5108984 C42.4045393,27.4640839 35.7742473,29.2743728 32.7798662,34.5549636 L31.9468407,36.026169 L50.7284026,47.0707084 L51.561428,45.599503 C53.0001293,43.0626028 53.3901229,40.0475701 52.6455954,37.217827 C51.9010679,34.388084 50.0830223,31.9754866 47.5914982,30.5108984 L47.5914982,30.5108984 Z">
              </path>
            </g>
            <line id="路径-2" stroke="#3DDEFF" stroke-width="2"
              transform="translate(167.948877, 354.226446) rotate(-360.000000) translate(-167.948877, -354.226446) "
              x1="164.807955" x2="171.089799" y1="354.226446" y2="354.226446"></line>
            <line id="路径-2备份" stroke="#3DDEFF" stroke-width="2"
              transform="translate(226.095793, 354.226446) rotate(-360.000000) translate(-226.095793, -354.226446) "
              x1="222.954871" x2="229.236715" y1="354.226446" y2="354.226446"></line>
            <path id="路径-3"
              d="M167.948877,351.436904 L167.948877,400.455535 C164.516814,401.201478 162.339284,404.588421 163.085226,408.020484 C163.614187,410.454217 165.515144,412.355174 167.948877,412.884134 L167.948877,412.884134 L167.948877,412.884134 L167.948877,423.407086 L142.575446,423.407086 L142.575446,443.59197"
              stroke="#3DDEFF" stroke-width="2"
              transform="translate(153.652964, 397.514437) rotate(-360.000000) translate(-153.652964, -397.514437) ">
            </path>
            <ellipse id="椭圆形" cx="142.571765" cy="443.491788" fill="#3DDEFF" rx="2.7955248" ry="2.78954194"
              transform="translate(142.571765, 443.491788) rotate(-360.000000) translate(-142.571765, -443.491788) ">
            </ellipse>
            <ellipse id="椭圆形备份-4" cx="226.437509" cy="406.669835" fill="#3DDEFF" rx="2.23656048" ry="2.23057762"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(226.437509, 406.669835) rotate(-360.000000) translate(-226.437509, -406.669835) ">
            </ellipse>
            <line id="路径-4" stroke="#3DDEFF" stroke-width="2"
              transform="translate(226.095793, 379.110041) rotate(-360.000000) translate(-226.095793, -379.110041) "
              x1="226.095793" x2="226.095793" y1="351.436904" y2="406.783178"></line>
            <polygon id="路径-5" fill="#3DDEFF"
              points="188.60125 486.039648 195.809098 486.039648 188.60125 503.892716 195.803493 503.892716"
              stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(192.205174, 494.966182) rotate(-360.000000) translate(-192.205174, -494.966182) ">
            </polygon>
            <line id="路径-6" stroke="#3DDEFF" stroke-width="1.11792864"
              transform="translate(195.970967, 495.286001) rotate(-360.000000) translate(-195.970967, -495.286001) "
              x1="192.335788" x2="199.606147" y1="495.286001" y2="495.286001"></line>
            <ellipse id="椭圆形" cx="202.631474" cy="494.81936" rx="3.68207849" ry="3.67300199" stroke="#3DDEFF"
              stroke-width="1.11792864"
              transform="translate(202.631474, 494.819360) rotate(-360.000000) translate(-202.631474, -494.819360) ">
            </ellipse>
            <g id="编组-6" transform="translate(518.837981, 0.000000)">
              <rect id="矩形" fill="#3DDEFF" height="20.084702" opacity="0.544363839" width="46.9648166" x="10.0789922"
                y="0.512528508"></rect>
              <text id="室外机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
                font-weight="normal">
                <tspan x="14.5772972" y="13.9913928">室外机</tspan>
              </text>
              <line id="路径-9" stroke="#238AA4" stroke-width="1.11792864" x1="0.574207873" x2="10.6380972"
                y1="30.0816731" y2="20.0393221"></line>
            </g>
            <g id="编组-6备份" transform="translate(518.837981, 323.586865)">
              <rect id="矩形" fill="#3DDEFF" height="20.084702" opacity="0.544363839" width="46.9648166" x="10.0789922"
                y="0.512528508"></rect>
              <text id="室内机" fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
                font-weight="normal">
                <tspan x="14.5772972" y="13.9913928">室内机</tspan>
              </text>
              <line id="路径-9" stroke="#238AA4" stroke-width="1.11792864" x1="0.574207873" x2="10.6380972"
                y1="30.0816731" y2="20.0393221"></line>
            </g>
            <text id="CV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="227.000295" y="206.414893">CV</tspan>
            </text>
            <text id="DLEP" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="392.495363" y="232.078896">DLEP</tspan>
            </text>
            <text id="PV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="446.169439" y="281.174835">PV</tspan>
            </text>
            <text id="LPT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="287.383631" y="258.858499">LPT</tspan>
            </text>
            <text id="LPS" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="287.383631" y="281.174835">LPS</tspan>
            </text>
            <text id="SLFP1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="227.000295" y="258.858499">SLFP1</tspan>
            </text>
            <text id="LSV" fill="#3DDEFF" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="176.680849" y="137.234471">LSV</tspan>
            </text>
            <text id="SLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(108.472578, 176.745757) rotate(-270.000000) translate(-108.472578, -176.745757) ">
              <tspan x="86.7608763" y="181.245757">SLMC2</tspan>
            </text>
            <text id="SLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(118.536467, 382.557106) rotate(-270.000000) translate(-118.536467, -382.557106) ">
              <tspan x="95.2361045" y="387.057106">SLMC2</tspan>
            </text>
            <text id="EV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(218.111349, 494.334972) rotate(-360.000000) translate(-218.111349, -494.334972) ">
              <tspan x="209.108936" y="498.834972">EV</tspan>
            </text>
            <text id="FT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(184.035498, 430.723643) rotate(-360.000000) translate(-184.035498, -430.723643) ">
              <tspan x="175.562639" y="435.223643">FT</tspan>
            </text>
            <text id="HPV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(112.174551, 325.820750) rotate(-360.000000) translate(-112.174551, -325.820750) ">
              <tspan x="98.4061543" y="330.32075">HPV</tspan>
            </text>
            <text id="LPV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(146.898161, 325.820750) rotate(-360.000000) translate(-146.898161, -325.820750) ">
              <tspan x="134.188872" y="330.32075">LPV</tspan>
            </text>
            <text id="SC" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(178.385346, 460.855325) rotate(-360.000000) translate(-178.385346, -460.855325) ">
              <tspan x="168.853379" y="465.355325">SC</tspan>
            </text>
            <text id="RD" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(275.669609, 543.438454) rotate(-360.000000) translate(-275.669609, -543.438454) ">
              <tspan x="266.137642" y="547.938454">RD</tspan>
            </text>
            <text id="LLMC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(117.418258, 472.423651) rotate(-270.000000) translate(-117.418258, -472.423651) ">
              <tspan x="94.6474482" y="476.923651">LLMC2</tspan>
            </text>
            <text id="SLFC1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(87.785695, 174.602258) rotate(-270.000000) translate(-87.785695, -174.602258) ">
              <tspan x="67.6626539" y="179.102258">SLFC1</tspan>
            </text>
            <text id="SLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(76.603595, 381.001094) rotate(-270.000000) translate(-76.603595, -381.001094) ">
              <tspan x="55.4214473" y="385.501094">SLFC2</tspan>
            </text>
            <text id="LLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(76.044491, 473.070123) rotate(-270.000000) translate(-76.044491, -473.070123) ">
              <tspan x="54.8623423" y="477.570123">LLFC2</tspan>
            </text>
            <text id="SLFC2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(53.121187, 192.399084) rotate(-270.000000) translate(-53.121187, -192.399084) ">
              <tspan x="31.939039" y="196.899084">SLFC2</tspan>
            </text>
            <text id="SLFC3" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(49.766557, 370.957200) rotate(-270.000000) translate(-49.766557, -370.957200) ">
              <tspan x="28.5844092" y="375.4572">SLFC3</tspan>
            </text>
            <text id="LLFP2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(19.574890, 408.959785) rotate(-270.000000) translate(-19.574890, -408.959785) ">
              <tspan x="-0.548151217" y="413.459785">LLFP2</tspan>
            </text>
            <text id="LLFP1" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal"
              transform="translate(19.574890, 164.617349) rotate(-270.000000) translate(-19.574890, -164.617349) ">
              <tspan x="0.510956192" y="169.117349">LLFP1</tspan>
            </text>
            <text id="HPS" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="478.597527" y="241.041692">HPS</tspan>
            </text>
            <text id="HPT" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="478.597527" y="262.245468">HPT</tspan>
            </text>
            <text id="PV" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
              font-weight="normal">
              <tspan x="333.230237" y="293.493139">PV</tspan>
            </text>
            <g id="插座备份" fill-rule="nonzero" transform="translate(84.987635, 103.183740)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-5" fill-rule="nonzero" transform="translate(84.987635, 133.315422)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-6" fill-rule="nonzero" transform="translate(84.987635, 433.516254)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
            <g id="插座备份-7" fill-rule="nonzero" transform="translate(84.987635, 394.456666)">
              <rect id="矩形" fill="#000000" height="24.5517409" opacity="0" width="24.6006182" x="0" y="0"></rect>
              <path id="路径"
                d="M9.27894498,9.25604208 C10.317399,9.22030445 11.3558531,9.25604208 12.4301159,9.25604208 C12.4659246,8.79145311 12.5733509,8.32686411 12.9314385,8.04096319 C13.2895261,7.68358704 13.8266575,7.61211181 14.2921714,7.71932466 C14.5428327,7.75506229 17.6223861,8.11243841 18.2669438,8.18391363 C18.7682664,8.18391363 19.2337803,8.46981456 19.4486329,8.93440353 C19.735103,9.54194298 19.6276767,10.18522 19.6276767,10.8642347 C19.8067205,10.8642347 19.9499555,10.8999723 20.1289993,10.8999723 C20.5587044,10.9357099 20.8809833,10.9357099 21.0600271,10.9357099 L21.0600271,12.508165 L20.0931905,12.508165 L19.6276767,12.508165 L19.6276767,13.9734071 C19.6276767,14.1520952 19.5918679,14.2950457 19.5560591,14.4737337 C19.4128241,14.7953723 19.1979715,15.1527484 18.8398839,15.2956988 C18.4817963,15.3671741 18.1237088,15.4029117 17.7656211,15.4029117 L17.6940036,15.4029117 C16.8704021,15.5101245 14.1847451,15.7960254 13.6834225,15.8317631 C13.1462911,15.8317631 12.716586,15.4029117 12.5375422,14.9025851 C12.4301159,14.545209 12.4301159,14.1878328 12.4301159,13.8304567 L9.49379753,13.8304567 C9.31475373,13.8304567 9.09990118,13.8304567 8.99247489,13.6875062 C8.77762234,13.4373429 8.95666612,12.9012787 9.31475373,12.9370163 C10.3532078,12.9012787 11.3916618,12.9370163 12.4301159,12.9012787 L12.4301159,10.6140714 L12.4301159,10.2924329 C11.3916618,10.2924329 10.3532078,10.3281705 9.3505625,10.2924329 C8.74181357,10.3281705 8.70600482,9.29177968 9.27894498,9.25604208 L9.27894498,9.25604208 Z"
                fill="#EE4572"></path>
              <path id="路径"
                d="M17.5149598,14.0448824 C17.7298124,14.0448824 17.8730474,13.8661943 17.8730474,13.6875062 L17.8730474,9.97079435 C17.8730474,9.75636868 17.6940036,9.6134182 17.5149598,9.6134182 C17.3001073,9.6134182 17.1568722,9.79210628 17.1568722,9.97079435 L17.1568722,13.6875062 C17.1568722,13.9019319 17.3001072,14.0448824 17.5149598,14.0448824 Z"
                fill="#062737"></path>
              <path id="路径"
                d="M16.2258444,14.08062 C16.440697,14.08062 16.5839321,13.9019319 16.5839321,13.7232438 L16.5839321,10.006532 C16.5839321,9.7921063 16.4048883,9.64915583 16.2258444,9.64915583 C16.0109919,9.64915583 15.8677568,9.8278439 15.8677568,10.006532 L15.8677568,13.7232438 C15.8677568,13.9019319 16.0468006,14.08062 16.2258444,14.08062 Z"
                fill="#062737"></path>
              <path id="形状"
                d="M10.2413054,6.28982009 L1.64720296,6.28982009 C1.00264528,6.28982009 0.465513871,6.82588432 0.465513871,7.46916136 L0.465513871,16.0819264 C0.465513871,16.7252034 1.00264528,17.2612676 1.64720296,17.2612676 L10.2771142,17.2612676 C10.9216719,17.2612676 11.4588033,16.7252034 11.4588033,16.0819264 L11.4588033,7.46916136 C11.4229945,6.79014669 10.8858631,6.28982009 10.2413054,6.28982009 Z M4.01058113,12.4724273 C3.61668478,12.4724273 3.29440594,12.1507888 3.29440594,11.7576751 C3.29440594,11.3645613 3.61668478,11.0429228 4.01058113,11.0429228 C4.40447749,11.0429228 4.72675635,11.3645613 4.72675635,11.7576751 C4.69094758,12.1507888 4.36866874,12.4724273 4.01058113,12.4724273 L4.01058113,12.4724273 Z M7.87792723,12.4724273 C7.48403088,12.4724273 7.16175204,12.1507888 7.16175204,11.7576751 C7.16175204,11.3645613 7.48403088,11.0429228 7.87792723,11.0429228 C8.27182359,11.0429228 8.59410245,11.3645613 8.59410245,11.7576751 C8.59410245,12.1507888 8.27182361,12.4724273 7.87792723,12.4724273 Z"
                fill="#3DDEFF"></path>
            </g>
          </g>
          <g id="编组-7" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(418.214191, 163.430363)">
            <text id="冷凝风机">
              <tspan x="0" y="14">冷凝风机</tspan>
            </text>
          </g>
          <g id="编组-7备份-3" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(413.741352, 535.072563)">
            <text id="蒸发器">
              <tspan x="0" y="14">蒸发器</tspan>
            </text>
          </g>
          <g id="编组-7备份-2" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="15.651001"
            font-weight="normal" transform="translate(243.773444, 47.386034)">
            <text id="冷凝器">
              <tspan x="0" y="17">冷凝器</tspan>
            </text>
          </g>
          <g id="编组-7备份-4" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(489.779626, 435.749611)">
            <text id="电加热器">
              <tspan x="0" y="14">电加热器</tspan>
            </text>
          </g>
          <g id="编组-7备份" fill="#B3D6F9" font-family="PingFangSC-Regular, PingFang SC" font-size="13.4151437"
            font-weight="normal" transform="translate(466.297218, 374.352138)">
            <text id="蒸发风机">
              <tspan x="0" y="14">蒸发风机</tspan>
            </text>
          </g>
        </g>
      </g>
    </g>
    <text fill="#FFFFFF" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
      transform="translate(0,16)">
      <tspan x="696" y="160">空调1</tspan>
      <tspan x="1302" y="160">空调2</tspan>
    </text>
    <foreignObject height="100%" width="100%">
      <div class="SpeedStyle0">
        <Speed11 :temp1="x_Temp1" />
        <!-- 总电压 -->
      </div>
      <div class="SpeedStyle1">
        <Speed12 />
        <!-- 总电压 -->
      </div>
      <div class="SpeedStyle2">
        <Speed13 />
        <!-- 总电压 -->
      </div>
      <div class="SpeedStyle3">
        <Speed14 :airquality1="x_Temp1" />
        <!-- 总电压 -->
      </div>
    </foreignObject>
  </svg>
</template>

<style scoped>
.routeStep {
  position: absolute;
  top: 10px;
  left: 20px;
}

.bgBackground {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: -100;
  background-image: url(../assets/bg2.jpg);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
}

.SpeedStyle0 {
  position: absolute;
  top: 880px;
  left: 50px;
}

.SpeedStyle1 {
  position: absolute;
  top: 880px;
  left: 515px;
}

.SpeedStyle2 {
  position: absolute;
  top: 880px;
  left: 973px;
}

.SpeedStyle3 {
  position: absolute;
  top: 880px;
  left: 1420px;
}

#button1 {
  position: absolute;
  top: 575px;
  left: 1150px;
}
</style>
