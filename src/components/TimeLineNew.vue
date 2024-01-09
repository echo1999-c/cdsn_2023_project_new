<template>
    <div id="TimeLine" class="timeline">
        <div class="up">TimeLine</div>
        <div style="width: 100%; height: 95%; overflow: auto;" ref="wrapper">
            <div class="down" ref="timeLine" v-for="(date, index) in selectedDates" :key="index" >
                <div class="card-header" style="width: 100%; height: 15%;">
                    <span style="padding-left: 5px;">{{generateDateStr(date)}}</span>
                    <el-button-group size="small" style="float: right;">
                    <el-button @click="goTop(index)" :icon="Upload"/>
                    <el-button @click="goUp(index)" :icon="Top"/>
                    <el-button @click="goDown(index)" :icon="Bottom"/>
                    <el-button @click="goBottom(index)" :icon="Download"/>
                    </el-button-group>
                </div>
                <div :id="'StackriverView'+index" ref="stackriver" class="Stackriver" style="width: 100%; height: 85%;">
            
                </div>
            </div>
        </div>
        
        
    </div>
  </template>
  
  <script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import {Bottom, Download, Top, Upload,} from '@element-plus/icons-vue'
  import {ref, watch} from "vue";
import { scaleBand } from 'd3';
  
  
  export default {
        name: "TimeLineNew",
        data() {
            return {
                width: '',
                height: '',
                rawData: '',
                selectedDates: [],
            }
        },
        methods: {
            drawTimeLine(date, index){
                d3.select("#StackriverView"+index).selectAll('*').remove();
                
                // console.log(this.rawData)
                console.log("date", date)
                console.log(this.selectedDates)
                console.log("date.slice(0, 7)", date.slice(0, 10))

                let sliceData;
                sliceData =  this.rawData.filter((record) => {
                    return record.dateinfo.includes(date.slice(0, 10)); 
                });
                console.log("sliceData", sliceData)

                let maxSum = sliceData.reduce((max, item) => {
                    let sum = item.creatCnt + item.allocateCnt + item.pickingCnt + item.closeCnt;
                    return sum > max ? sum : max;
                }, 0);

                console.log(maxSum);



                const svg = d3.select("#StackriverView"+index)
                            .append("svg")
                            .attr('width', '100%')
                            .attr('height', '100%');

                // 获取svg的宽度和高度
                const svgNode = svg.node();
                this.width = svgNode.getBoundingClientRect().width;
                this.height = svgNode.getBoundingClientRect().height;

                var padding = { top: 10, right: 10, bottom: 10, left: 10 };
                let gapSpace = 5;

                let xScale = d3.scaleBand()
                                .domain(Array.from({length: 24}, (v, i) => i))
                                .range([padding.left, this.width - padding.right])
                                .paddingInner(0.8) // 设置band之间的间隔为80%,用于调整band的宽度
                                .paddingOuter(0.1); // 设置第一个band和最后一个band与范围的边界之间的间隔为10%
                
                var xAxis = d3.axisBottom(xScale)
                                .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16,18,20,22])
                  
                
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0,0)")
                    .call(xAxis)
                
                let yScale = d3.scaleLinear()
                                .domain([0, maxSum])
                                // .range([0, this.height - padding.top - padding.bottom - 3 * gapSpace])
                                .range([0, this.height - padding.top - padding.bottom])
                
                let colors = ["#2F6489", "#7D4446", "#50844F", "#75497D"]

                let globalList = []
                for(let i = 0; i < sliceData.length; i++) {
                    let tmp = []
                    for(let j = 0; j < 4; j++){
                        let str = ''
                        if(j == 0)
                            str = 'creatCnt'
                        else if(j == 1)
                            str = 'allocateCnt'
                        else if(j == 2)
                            str = 'pickingCnt'
                        else if(j == 3)
                            str = 'closeCnt'
                        let tmpObj = {}
                        tmpObj['dateinfo'] = sliceData[i]['dateinfo']
                        tmpObj['hour'] = sliceData[i]['hourinfo']
                        tmpObj[str] = sliceData[i][str]
                        tmpObj['initCnt'] = sliceData[i][str]
                        tmpObj['type'] = str.slice(0, -3)
                        if(j == 0)
                            tmpObj['stackCnt'] = sliceData[i]['creatCnt']
                        else if(j == 1)
                            tmpObj['stackCnt'] = sliceData[i]['creatCnt'] + sliceData[i]['allocateCnt']
                        else if(j == 2)
                            tmpObj['stackCnt'] = sliceData[i]['creatCnt'] + sliceData[i]['allocateCnt'] + sliceData[i]['pickingCnt']
                        else if(j == 3)
                            tmpObj['stackCnt'] = sliceData[i]['creatCnt'] + sliceData[i]['allocateCnt'] + sliceData[i]['pickingCnt'] + sliceData[i]['closeCnt']
                        tmp.push(tmpObj)
                    }
                    globalList.push(tmp)
                }

                console.log(globalList)

                const barStream=svg.append("g")
                barStream.selectAll()
                        .data(globalList)
                        .join("g")
                        .selectAll("rect")
                        .data((d) => d)
                        .join("rect")
                        .attr("class", (d, i) => {
                            return "rect_" + d['type']
                        })
                        .attr("id", (d, i) => {
                            return "rect_" + d['type'] + d['hour'] 
                        })
                        .attr("x", (d, i) => {
                            return xScale(d['hour'])
                        })
                        .attr("y", (d, i) => {
                            if(i == 0)
                                return 0;
                            else 
                                // return yScale(d['stackCnt'] - d['initCnt']) + gapSpace * i;
                                return yScale(d['stackCnt'] - d['initCnt']);
                        })
                        .attr("height", (d, i) => {
                            return yScale(d['initCnt'])
                        })
                        .attr("width", (d, i) => {
                            return xScale.bandwidth()
                        })
                        .attr("transform", "translate(0," + (padding.top + padding.bottom) + ")" )
                        .attr("fill", (d, i) => {
                            if(i == 0)
                                return colors[0]
                            else if(i == 1)
                                return colors[1]
                            else if(i == 2)
                                return colors[2]
                            else if(i == 3)
                                return colors[3]
                        })
                
                //创建对象
                function createLink(type, x, y, h){
                    var o = new Object()
                    o.type = type;
                    o.x = x;
                    o.y = y;
                    o.h = h
                    return o;
                }

                function Link(source, target){
                    var o = new Object()
                    o.source = source;
                    o.target = target;
                    return o;
                } 

                var link_list = []
                for(var x = 0; x < globalList.length - 1; x++){
                    for(var y = 0; y < globalList[x].length; y++){
                       
                        var temp1 = globalList[x][y] //source所在的矩形
                        var temp2 = globalList[x + 1][y] //target所在的矩形
                        

                        if(temp1['type'] == 'creat' && temp2['type'] == 'creat') {
                            var creatlink1 = createLink(temp1['type'], xScale(temp1['hour']), 0, yScale(temp1['initCnt']))
                            var creatlink2 = createLink(temp2['type'], xScale(temp2['hour']), 0, yScale(temp2['initCnt']))
                            
                            
                            var link = Link(creatlink1, creatlink2)
                            link_list.push(link)
                        }
                        else{
                            // var creatlink1 = createLink(temp1['type'], xScale(temp1['hour']), yScale(temp1['stackCnt'] - temp1['initCnt']) + gapSpace * y, yScale(temp1['initCnt']))
                            // var creatlink2 = createLink(temp2['type'], xScale(temp2['hour']), yScale(temp2['stackCnt'] - temp2['initCnt']) + gapSpace * y, yScale(temp2['initCnt']))
                            var creatlink1 = createLink(temp1['type'], xScale(temp1['hour']), yScale(temp1['stackCnt'] - temp1['initCnt']) , yScale(temp1['initCnt']))
                            var creatlink2 = createLink(temp2['type'], xScale(temp2['hour']), yScale(temp2['stackCnt'] - temp2['initCnt']) , yScale(temp2['initCnt']))
                            
                            var link = Link(creatlink1, creatlink2)
                            link_list.push(link)
                        }
                                      
                        
                    }
                }

                function link_path(d) {
                    // console.log(d)
                    var cx1 = d.x1 + (d.x2 - d.x1) / 3;
                    var cy1 = d.upy1;
                    var cx2 = d.x1 + (d.x2 - d.x1) * 2 / 3;
                    var cy2 = d.upy2
                    
                    var cx3 = d.x2 + (d.x1 - d.x2) / 3;
                    var cy3 = d.downy2;
                    var cx4 = d.x2 + (d.x1 - d.x2) * 2 / 3;
                    var cy4 = d.downy1


                    return "M" + d.x1 + "," + d.upy1 + "C" + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + d.x2 + "," + d.upy2 +
                    "L" + d.x2 + "," + d.downy2 + 
                    "C" + cx3 + "," + cy3 + " " + cx4 + "," + cy4 + " " + d.x1 + "," + d.downy1 +
                    "L" + d.x1 + "," + d.upy1 + " " + "Z" 
                }

                link_list.forEach((d, i) => {
                    d.x1 = d.source.x + xScale.bandwidth()
                    d.upy1 = d.source.y
                    d.downy1 = d.source.h + d.source.y
                    d.w1 = xScale.bandwidth()

                    d.x2 = d.target.x
                    d.upy2 = d.target.y
                    d.downy2 = d.target.h + d.target.y
                    d.w2 = xScale.bandwidth()
                    d.type = d.target.type
                })

                var link_objs = svg.append('g')
                        .attr("class", "links")
                        .selectAll('g')
                        .data(link_list)
                        .join("path")
                        .attr("class", (d, i) => {
                            return "link_" + d.source.type
                        })
                        .attr("d", (d, i) => { 
                            // console.log(d)
                            return link_path(d) })
                        .attr("fill", (d, i) => {
                            if(d.source.type == 'creat')
                                return colors[0]
                            else if(d.source.type == 'allocate')
                                return colors[1]
                            else if(d.source.type == 'picking')
                                return colors[2]
                            else if(d.source.type == 'close')
                                return colors[3]
                        })
                        .attr("transform", "translate(0," + (padding.top + padding.bottom) + ")" )
                        .attr("visibility", "visible")
                        .style("fill-opacity", 0.25)
                        .attr("stroke", "none")
                
                
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
        },
      
        mounted() {
            
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
        watch: {
    
        },
  }
  
  </script>
  
  <style scoped>
  
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
      height: 47.5%;
      
  }
  
  
  
  
  </style>
  