<template>
  {{cardVisible}}
    <div id="TimeLine" class="timeline">
        <div class="up">TimeLine</div>
        <div class="down" id="timelineview" ref="timeLine">
          <el-card style="width: 100%;margin-top: 2px;" shadow="never" v-for="(date, index) in selectedDates" :key="index">
            <template #header>
              <div class="card-header">
                <span>{{generateDateStr(date)}}</span>
                <el-button-group size="small" style="float: right;">
                  <el-button @click="goTop(index)" :icon="Upload"/>
                  <el-button @click="goUp(index)" :icon="Top"/>
                  <el-button @click="goDown(index)" :icon="Bottom"/>
                  <el-button @click="goBottom(index)" :icon="Download"/>
                </el-button-group>
              </div>
            </template>
            <div :id="'TimelineView'+index" :style="{width:this.size.width+'px', height:this.size.height+'px'}">
            </div>
          </el-card>
        </div>
    </div>
  <transition name="el-fade-in-linear">
    <el-card class="box-card" body-style="padding:5px" v-if="cardVisible">
      <el-table :data="filteredBatchData" size="small" height="300">
        <el-table-column sortable property="batchNum" label="波次号" width="160" />
        <el-table-column sortable property="orderCnt" label="订单数" width="50" />
        <el-table-column sortable property="goodsTypeCnt" label="货品类型数" width="50" />
        <el-table-column sortable property="goodsCnt" label="货品数" width="50" />
        <el-table-column sortable property="processTime" label="处理时长" width="90" />
      </el-table>
    </el-card>
  </transition>

</template>

<script>
import _ from 'lodash'
import * as d3 from 'd3'
import {Bottom, Download, Top, Upload,} from '@element-plus/icons-vue'
import {ref, watch} from "vue";


