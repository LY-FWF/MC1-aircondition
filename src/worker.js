let websocketUrl = null;
let socket = null;

// 在 web worker 中创建一个 WebSocket 客户端
self.onmessage = function (event) {
  websocketUrl = event.data;

  // 初始连接
  connectWebSocket();
};

// 建立 WebSocket 连接
function connectWebSocket() {
  socket = new WebSocket(websocketUrl);

  // 处理 WebSocket 连接事件
  socket.onopen = function () {
    console.log("WebSocket 连接已建立");
  };

  // 处理 WebSocket 接收到的消息
  socket.onmessage = function (event) {
    const processedData = handleReceivedData(event.data);
    postMessage(processedData);
  };

  // 处理 WebSocket 关闭事件
  socket.onclose = function () {
    console.log("WebSocket 连接已关闭");
    // 断开后重新连接
    setTimeout(connectWebSocket, 2000);
  };

  // 处理 WebSocket 错误事件
  socket.onerror = function (error) {
    console.error("WebSocket 错误:", error);
    // 出错后重新连接
    setTimeout(connectWebSocket, 2000);
  };
}

// 处理接收到的数据
function handleReceivedData(dataAll) {
  // 在这里添加你的数据处理逻辑
  console.log("处理数据:", dataAll);

  var airconditioner1_state = {};
  var airconditioner2_state = {};

  var airconditioner1 = {
    workmode: "", //工作模式
    freshir_valve: 0, //新风阀门
    returnair_valve: 0, //回风阀门
    pollutedair_valve: 0, //废排风阀门
    exhaustfan: 0, //废排风机
    electricheating2: 0, //电加热2
    electricheating1: 0, //电加热1
    compressor: 0, //压缩机
    ventilator1: 0, //通风机1
    ventilator2: 0, //通风机2
    condensingfan1: 0, //冷凝风机1
    condensingfan2: 0, //冷凝风机2
    controlmode: "", //控制模式
    targettemp: "", //目标温度
    guestroomtemp: "", //客室温度
    newtrendtemp: "", //新风温度
    co2: "", //二氧化碳浓度
    pm25: "", //PM2.5浓度
    hcho: "", //甲醛浓度
    passengercompartment_heat_faultII: 0, //客室加热故障II
    passengercompartment_cold_faultII: 0, //客室制冷故障II
    passengercompartment_ventilation_faultI: 0, //客室通风故障I
    ventilator1_faultII: 0, //通风机1故障II
    ventilator2_faultII: 0, //通风机2故障II
    exhaustfan_overload_faultII: 0, //废排风机过载故障II
    ventilator_overload_faultI: 0, //通风机过载故障I
    exhaustfan_faultII: 0, //废排风机故障II
    electricheat2_faultII: 0, //电加热2故障II
    electricheat1_faultII: 0, //电加热1故障II
    compressor_faultII: 0, //压缩机故障II
    ventilator_faultI: 0, //通风机故障I
    condensingfan_faultII: 0, //冷凝风机故障II
    system_highvoltagesensor_faultIII: 0, //系统高压传感器故障III
    system_lowvoltagesensor_faultIII: 0, //系统低压传感器故障III
    compressor_lowvoltage_faultIII: 0, //压缩机低压故障III
    compressor_highvoltage_faultIII: 0, //压缩机高压故障III
    electricheat2_overcurrent_faultII: 0, //电加热2过流故障II
    electricheat1_overcurrent_faultII: 0, //电加热1过流故障II
    compressor_overcurrent_faultII: 0, //压缩机过流故障II
    condensingfan_overload_faultII: 0, //冷凝风机过载故障II
    freshair_valve_faultII: 0, //新风风阀故障II
    airsupply_sensor_faultIII: 0, //送风传感器故障III
    freshair_sensor_faultIII: 0, //新风传感器故障III
    passengercompartment_returnairsensor2_faultIII: 0, //客室回风传感器2故障III
    passengercompartment_returnairsensor1_faultIII: 0, //客室回风传感器1故障III
    fanpowerbox_fanunit_faultIII: 0, //风机电源箱风扇单元故障III
    compressorpowerbox_fanunit_faultIII: 0, //压缩机电源箱风扇单元故障III
    pressurewave_controller_faultI: 0, //压力波控制器故障（预留）I
    compressor_frequencyconverter_faultII: 0, //压缩机变频器故障II
    fan_frequencyconverter_faultI: 0, //风机变频器故障I
    exhaustair_pressurewavevalve_faultI: 0, //废排压力波阀故障I
    freshair_pressurewavevalve_faultI: 0, //新风压力波阀故障I
  };
  var airconditioner2 = {
    workmode: "", //工作模式
    freshir_valve: 0, //新风阀门
    returnair_valve: 0, //回风阀门
    pollutedair_valve: 0, //废排风阀门
    exhaustfan: 0, //废排风机
    electricheating2: 0, //电加热2
    electricheating1: 0, //电加热1
    compressor: 0, //压缩机
    ventilator1: 0, //通风机1
    ventilator2: 0, //通风机2
    condensingfan1: 0, //冷凝风机1
    condensingfan2: 0, //冷凝风机2
    controlmode: "", //控制模式
    targettemp: "", //目标温度
    guestroomtemp: "", //客室温度
    newtrendtemp: "", //新风温度
    co2: "", //二氧化碳浓度
    pm25: "", //PM2.5浓度
    hcho: "", //甲醛浓度
    passengercompartment_heat_faultII: 0, //客室加热故障II
    passengercompartment_cold_faultII: 0, //客室制冷故障II
    passengercompartment_ventilation_faultI: 0, //客室通风故障I
    ventilator1_faultII: 0, //通风机1故障II
    ventilator2_faultII: 0, //通风机2故障II
    exhaustfan_overload_faultII: 0, //废排风机过载故障II
    ventilator_overload_faultI: 0, //通风机过载故障I
    exhaustfan_faultII: 0, //废排风机故障II
    electricheat2_faultII: 0, //电加热2故障II
    electricheat1_faultII: 0, //电加热1故障II
    compressor_faultII: 0, //压缩机故障II
    ventilator_faultI: 0, //通风机故障I
    condensingfan_faultII: 0, //冷凝风机故障II
    system_highvoltagesensor_faultIII: 0, //系统高压传感器故障III
    system_lowvoltagesensor_faultIII: 0, //系统低压传感器故障III
    compressor_lowvoltage_faultIII: 0, //压缩机低压故障III
    compressor_highvoltage_faultIII: 0, //压缩机高压故障III
    electricheat2_overcurrent_faultII: 0, //电加热2过流故障II
    electricheat1_overcurrent_faultII: 0, //电加热1过流故障II
    compressor_overcurrent_faultII: 0, //压缩机过流故障II
    condensingfan_overload_faultII: 0, //冷凝风机过载故障II
    freshair_valve_faultII: 0, //新风风阀故障II
    airsupply_sensor_faultIII: 0, //送风传感器故障III
    freshair_sensor_faultIII: 0, //新风传感器故障III
    passengercompartment_returnairsensor2_faultIII: 0, //客室回风传感器2故障III
    passengercompartment_returnairsensor1_faultIII: 0, //客室回风传感器1故障III
    fanpowerbox_fanunit_faultIII: 0, //风机电源箱风扇单元故障III
    compressorpowerbox_fanunit_faultIII: 0, //压缩机电源箱风扇单元故障III
    pressurewave_controller_faultI: 0, //压力波控制器故障（预留）I
    compressor_frequencyconverter_faultII: 0, //压缩机变频器故障II
    fan_frequencyconverter_faultI: 0, //风机变频器故障I
    exhaustair_pressurewavevalve_faultI: 0, //废排压力波阀故障I
    freshair_pressurewavevalve_faultI: 0, //新风压力波阀故障I
  };

  var data1 = dataAll.toString("hex");
  var data2 = data1.replaceAll(" ", "");
  var symple = data2.substr(10, 2); //获取空调报文的标志位字符串
  var comid = hexto10(data2.substr(50, 2)) * 256 + hexto10(data2.substr(52, 2)); //获取空调报文的comid
  switch (symple) {
    case "07":
      if (comid == 1030) {
        var airconditioner1_workmode = data2.substr(58, 2); //获取空调1运转模式
        switch (airconditioner1_workmode) {
          case "00":
            airconditioner1.workmode = "无效";
            break;
          case "01":
            airconditioner1.workmode = "通风模式";
            break;
          case "02":
            airconditioner1.workmode = "制冷模式";
            break;
          case "03":
            airconditioner1.workmode = "制暖模式";
            break;
          case "04":
            airconditioner1.workmode = "自动模式";
            break;
          case "05":
            airconditioner1.workmode = "停机模式";
            break;
          case "06":
            airconditioner1.workmode = "紧急关闭模式";
            break;
          case "07":
            airconditioner1.workmode = "整备模式";
            break;
          case "08":
            airconditioner1.workmode = "烟火模式";
            break;
          case "09":
            airconditioner1.workmode = "洗车模式";
            break;
          case "0a":
            airconditioner1.workmode = "预冷模式";
            break;
          case "0b":
            airconditioner1.workmode = "预暖模式";
            break;
          case "0c":
            airconditioner1.workmode = "紧急通风模式";
            break;
          case "0d":
            airconditioner1.workmode = "手动模式";
            break;
        }
        var status_arr1 = binarytoarry2(hexto2(data2.substr(60, 2))); //提取为二进制,并转换为数组
        airconditioner1.freshir_valve = status_arr1[1]; //新风阀门状态
        airconditioner1.exhaustfan = status_arr1[2]; //废排风机状态
        airconditioner1.electricheating2 = status_arr1[3]; //电加热2状态
        airconditioner1.electricheating1 = status_arr1[4]; //电加热1状态
        airconditioner1.compressor = status_arr1[5]; //压缩机状态
        airconditioner1.ventilator1 = status_arr1[6]; //通风机1状态
        airconditioner1.condensingfan1 = status_arr1[7]; //冷凝风机1状态
        var status_arr2 = binarytoarry2(hexto2(data2.substr(62, 2))); //提取为二进制,并转换为数组
        airconditioner1.condensingfan2 = status_arr2[2]; //冷凝风机2状态
        airconditioner1.ventilator2 = status_arr2[3]; //通风机2状态
        airconditioner1.returnair_valve = status_arr2[4]; //回风阀门状态
        airconditioner1.pollutedair_valve = status_arr2[7]; //废排风阀门状态
        var airconditioner1_controlmode = data2.substr(64, 2); //获取空调控制模式
        switch (airconditioner1_controlmode) {
          case "04":
            airconditioner1.controlmode = "集控";
            break;
          case "02":
            airconditioner1.controlmode = "本控";
            break;
          case "01":
            airconditioner1.controlmode = "手控";
            break;
        }
        var airconditioner1_targettemp_low = data2.substr(68, 2); //获取目标温度低8位
        var airconditioner1_targettemp_high = data2.substr(70, 2); //获取目标温度高8位
        var airconditioner1_targettemp_judge = binarytoarry2(
          hexto2(airconditioner1_targettemp_high)
        );
        if (airconditioner1_targettemp_judge[0] == 1) {
          //值为零下
          airconditioner1.targettemp =
            0 -
            (
              airconditioner1_targettemp_judge[7] * 256 +
              hexto10(airconditioner1_targettemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner1.targettemp = (
            (hexto10(airconditioner1_targettemp_high) * 256 +
              hexto10(airconditioner1_targettemp_low)) *
            0.1
          ).toFixed(2);
        }
        var airconditioner1_guestroomtemp_low = data2.substr(72, 2); //获取客室温度低8位
        var airconditioner1_guestroomtemp_high = data2.substr(74, 2); //获取客室温度高8位
        var airconditioner1_guestroomtemp_judge = binarytoarry2(
          hexto2(airconditioner1_guestroomtemp_high)
        );
        if (airconditioner1_guestroomtemp_judge[0] == 1) {
          //值为零下
          airconditioner1.guestroomtemp =
            0 -
            (
              airconditioner1_guestroomtemp_judge[7] * 256 +
              hexto10(airconditioner1_guestroomtemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner1.guestroomtemp = (
            (hexto10(airconditioner1_guestroomtemp_high) * 256 +
              hexto10(airconditioner1_guestroomtemp_low)) *
            0.1
          ).toFixed(2);
        }
        var airconditioner1_newtrendtemp_low = data2.substr(76, 2); //获取新风温度低8位
        var airconditioner1_newtrendtemp_high = data2.substr(78, 2); //获取新风温度高8位
        var airconditioner1_newtrendtemp_judge = binarytoarry2(
          hexto2(airconditioner1_newtrendtemp_high)
        ); //获取新风温度高8位
        if (airconditioner1_newtrendtemp_judge[0] == 1) {
          //值为零下
          airconditioner1.newtrendtemp =
            0 -
            (
              airconditioner1_newtrendtemp_judge[7] * 256 +
              hexto10(airconditioner1_newtrendtemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner1.newtrendtemp = (
            (hexto10(airconditioner1_newtrendtemp_high) * 256 +
              hexto10(airconditioner1_newtrendtemp_low)) *
            0.1
          ).toFixed(2);
        }
        airconditioner1.co2 =
          hexto10(data2.substr(116, 2)) * 256 + hexto10(data2.substr(114, 2));
        //获取二氧化碳浓度并计算，单位PPM
        airconditioner1.pm25 =
          hexto10(data2.substr(120, 2)) * 256 + hexto10(data2.substr(118, 2));
        //获取pm2.5浓度并计算，单位ug/m³
        airconditioner1.hcho =
          hexto10(data2.substr(124, 2)) * 256 + hexto10(data2.substr(122, 2));
        //获取甲醛浓度并计算，单位ppb

        var fault_arr1 = binarytoarry2(hexto2(data2.substr(96, 2))); //提取为二进制,并转换为数组
        airconditioner1.passengercompartment_heat_faultII = fault_arr1[5]; //新风阀门状态

        airconditioner1_state["symple"] = symple;
        airconditioner1_state["comid"] = comid;
        airconditioner1_state["airconditioner1"] = airconditioner1;
        // console.log(airconditioner1_state['airconditioner1']);
        // console.log(socket, socket.clients);

        let str = JSON.stringify(airconditioner1_state);
        return str;
        // socket.clients(client => {
        //   if (client.readyState === WebSocket.OPEN) {
        //     let str = JSON.stringify(airconditioner1_state);
        //     client.send(str);
        //     console.log("socket启用了,已发送空调1数据")
        //   }
        // });
      }

      if (comid == 1031) {
        var airconditioner2_workmode = data2.substr(58, 2); //获取空调2运转模式
        switch (airconditioner2_workmode) {
          case "00":
            airconditioner2.workmode = "无效";
            break;
          case "01":
            airconditioner2.workmode = "通风模式";
            break;
          case "02":
            airconditioner2.workmode = "制冷模式";
            break;
          case "03":
            airconditioner2.workmode = "制暖模式";
            break;
          case "04":
            airconditioner2.workmode = "自动模式";
            break;
          case "05":
            airconditioner2.workmode = "停机模式";
            break;
          case "06":
            airconditioner2.workmode = "紧急关闭模式";
            break;
          case "07":
            airconditioner2.workmode = "整备模式";
            break;
          case "08":
            airconditioner2.workmode = "烟火模式";
            break;
          case "09":
            airconditioner2.workmode = "洗车模式";
            break;
          case "0a":
            airconditioner2.workmode = "预冷模式";
            break;
          case "0b":
            airconditioner2.workmode = "预暖模式";
            break;
          case "0c":
            airconditioner2.workmode = "紧急通风模式";
            break;
          case "0d":
            airconditioner2.workmode = "手动模式";
            break;
        }
        airconditioner2.equipmentstatus1 = binarytoarry2(
          hexto2(data2.substr(60, 2))
        );
        //提取为二进制,并转换为数组
        airconditioner2.freshir_valve = airconditioner2.equipmentstatus1[1]; //新风阀门状态
        airconditioner2.exhaustfan = airconditioner2.equipmentstatus1[2]; //废排风机状态
        airconditioner2.electricheating2 = airconditioner2.equipmentstatus1[3]; //电加热2状态
        airconditioner2.electricheating1 = airconditioner2.equipmentstatus1[4]; //电加热1状态
        airconditioner2.compressor = airconditioner2.equipmentstatus1[5]; //压缩机状态
        airconditioner2.ventilator1 = airconditioner2.equipmentstatus1[6]; //通风机1状态
        airconditioner2.condensingfan1 = airconditioner2.equipmentstatus1[7]; //冷凝风机1状态
        airconditioner2.equipmentstatus2 = binarytoarry2(
          hexto2(data2.substr(62, 2))
        );
        //提取为二进制,并转换为数组
        airconditioner2.condensingfan2 = airconditioner2.equipmentstatus2[2]; //冷凝风机2状态
        airconditioner2.ventilator2 = airconditioner2.equipmentstatus2[3]; //通风机2状态
        airconditioner2.returnair_valve = airconditioner2.equipmentstatus2[4]; //回风阀门状态
        airconditioner2.pollutedair_valve = airconditioner2.equipmentstatus2[7]; //废排风阀门状态
        var airconditioner2_controlmode = data2.substr(64, 2); //获取空调控制模式
        switch (airconditioner2_controlmode) {
          case "04":
            airconditioner2.controlmode = "集控";
            break;
          case "02":
            airconditioner2.controlmode = "本控";
            break;
          case "01":
            airconditioner2.controlmode = "手控";
            break;
        }
        var airconditioner2_targettemp_low = data2.substr(68, 2); //获取目标温度低8位
        var airconditioner2_targettemp_high = data2.substr(70, 2); //获取目标温度高8位
        var airconditioner2_targettemp_judge = binarytoarry2(
          hexto2(airconditioner2_targettemp_high)
        );
        if (airconditioner2_targettemp_judge[0] == 1) {
          //值为零下
          airconditioner2.targettemp =
            0 -
            (
              airconditioner2_targettemp_judge[7] * 256 +
              hexto10(airconditioner2_targettemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner2.targettemp = (
            (hexto10(airconditioner2_targettemp_high) * 256 +
              hexto10(airconditioner2_targettemp_low)) *
            0.1
          ).toFixed(2);
        }
        var airconditioner2_guestroomtemp_low = data2.substr(72, 2); //获取客室温度低8位
        var airconditioner2_guestroomtemp_high = data2.substr(74, 2); //获取客室温度高8位
        var airconditioner2_guestroomtemp_judge = binarytoarry2(
          hexto2(airconditioner2_guestroomtemp_high)
        );
        if (airconditioner2_guestroomtemp_judge[0] == 1) {
          //值为零下
          airconditioner2.guestroomtemp =
            0 -
            (
              airconditioner2_guestroomtemp_judge[7] * 256 +
              hexto10(airconditioner2_guestroomtemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner2.guestroomtemp = (
            (hexto10(airconditioner2_guestroomtemp_high) * 256 +
              hexto10(airconditioner2_guestroomtemp_low)) *
            0.1
          ).toFixed(2);
        }
        var airconditioner2_newtrendtemp_low = data2.substr(76, 2); //获取新风温度低8位
        var airconditioner2_newtrendtemp_high = data2.substr(78, 2); //获取新风温度高8位
        var airconditioner2_newtrendtemp_judge = binarytoarry2(
          hexto2(airconditioner2_newtrendtemp_high)
        ); //获取新风温度高8位
        if (airconditioner2_newtrendtemp_judge[0] == 1) {
          //值为零下
          airconditioner2.newtrendtemp =
            0 -
            (
              airconditioner2_newtrendtemp_judge[7] * 256 +
              hexto10(airconditioner2_newtrendtemp_low) * 0.1
            ).toFixed(2);
        } else {
          // 值为零上
          airconditioner2.newtrendtemp = (
            (hexto10(airconditioner2_newtrendtemp_high) * 256 +
              hexto10(airconditioner2_newtrendtemp_low)) *
            0.1
          ).toFixed(2);
        }
        airconditioner2.co2 =
          hexto10(data2.substr(116, 2)) * 256 + hexto10(data2.substr(114, 2));
        //获取二氧化碳浓度并计算，单位PPM
        airconditioner2.pm25 =
          hexto10(data2.substr(120, 2)) * 256 + hexto10(data2.substr(118, 2));
        //获取pm2.5浓度并计算，单位ug/m³
        airconditioner2.hcho =
          hexto10(data2.substr(124, 2)) * 256 + hexto10(data2.substr(122, 2));
        //获取甲醛浓度并计算，单位ppb
        airconditioner2_state["symple"] = symple;
        airconditioner2_state["comid"] = comid;
        airconditioner2_state["airconditioner2"] = airconditioner2;
        let str = JSON.stringify(airconditioner2_state);
        return str;
        // socket.clients.forEach(client => {
        //   if (client.readyState === WebSocket.OPEN) {
        //     let str = JSON.stringify(airconditioner2_state);
        //     client.send(str);
        //     console.log("socket启用了,已发送空调2数据")
        //   }
        // });
      }
      break;
  }
  // var buf = msg.buffer;
  // var unit8 = new Uint8Array(buf);
  // var arr = Array.from(unit8);
  // var flag_bit = arr.slice(5, 6);//截取标志位
  // // console.log(arr)
  // if (flag_bit == 7) {
  //   var comid = Number(arr.slice(25, 26) * 256) + Number(arr.slice(26, 27))
  //   console.log("comid:" + comid)
  //   if (comid == 1030) {
  //     airconditioner1_faultsum.comid = comid;
  //     var arr1 = arr.slice(48, 55)//截取空调故障位
  //     var lastmsg1 = ['00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000'];
  //     arr1.forEach((item, index) => {//item是元素值，index是索引
  //       let ele2String = item.toString(2);
  //       let ele = fillZero(ele2String);
  //       compareMsg(ele, index, lastmsg1, airconditioner1_faultsum)//compareMsg的index是foreach的index
  //     });

  //     ws3.clients.forEach(client => {
  //       if (client.readyState === WebSocket.OPEN) {
  //         let str = JSON.stringify(airconditioner1_faultsum);
  //         client.send(str);
  //         console.log("ws3启用了")
  //       }
  //     })
  //   }
  //   if (comid == 1031) {
  //     airconditioner2_faultsum.comid = comid;
  //     var arr2 = arr.slice(48, 55)//截取空调故障位
  //     var lastmsg2 = ['00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000'];
  //     arr2.forEach((item, index) => {//item是元素值，index是索引
  //       let ele2String = item.toString(2);
  //       let ele = fillZero(ele2String);
  //       compareMsg(ele, index, lastmsg2, airconditioner2_faultsum)//compareMsg的index是foreach的index
  //     });
  //     ws3.clients.forEach(client => {
  //       console.log("送风2")
  //       if (client.readyState === WebSocket.OPEN) {
  //         let str = JSON.stringify(airconditioner2_faultsum);
  //         client.send(str);
  //         console.log("ws3启用了")
  //       }
  //     })
  //   }
  // }

  var airconditioner1_faultsum = {
    comid: 0,
    passengercompartment_heat_faultII_sum: 0, //客室加热故障II-发生总数
    passengercompartment_cold_faultII_sum: 0, //客室制冷故障II-发生总数
    passengercompartment_ventilation_faultI_sum: 0, //客室通风故障I-发生总数
    ventilator1_faultII_sum: 0, //通风机1故障II-发生总数
    ventilator2_faultII_sum: 0, //通风机2故障II-发生总数
    exhaustfan_overload_faultII_sum: 0, //废排风机过载故障II-发生总数
    ventilator_overload_faultI_sum: 0, //通风机过载故障I-发生总数
    exhaustfan_faultII_sum: 0, //废排风机故障II-发生总数
    electricheat2_faultII_sum: 0, //电加热2故障II-发生总数
    electricheat1_faultII_sum: 0, //电加热1故障II-发生总数
    compressor_faultII_sum: 0, //压缩机故障II-发生总数
    ventilator_faultI_sum: 0, //通风机故障I-发生总数
    condensingfan_faultII_sum: 0, //冷凝风机故障II-发生总数
    system_highvoltagesensor_faultIII_sum: 0, //系统高压传感器故障III-发生总数
    system_lowvoltagesensor_faultIII_sum: 0, //系统低压传感器故障III-发生总数
    compressor_lowvoltage_faultIII_sum: 0, //压缩机低压故障III-发生总数
    compressor_highvoltage_faultIII_sum: 0, //压缩机高压故障III-发生总数
    electricheat2_overcurrent_faultII_sum: 0, //电加热2过流故障II-发生总数
    electricheat1_overcurrent_faultII_sum: 0, //电加热1过流故障II-发生总数
    compressor_overcurrent_faultII_sum: 0, //压缩机过流故障II-发生总数
    condensingfan_overload_faultII_sum: 0, //冷凝风机过载故障II-发生总数
    freshair_valve_faultII_sum: 0, //新风风阀故障II-发生总数
    airsupply_sensor_faultIII_sum: 0, //送风传感器故障III-发生总数
    freshair_sensor_faultIII_sum: 0, //新风传感器故障III-发生总数
    passengercompartment_returnairsensor2_faultIII_sum: 0, //客室回风传感器2故障III-发生总数
    passengercompartment_returnairsensor1_faultIII_sum: 0, //客室回风传感器1故障III-发生总数
    fanpowerbox_fanunit_faultIII_sum: 0, //风机电源箱风扇单元故障III-发生总数
    compressorpowerbox_fanunit_faultIII_sum: 0, //压缩机电源箱风扇单元故障III-发生总数
    pressurewave_controller_faultI_sum: 0, //压力波控制器故障（预留）I-发生总数
    compressor_frequencyconverter_faultII_sum: 0, //压缩机变频器故障II-发生总数
    fan_frequencyconverter_faultI_sum: 0, //风机变频器故障I-发生总数
    exhaustair_pressurewavevalve_faultI_sum: 0, //废排压力波阀故障I-发生总数
    freshair_pressurewavevalve_faultI_sum: 0, //新风压力波阀故障I-发生总数
  };
  var airconditioner2_faultsum = {
    comid: 0,
    passengercompartment_heat_faultII_sum: 0, //客室加热故障II-发生总数
    passengercompartment_cold_faultII_sum: 0, //客室制冷故障II-发生总数
    passengercompartment_ventilation_faultI_sum: 0, //客室通风故障I-发生总数
    ventilator1_faultII_sum: 0, //通风机1故障II-发生总数
    ventilator2_faultII_sum: 0, //通风机2故障II-发生总数
    exhaustfan_overload_faultII_sum: 0, //废排风机过载故障II-发生总数
    ventilator_overload_faultI_sum: 0, //通风机过载故障I-发生总数
    exhaustfan_faultII_sum: 0, //废排风机故障II-发生总数
    electricheat2_faultII_sum: 0, //电加热2故障II-发生总数
    electricheat1_faultII_sum: 0, //电加热1故障II-发生总数
    compressor_faultII_sum: 0, //压缩机故障II-发生总数
    ventilator_faultI_sum: 0, //通风机故障I-发生总数
    condensingfan_faultII_sum: 0, //冷凝风机故障II-发生总数
    system_highvoltagesensor_faultIII_sum: 0, //系统高压传感器故障III-发生总数
    system_lowvoltagesensor_faultIII_sum: 0, //系统低压传感器故障III-发生总数
    compressor_lowvoltage_faultIII_sum: 0, //压缩机低压故障III-发生总数
    compressor_highvoltage_faultIII_sum: 0, //压缩机高压故障III-发生总数
    electricheat2_overcurrent_faultII_sum: 0, //电加热2过流故障II-发生总数
    electricheat1_overcurrent_faultII_sum: 0, //电加热1过流故障II-发生总数
    compressor_overcurrent_faultII_sum: 0, //压缩机过流故障II-发生总数
    condensingfan_overload_faultII_sum: 0, //冷凝风机过载故障II-发生总数
    freshair_valve_faultII_sum: 0, //新风风阀故障II-发生总数
    airsupply_sensor_faultIII_sum: 0, //送风传感器故障III-发生总数
    freshair_sensor_faultIII_sum: 0, //新风传感器故障III-发生总数
    passengercompartment_returnairsensor2_faultIII_sum: 0, //客室回风传感器2故障III-发生总数
    passengercompartment_returnairsensor1_faultIII_sum: 0, //客室回风传感器1故障III-发生总数
    fanpowerbox_fanunit_faultIII_sum: 0, //风机电源箱风扇单元故障III-发生总数
    compressorpowerbox_fanunit_faultIII_sum: 0, //压缩机电源箱风扇单元故障III-发生总数
    pressurewave_controller_faultI_sum: 0, //压力波控制器故障（预留）I-发生总数
    compressor_frequencyconverter_faultII_sum: 0, //压缩机变频器故障II-发生总数
    fan_frequencyconverter_faultI_sum: 0, //风机变频器故障I-发生总数
    exhaustair_pressurewavevalve_faultI_sum: 0, //废排压力波阀故障I-发生总数
    freshair_pressurewavevalve_faultI_sum: 0, //新风压力波阀故障I-发生总数
  };

  function compareMsg(ele, index, lastmsg, airconditioner_faultsum) {
    let lastStr = lastmsg[index]; //取出00000000，与17（00010001）作对比
    if (lastStr != ele) {
      for (let i = 0; i < 8; i++) {
        if (lastStr[i] != ele[i]) {
          if (ele[i] == 1) {
            //就是故障从0到1
            airconditionerFaultSumCount(index, i, airconditioner_faultsum);
            //console.log("airconditioner_faultsum.passengercompartment_heat_faultII_sum:"+airconditioner_faultsum.passengercompartment_heat_faultII_sum)
          }
        }
      }
      lastmsg[index] = ele;
    }
  }

  function airconditionerFaultSumCount(index, i, airconditioner_faultsum) {
    switch (index) {
      case 0:
        switch (i) {
          case 5:
            airconditioner_faultsum.passengercompartment_heat_faultII_sum =
              airconditioner_faultsum.passengercompartment_heat_faultII_sum + 1;

            break;
          case 6:
            airconditioner_faultsum.passengercompartment_cold_faultII_sum =
              airconditioner_faultsum.passengercompartment_cold_faultII_sum + 1;
            break;
          case 7:
            airconditioner_faultsum.passengercompartment_ventilation_faultI_sum =
              airconditioner_faultsum.passengercompartment_ventilation_faultI_sum +
              1;
            break;
        }
        break;
      case 2:
        switch (i) {
          case 6:
            airconditioner_faultsum.ventilator1_faultII_sum =
              airconditioner_faultsum.ventilator1_faultII_sum + 1;
            break;
          case 7:
            airconditioner_faultsum.ventilator2_faultII_sum =
              airconditioner_faultsum.ventilator2_faultII_sum + 1;
            break;
        }
        break;
      case 3:
        switch (i) {
          case 0:
            airconditioner_faultsum.exhaustfan_overload_faultII_sum =
              airconditioner_faultsum.exhaustfan_overload_faultII_sum + 1;
            break;
          case 1:
            airconditioner_faultsum.ventilator_overload_faultI_sum =
              airconditioner_faultsum.ventilator_overload_faultI_sum + 1;
            break;
          case 2:
            airconditioner_faultsum.exhaustfan_faultII_sum =
              airconditioner_faultsum.exhaustfan_faultII_sum + 1;
            break;
          case 3:
            airconditioner_faultsum.electricheat2_faultII_sum =
              airconditioner_faultsum.electricheat2_faultII_sum + 1;
            break;
          case 4:
            airconditioner_faultsum.electricheat1_faultII_sum =
              airconditioner_faultsum.electricheat1_faultII_sum + 1;
            break;
          case 5:
            airconditioner_faultsum.compressor_faultII_sum =
              airconditioner_faultsum.compressor_faultII_sum + 1;
            break;
          case 6:
            airconditioner_faultsum.ventilator_faultI_sum =
              airconditioner_faultsum.ventilator_faultI_sum + 1;
            break;
          case 7:
            airconditioner_faultsum.condensingfan_faultII_sum =
              airconditioner_faultsum.condensingfan_faultII_sum + 1;
            break;
        }
        break;
      case 4:
        switch (i) {
          case 0:
            airconditioner_faultsum.system_highvoltagesensor_faultIII_sum =
              airconditioner_faultsum.system_highvoltagesensor_faultIII_sum + 1;
            break;
          case 1:
            airconditioner_faultsum.system_lowvoltagesensor_faultIII_sum =
              airconditioner_faultsum.system_lowvoltagesensor_faultIII_sum + 1;
            break;
          case 2:
            airconditioner_faultsum.compressor_lowvoltage_faultIII_sum =
              airconditioner_faultsum.compressor_lowvoltage_faultIII_sum + 1;
            break;
          case 3:
            airconditioner_faultsum.compressor_highvoltage_faultIII_sum =
              airconditioner_faultsum.compressor_highvoltage_faultIII_sum + 1;
            break;
          case 4:
            airconditioner_faultsum.electricheat2_overcurrent_faultII_sum =
              airconditioner_faultsum.electricheat2_overcurrent_faultII_sum + 1;
            break;
          case 5:
            airconditioner_faultsum.electricheat1_overcurrent_faultII_sum =
              airconditioner_faultsum.electricheat1_overcurrent_faultII_sum + 1;
            break;
          case 6:
            airconditioner_faultsum.compressor_overcurrent_faultII_sum =
              airconditioner_faultsum.compressor_overcurrent_faultII_sum + 1;
            break;
          case 7:
            airconditioner_faultsum.condensingfan_overload_faultII_sum =
              airconditioner_faultsum.condensingfan_overload_faultII_sum + 1;
            break;
        }
        break;
      case 5:
        switch (i) {
          case 3:
            airconditioner_faultsum.freshair_valve_faultII_sum =
              airconditioner_faultsum.freshair_valve_faultII_sum + 1;
            break;
          case 4:
            airconditioner_faultsum.airsupply_sensor_faultIII_sum =
              airconditioner_faultsum.airsupply_sensor_faultIII_sum + 1;
            break;
          case 5:
            airconditioner_faultsum.freshair_sensor_faultIII_sum =
              airconditioner_faultsum.freshair_sensor_faultIII_sum + 1;
            break;
          case 6:
            airconditioner_faultsum.passengercompartment_returnairsensor2_faultIII_sum =
              airconditioner_faultsum.passengercompartment_returnairsensor2_faultIII_sum +
              1;
            break;
          case 7:
            airconditioner_faultsum.passengercompartment_returnairsensor1_faultIII_sum =
              airconditioner_faultsum.passengercompartment_returnairsensor1_faultIII_sum +
              1;
            break;
        }
        break;
      case 6:
        switch (i) {
          case 1:
            airconditioner_faultsum.fanpowerbox_fanunit_faultIII_sum =
              airconditioner_faultsum.fanpowerbox_fanunit_faultIII_sum + 1;
            break;
          case 2:
            airconditioner_faultsum.compressorpowerbox_fanunit_faultIII_sum =
              airconditioner_faultsum.compressorpowerbox_fanunit_faultIII_sum +
              1;
            break;
          case 3:
            airconditioner_faultsum.pressurewave_controller_faultI_sum =
              airconditioner_faultsum.pressurewave_controller_faultI_sum + 1;
            break;
          case 4:
            airconditioner_faultsum.compressor_frequencyconverter_faultII_sum =
              airconditioner_faultsum.compressor_frequencyconverter_faultII_sum +
              1;
            break;
          case 5:
            airconditioner_faultsum.fan_frequencyconverter_faultI_sum =
              airconditioner_faultsum.fan_frequencyconverter_faultI_sum + 1;
            break;
          case 6:
            airconditioner_faultsum.exhaustair_pressurewavevalve_faultI_sum =
              airconditioner_faultsum.exhaustair_pressurewavevalve_faultI_sum +
              1;
            break;
          case 7:
            airconditioner_faultsum.freshair_pressurewavevalve_faultI_sum =
              airconditioner_faultsum.freshair_pressurewavevalve_faultI_sum + 1;
            break;
        }
        break;
    }
    return airconditioner_faultsum;
  }

  /* * 对二进制字符串进行补0
   * 1010 ==> 00001010
   * @param {*} ele2String
   * @returns
   */
  function fillZero(ele2String) {
    if (ele2String.length < 8) {
      let zeroNum = 8 - ele2String.length;
      for (let i = 0; i < zeroNum; i++) {
        ele2String = "0" + ele2String;
      }
    }
    return ele2String;
  }
  function hexto10(hex) {
    //十六进制转10进制
    var hexto10 = parseInt(hex, 16);
    return hexto10; //十六进制转10进制
  }
  function hexto2(hex) {
    //十六进制转2进制
    var hexto2 = fillZero(parseInt(hex, 16).toString(2));
    return hexto2; //十六进制转2进制
  }
  function binarytoarry2(str) {
    var switcharry = new Array();
    var i;
    for (i = 0; i < str.length; i++) {
      switcharry.push(str.charAt(i));
    }
    return switcharry;
    //遍历二进制字符串内容，输出数组
  }

  // console.log(JSON.stringify(data2));
  // return data2;
}
