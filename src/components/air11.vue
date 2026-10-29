<template>
  <div>
    <!-- 悬浮电磁铁间隙/速度 -->
    <!-- 图表容器，需要一个固定的宽高展示图表，样式在最底部 -->
    <div class="speed11"></div>
  </div>
</template>

<script setup>
import * as echarts from "echarts"; //引入本地的echarts源文件，以实际路径为准
import { reactive, toRefs, onMounted, watch,onUnmounted} from "vue";
    const props = defineProps(["temp1"])
    // const {temp1} = toRefs(props);
    //const colors = reactive(["#19B6A8", "#EFCF02"]);
    // const formatDate = () => {
    //     var date = new Date()// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    //     // var year = date.getFullYear()
    //     // var month = ('0' + (date.getMonth() + 1)).slice(-2)
    //     // var sdate = ('0' + date.getDate()).slice(-2)
    //     var hour = ('0' + date.getHours()).slice(-2)
    //     var minute = ('0' + date.getMinutes()).slice(-2)
    //     var second = ('0' + date.getSeconds()).slice(-2)
    //     var milsec = date.getMilliseconds()
    //     // 拼接
    //     var result = hour + ':' + minute + ':' + second+ ':' + milsec
    //     // 返回
    //     return result
    //   }
    const datasource = reactive({
        data:props.temp1
    })
    const state = reactive({
      options: {
        //配置图表的参数
        
        backgroundColor: "rgb(2,22,45,0.1)", //背景色
        // title:{
        //   show:true,
        //   text:"空调温度",
        //   textStyle:{
        //     color:"#3ddeff",
        //     fontSize:15,
        //     fontFamily:"Microsoft YaHei",
        //   },
        //   top:-3,
        //   right:150,
        // },
        dataset: {
          //数据集，来源上面的数组
          source:datasource.data,
        },
              
        tooltip: {
          //提示框
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        // legend:[{
        //     type:"scroll",
        //     textStyle:{
        //       color:"#ffffff",
        //       fontSize:10,
        //     },
        //     left:'18%',
        //     top:14,
        //     orient:"horizontal",
        //     pageButtonPosition:'end',
        //     width:150,
        //     pageIconSize:10,
        //     pageTextStyle:{
        //       fontSize:12,
        //     },
        //     pageIconColor:'#ffffff',
        //     data:["440V-1"]
        //   },
        //   ],
        grid:{
              bottom:5,
              right:5,
              left:5,
              top:25,
              containLabel:true,
            },
        dataZoom:[ 
          {
            type: 'inside',
            // show: true,
            start:0,//默认为0
            end: 100,//默认为100
          }
        ],
        xAxis: [
          //x轴配置
          {
            type: "category",
            boundaryGap: true,//是否留白
            // min: 0, //最小值
            // max: 600, 
            // splitNumber: 20, //最大值// 不留白，从原点开始
            name:"时间",
            nameLocation:"end",
            nameGap:0,
            nameTextStyle:{
              padding:[5,0,0,460]
            },
            splitLine: {
              //刻度线的配置 可配置颜色和样式（实线和虚线） 默认是实线
              lineStyle: {
                color: ["#7af3fe"], //这里是颜色
              },
            },
            axisTick:{
               alignWithLabel:true,
            },
            axisLine:{
                show:true,
                onZero:true,//是否对应0位置
                lineStyle: {
                  color: ["#7af3fe"], //这里是颜色
              },
            },           
          },
        ],
        yAxis: [
          //y轴配置
          {
            type: "value",
            position: "left", //y轴位置，左侧
            offset: -5, //向左偏移10px
            // min: 0, //最小值
            // max: 30, //最大值
            name:"空调温度(C°)",
            namelocation:"end",
            nameGap:10,
            nameTextStyle:{
              padding:[5,0,0,20]
            },
            splitLine: {
              //刻度线的配置 可配置颜色和样式（实线和虚线） 默认是实线
              lineStyle: {
                color: ["#7af3fe"], //这里是颜色
                type:"dashed",
              },
            },
            splitNumber:6, //分成几个区域，调整刻度线之间的间隔
            axisLine: {
              show: true, //不显示左边的轴线，true是展示
              symbolOffset:0,
              lineStyle: {
                color: "#7af3fe",
                width:2,
              },
            },
            axisLabel: {
              //配置坐标轴的显示，数字加单位km/h
              formatter: "{value}",
            },
          },
        ],
        
        series: [
          //系列，数据映射
          {
            name: "空调1",
            type: "line", //图表类型，折线图
            label:{
              show:false,
            },
            symbol:"rect",
            datasetIndex:0,
            yAxisIndex:0,
            smooth: false, //折线图是否平滑
          },
          // {
          //   name: "440V-2",
          //   type: "line", //图表类型，折线图
          //   label:{
          //     show:false,
          //   },
          //   symbol:"rect",
          //   datasetIndex:0,
          //   smooth: true, //折线图是否平滑
          //  },
        ],
      },
    });
    let myChart = null;
    const Handle_data =()=>{
      // datasource.data.push([formatDate(),newv.targettemp,newv.guestroomtemp,newv.newtrendtemp])
      // console.log(datasource.data)
      // state.options.dataZoom[0].start =100-(16/state.options.dataset.source.length)*100
    }
    function changeState(){
          myChart.setOption(state.options);
          // console.log("刷新了speed11")
      }
      let timer11 = null//watch绑定Bounce(changeState),每次触发执行赋值过程和回调函数
   function Bounce(fn){
                //如果定时器存在就清除掉
                if (timer11) {
                    clearTimeout(timer11)
                    timer11 = null
                    // console.log("清除定时器")
                }
                //不然就创建新的定时器
                timer11 = setTimeout(()=>{
                    fn()
                }, 800)
   }
    // watch(()=>props.temp1,()=>{
    //         // Handle_data()
    //         Bounce(changeState)
    // },{deep:true})
    setInterval(() => {
        Bounce(changeState)
    },2000)
    onMounted(() => {
      myChart = echarts.init(document.querySelector(".speed11"));
      // 绘制图表
      myChart.setOption(state.options);

    });
    onUnmounted(()=>{
                if (!myChart) {
                return
            }
            // window.removeEventListener('resize', this.__resizeHandler)
            myChart.dispose()
            myChart = null
        });
    // return {
    //   ...toRefs(state),
    // };
</script>

<style scoped>
.speed11 {
  width: 430px;
  height: 161px;
  margin: 1px auto;
}
</style>