export default {
    name: "TimeLine",
  computed: {
    Download() {
      return Download
    },
    Bottom() {
      return Bottom
    },
    Top() {
      return Top
    },
    Upload() {
      return Upload
    }
  },
    data() {
        return {
          size:{
            width:0,
            height:0,
            margin:{
              top:10, right:10, bottom:10,left:10
            },
            blockWidth:15,
            blockHorizontalInterval:20,//水平方向的间隔（竖着的
            blockVerticalInterval:10,//竖直方向的间隔（就是横着的
            blockHorizontalCnt:24//水平方向block的数量
          },
          width: '',
          height: '',
          rawData: '',
          myId: "TimelineView" + Date.now(),
          selectedDates: [],
          selectedTimeRange:[],
          batchGeneralList: require('../assets/batchGeneralList_202301_202305.json'),
          batchDetailedInfo: require('../assets/batchDetailedInfo_202301_202305.json'),
          filteredBatchData:[],
          cardVisible:false
        }
    },
    methods: {
      filterData(date,hour, type){
        const propertiesList=['create_batch', 'allocate_batch','picking_batch','close_batch']
        const filteredHour=_.find(this.batchGeneralList,{
          'dateinfo':date,
          'hourinfo':hour
        })
        console.log(filteredHour[propertiesList[type]])
        return _.filter(this.batchDetailedInfo, (i) => {
          return _.indexOf(filteredHour[propertiesList[type]], i['batchNum']) >= 0;
        })
      },
      generateDateStr(dateStr){
        let dateList=_.split(dateStr, '-')
        return dateList[0]+'.'+dateList[1]+'.'+dateList[2]
      },
      moveElementToTop(array, i) {
        if (i >= array.length || i === 0) {
          return array
        }
        const element = array.splice(i, 1)[0]
        array.unshift(element)
        return array
      },
      moveElementToUp(array, i) {
        if (i >= array.length || i === 0) {
          return array
        }
        const element = array.splice(i, 1)[0]
        array.splice(i - 1, 0, element)
        return array
      },
      moveElementToDown(array, i) {
        if (i >= array.length) {
          return array
        }
        const element = array.splice(i, 1)[0]
        array.splice(i + 1, 0, element)
        return array
      },
      moveElementToBottom(array, i) {
        if (i >= array.length) {
          return array
        }
        const element = array.splice(i, 1)[0]
        array.push(element)
        return array
      },
      goTop(id) {
        this.moveElementToTop(this.selectedDates, id)
      },
      goUp(id) {
        this.moveElementToUp(this.selectedDates, id)
      },
      goDown(id) {
        this.moveElementToDown(this.selectedDates, id)
      },
      goBottom(id) {
        this.moveElementToBottom(this.selectedDates, id)
      },
      preprocessData(date){
        let extremeValues = [[Infinity,-Infinity],[Infinity,-Infinity],[Infinity,-Infinity],[Infinity,-Infinity]]
        let result={
          bar:[],
          stream:[{
            type:0,
            value:[]
          }, {
            type:1,
            value:[]
          }, {
            type:2,
            value:[]
          }, {
            type:3,
            value:[]
          }],
          extremeValues:[]
        }
        const currentData=_.filter(this.rawData, (o)=>{
          return _.isEqual(o['dateinfo'], date)
        })
        _.forEach(currentData, (item)=>{
          if (item['orderCnt']<extremeValues[0][0]){
            extremeValues[0][0]=item['orderCnt']
          }
          if (item['orderCnt']>extremeValues[0][1]){
            extremeValues[0][1]=item['orderCnt']
          }
          if (item['goodsQuantity']<extremeValues[1][0]){
            extremeValues[1][0]=item['goodsQuantity']
          }
          if (item['goodsQuantity']>extremeValues[1][1]){
            extremeValues[1][1]=item['goodsQuantity']
          }
          if (item['goodsTypeCnt']<extremeValues[2][0]){
            extremeValues[2][0]=item['goodsTypeCnt']
          }
          if (item['goodsTypeCnt']>extremeValues[2][1]){
            extremeValues[2][1]=item['goodsTypeCnt']
          }
          let tempResult={
            sum:[],
            value:[]
          }
          tempResult.sum=[{
            value: item['orderCnt'],
            type:0,
            hour: item['hourinfo']
          }, {
            value: item['goodsQuantity'],
            type:1,
            hour: item['hourinfo']
          }, {
            value: item['goodsTypeCnt'],
            type:2,
            hour: item['hourinfo']
          }]
          tempResult.value=[{
            value: item['creatCnt'],
            hour: item['hourinfo'],
            type: 0,
            stack: item['creatCnt']
          }, {
            value: item['allocateCnt'],
            hour: item['hourinfo'],
            type: 1,
            stack: item['creatCnt']+item['allocateCnt']
          }, {
            value: item['pickingCnt'],
            hour: item['hourinfo'],
            type: 2,
            stack: item['creatCnt']+item['allocateCnt']+item['pickingCnt']
          }, {
            value: item['closeCnt'],
            hour: item['hourinfo'],
            type: 3,
            stack: item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']
          }]
          result.bar.push(tempResult)
          result.stream[0].value.push({
            value:item['creatCnt'],
            sum:item['creatCnt']
          })
          result.stream[1].value.push({
            value:item['allocateCnt'],
            sum:item['creatCnt']+item['allocateCnt']
          })
          result.stream[2].value.push({
            value:item['pickingCnt'],
            sum: item['creatCnt']+item['allocateCnt']+item['pickingCnt']
          })
          result.stream[3].value.push({
            value:item['closeCnt'],
            sum: item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']
          })
          if (item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']<extremeValues[3][0]){
            extremeValues[3][0]=item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']
          }
          if (item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']>extremeValues[3][1]){
            extremeValues[3][1]=item['creatCnt']+item['allocateCnt']+item['pickingCnt']+item['closeCnt']
          }
        })
        result.extremeValues=extremeValues
        return result
      },
      drawTimeLine(date, index){
        
        //纵坐标
        function getRowIndex(i) {
          return i%4
        }

        //横坐标
        function getLineIndex(i) {
          return _.floor(i/4)
        }
        
        const preprocessedData=this.preprocessData(date)
        console.log(preprocessedData)
        d3.select("#TimelineView"+index).selectAll("*").remove()
        const svg=d3.select("#TimelineView"+index)
            .append("svg")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
        let xScale=d3.scaleBand([0,this.size.blockWidth*this.size.blockHorizontalCnt+(this.size.blockWidth-1)*this.size.blockHorizontalInterval])
            .domain(Array.from({length: 24}, (v, i) => i))

        let yScale=d3.scaleLinear()
            .domain([0, preprocessedData.extremeValues[3][1]])
            .range([0, this.size.height-this.size.margin.top-this.size.margin.bottom])

        let line=d3.line()
            .x((d, i)=>{
              return xScale(i)+8+(20-8*2)/2
            })
            .y(d=>{
              return yScale(d['value'][3]['stack'])+12+5*this.size.blockVerticalInterval
            }).curve(d3.curveBumpX)

        const color = d3.scaleOrdinal()
            .domain([0,1,2, 3])
            .range(d3.schemeSpectral[4])
            .unknown("#ccc");

        const colorScale1=d3.scaleLinear()
            .domain(preprocessedData.extremeValues[0])
            .range(['yellow', 'purple'])

        const colorScale2=d3.scaleOrdinal()
            .domain(preprocessedData.extremeValues[0])
            .range(['yellow', 'purple'])


        const barStream=svg.append("g")
            barStream.selectAll()
            .data(preprocessedData['bar'])
            .join("g")
            .selectAll("rect")
            .data((d)=>{return d['value']})
            .join("rect")
            .attr("fill", d => {
              return color(d['type'])})
            .attr("x", d => {
              return xScale(d['hour'])
            })
            .attr("y", (d, i) => {
              return (yScale(d['stack'])-yScale(d['value']) + this.size.blockVerticalInterval*i)+this.size.margin.top
            })
            .attr("class", d=>d['type'])
            .attr("height", (d) => {
                  // if (yScale(d['value'])<0){
                  //   console.log(d, yScale(d['value']))
                  // }
                  return yScale(d['value'])
            })
            .attr("width", this.size.blockWidth)
            .attr("ref", "barRef")
            .on('click', (d, i)=>{
              if (!this.cardVisible){
                this.cardVisible=true
                this.filteredBatchData=this.filterData(date, i['hour'],i['type'])
              }else {
                this.cardVisible=false
              }
            })

        svg.append('path')
            .datum(preprocessedData['bar'])
            .attr("fill", "none")
            .attr("stroke", "#c4c4c4")
            .attr('opacity', 0.5)
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line)

        let appendCircle=svg.append('g')
            .selectAll()
            .data(preprocessedData['bar'])

        appendCircle.enter().append("circle")
            .attr('r', 8)
            .attr('cx', (d,i)=>{
              return xScale(i)+8+(20-8*2)/2
            })
            .attr('cy', (d)=>{
              return yScale(d['value'][3]['stack'])+12+5*this.size.blockVerticalInterval
            })
            .style('fill', '#e6e6e6')

        const area1 = d3.area()

            .x((d,i,j) => {
              if(i===0){
                return xScale(j[i]['value'][0]['hour'])+this.size.blockWidth
              }else {
                return xScale(j[i]['value'][0]['hour'])
              }
            })
            .y0((d) => {
              return yScale(d['value'][0]['stack'])+this.size.margin.top
            })
            .y1((d) => {
              return yScale(d['value'][0]['stack']-d['value'][0]['value'])+this.size.margin.top
            }).curve(d3.curveMonotoneX)

        const area2 = d3.area()
            .curve(d3.curveBasis)
            .x((d,i,j) => {
              if(i===0){
                return xScale(j[i]['value'][1]['hour'])+this.size.blockWidth
              }else {
                return xScale(j[i]['value'][1]['hour'])
              }
            })
            .y0((d) => {
              return yScale(d['value'][1]['stack'])+this.size.margin.top+this.size.blockVerticalInterval
            })
            .y1((d) => {
              return yScale(d['value'][1]['stack'])-yScale(d['value'][1]['value'])+this.size.margin.top+this.size.blockVerticalInterval
            })

        const area3 = d3.area()
            .curve(d3.curveBasis)
            .x((d,i,j) => {
              if(i===0){
                return xScale(j[i]['value'][2]['hour'])+this.size.blockWidth
              }else {
                return xScale(j[i]['value'][2]['hour'])
              }
            })
            .y0((d) => {
              return yScale(d['value'][2]['stack'])+this.size.margin.top+this.size.blockVerticalInterval*2
            })
            .y1((d) => {
              return yScale(d['value'][2]['stack'])-yScale(d['value'][2]['value'])+this.size.margin.top+this.size.blockVerticalInterval*2
            })

        const area4 = d3.area()
            .curve(d3.curveBasis)
            .x((d,i,j) => {
              if(i===0){
                return xScale(j[i]['value'][3]['hour'])+this.size.blockWidth
              }else {
                return xScale(j[i]['value'][3]['hour'])
              }
            })
            .y0((d) => {
              return yScale(d['value'][3]['stack'])+this.size.margin.top+this.size.blockVerticalInterval*3
            })
            .y1((d) => {
              return yScale(d['value'][3]['stack']-d['value'][3]['value'])+this.size.margin.top+this.size.blockVerticalInterval*3
            })


        for (let i = 0; i < 23; i++) {
          svg.append('g')
              .append("path")
              .attr("fill", "red")
              .attr("opacity", 0.1)
              .attr("stroke", "red")
              .attr("d", area1(_.slice(preprocessedData['bar'], i,i+2)));
          svg.append('g')
              .append("path")
              .attr("fill", "black")

              .attr("d", area2(_.slice(preprocessedData['bar'], i,i+2)));
          svg.append('g')
              .append("path")
              .attr("fill", "black")
              .attr("d", area3(_.slice(preprocessedData['bar'], i,i+2)));
          svg.append('g')
              .append("path")
              .attr("fill", "black")
              .attr("d", area4(_.slice(preprocessedData['bar'], i,i+2)));
        }

        appendCircle.join('g')
            .selectAll('circle')
            .data((d)=>{return d['sum']})
            .join('circle')
            .attr('r',(d, i)=>{
              const tmpScale=d3.scaleLinear()
                  .domain(preprocessedData['extremeValues'][i])
                  .range([2, 2*Math.sqrt(3)])
              return tmpScale(d['value'])
            })
            .attr('cx',(d,i)=>{
              return xScale(d['hour'])+8+(20-8*2)/2+(i-1)*(2*Math.sqrt(3))
            })
            .attr('cy',(d,i)=>{
              if (i===0||i===2){
                return yScale(preprocessedData['bar'][d['hour']]['value'][3]['stack'])+12+2+5*this.size.blockVerticalInterval
              }else {
                return yScale(preprocessedData['bar'][d['hour']]['value'][3]['stack'])+12-4+5*this.size.blockVerticalInterval
              }
            })
            .style('fill',(d,i)=>{
              const colorScale=d3.scaleLinear()
                  .domain(preprocessedData.extremeValues[i])
                  .range(['yellow', 'purple'])
              return colorScale(d['value'])
            })
      }
    },
    mounted() {
      this.size.width = this.$refs.timeLine.offsetWidth
      this.size.height = this.$refs.timeLine.offsetHeight
      this.rawData = require('@/assets/timeline_202301_202305.json')['data']

      watch(this.$store.state.clickDates, ()=>{
        this.selectedDates = this.$store.state.clickDates
        _.forEach(this.selectedDates, (date, index)=> {
          setTimeout(()=>{
            this.drawTimeLine(date, index)
          }, 1)

        })
      })
        
    },
    watch: {

    },
}

</script>

<style scoped>
.box-card{
  width: 410px;
}
.timeline{
    width: 100%;
    height: 100%;
}

.up{
    width: cal(100% - 5px);
    height: 5%;
    padding-left: 5px;
    font-size: 15px;
    font-weight: bold;
    text-decoration: underline;
}

.down{
    width: 100%;
    height: 95%;
}


</style>
