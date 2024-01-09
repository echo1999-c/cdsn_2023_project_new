<template>
    <div id="ProductProjection"  ref="productProjection" class="projection">
        <div class="up">Product Projection</div>
        <div class="mid" id="selectionview" ref="midview">
            <el-select v-model="monthvalue" class="customer_select" placeholder="请选择">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
        </div>
        <div class="down" id="projectionview"  ref="downview"></div>
    </div>
</template>

<script>
import * as d3 from 'd3'
import { contourDensity } from 'd3-contour';
import { voronoi } from 'd3-voronoi';
import { nest } from 'd3-collection';
import { fcumsum, min } from 'd3';

export default {
    name: "ProductProjection",
    data() {
        return {
            width: '',
            height: '',
            rawData_goodsinfo: '',
            options: [
            {
                value: '1月',
                label: '1月'
            }, 
            {
                value: '2月',
                label: '2月'
            }, 
            {
                value: '3月',
                label: '3月'
            }, 
            {
                value: '4月',
                label: '4月'
            },
            {
                value: '5月',
                label: '5月'
            }],
            monthvalue: '1月',
            minVal_outboundSum: 0,
            maxVal_outboundSum: 0,
            minVal_outboundFreq: 0,
            maxVal_outboundFreq: 0,
            goodsinfo: '',
            center_coordinates:''
        }
    },
    methods: {
        initData(){
            let rawData_goodsinfo = this.rawData_goodsinfo
            let monthvalue = this.monthvalue

            let minVal_outboundSum = 0
            let maxVal_outboundSum = 0
            let minVal_outboundFreq = 0
            let maxVal_outboundFreq = 0

            let minVal_outboundSumRatio = 0
            let maxVal_outboundSumRatio = 0
            let minVal_outboundFreqRatio = 0
            let maxVal_outboundFreqRatio = 0

            let goodsinfo = []

            
            if(monthvalue == "1月"){
                monthvalue = "2023-01"
            } else if(monthvalue == "2月"){
                monthvalue = "2023-02"
            } else if(monthvalue == "3月"){
                monthvalue = "2023-03"
            } else if(monthvalue == "4月"){
                monthvalue = "2023-04"
            } else if(monthvalue == "5月"){
                monthvalue = "2023-05"
            }

            goodsinfo = rawData_goodsinfo[monthvalue]
            this.goodsinfo = goodsinfo
            

            // 假设你的列表名为data_list
            let unique_clusterCenter_relative = Array.from(
                new Set(goodsinfo.map(item => {
                    // console.log("item", item)
                    return JSON.stringify(item.clusterCenter_tsneHierarchical_relative)
                }))
            ).map(item => JSON.parse(item));

            this.center_coordinates = unique_clusterCenter_relative
        
            
            minVal_outboundSum = d3.min(goodsinfo, function(d) { return d.outboundSum;})
            maxVal_outboundSum = d3.max(goodsinfo, function(d) { return d.outboundSum;})

            // minVal_outboundSum = Math.log(minVal_outboundSum) + 1
            // maxVal_outboundSum = Math.log(maxVal_outboundSum) + 1

            minVal_outboundFreq = d3.min(goodsinfo, function(d) { return d.outboundFreq;})
            maxVal_outboundFreq = d3.max(goodsinfo, function(d) { return d.outboundFreq;})

            // minVal_outboundFreq = Math.log(minVal_outboundFreq) + 1
            // maxVal_outboundFreq = Math.log(maxVal_outboundFreq) + 1

            minVal_outboundSumRatio = d3.min(goodsinfo, function(d) { return d.outboundSumRatio;})
            maxVal_outboundSumRatio = d3.max(goodsinfo, function(d) { return d.outboundSumRatio;})
            minVal_outboundFreqRatio = d3.min(goodsinfo, function(d) { return d.outboundFreqRatio;})
            maxVal_outboundFreqRatio = d3.max(goodsinfo, function(d) { return d.outboundFreqRatio;})

            this.minVal_outboundSum = minVal_outboundSum
            this.maxVal_outboundSum = maxVal_outboundSum
            this.minVal_outboundFreq = minVal_outboundFreq
            this.maxVal_outboundFreq = maxVal_outboundFreq
            
            this.minVal_outboundSumRatio = minVal_outboundSumRatio
            this.maxVal_outboundSumRatio = maxVal_outboundSumRatio
            this.minVal_outboundFreqRatio = minVal_outboundFreqRatio
            this.maxVal_outboundFreqRatio = maxVal_outboundFreqRatio
        },
        drawprojection(){
            d3.select('#projectionview').selectAll('*').remove();
            // console.log('goodsinfo', this.goodsinfo)
            let width = this.width
            let height = this.height
            let rawData_goodsinfo = this.rawData_goodsinfo

            let goodsinfo = this.goodsinfo
            let center_coordinates = this.center_coordinates
            // console.log('goodsinfo', goodsinfo)

            let innerRadius_single = 50
            let outerRadius_single = 70

            let arc_innerRadius_single = 15
            let arc_outerRadius_single = 40
            
            let innerRadius = 8
            let outerRadius = 10

            let arc_innerRadius = 3
            let arc_outerRadius = 6

            let that = this

            // 定义一个颜色数组
            let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];

            
            // 定义一个颜色比例尺
            let colorScale = d3.scaleOrdinal()
                .domain(this.center_coordinates.map(JSON.stringify)) // 使用字符串作为输入域
                .range(colors); // 使用颜色数组作为输出范围
            
            // 创建一个zoom行为
            let zoom = d3.zoom()
                .scaleExtent([0.8, 10]) // 设置缩放的范围
                .on("zoom", zoomed); // 设置zoom事件的监听器


            const svg = d3.select("#projectionview")
                            .append('svg')
                            .attr('id', 'projectsvg')
                            .attr('width', width - 5)
                            .attr('height', height - 5)
                            .style("z-index", "5")
                            .style("position", "relative")
                            .call(zoom)
            
            const contours = d3.contourDensity()
                                .x(d => width  * d['coordinates_tsneHierarchical_relative'][0])
                                .y(d => height * d['coordinates_tsneHierarchical_relative'][1])
                                .size([width, height])
                                .bandwidth(30)
                                .thresholds(30)
                                (goodsinfo);
            const contourColor = "#5587BB"
            const colorScale_contours = d3.scaleSequential(['white', contourColor])
                                .domain([
                                    d3.min(contours, (d) => d.value) * 0.9,
                                    d3.max(contours, (d) => d.value) * 1.1
                                ]);

            svg.append("g")
                .attr("fill", "none")
                .attr("id", "contourGroup")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .selectAll()
                .data(contours)
                .join("path")
                // .attr("stroke", "none")
                .attr("fill", (d) => colorScale_contours(d.value))
                .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 0.5)
                .attr("d", d3.geoPath());
                            
            
            let gCircle = svg.selectAll("g.circleGroup")
                            .data(goodsinfo)
                            .enter()
                            .append("g")
                            .attr("class", "circleGroup")        
                
            
            gCircle.append("circle")
                .attr("cx", function(d) {  
                    return width  * d['coordinates_tsneHierarchical_relative'][0]; 
                })
                .attr("cy", function(d) { return height * d['coordinates_tsneHierarchical_relative'][1]; }) 
                .attr("r", 1) 
                .style("fill", function(d){
                    return colorScale(JSON.stringify(d['clusterCenter_tsneHierarchical_relative']));
                })
               
            
            
            
            gCircle.on("click", function(event, d){
                let svg = d3.select("#projectsvg").node();
                    let svgRect = svg.getBoundingClientRect();
                    let svgWidth = svgRect.width;
                    let svgHeight = svgRect.height;
                    let svgTop = svgRect.top;
                    let svgLeft = svgRect.left;
            

                // 创建一个弹出框
                let popup = d3.select("#projectionview")
                            .append("div")
                            .attr("class", "popup")
                            .style("position", "absolute")
                            .style("z-index", "10")
                            .style("background", "#fff")
                            .style("border", "1px solid #ccc")
                            .style("width", (svgWidth / 2 ) + "px") 
                            .style("height", (svgHeight / 2) + "px") 
                            .style("left", svgLeft + "px")
                            .style("top", svgTop + "px")
                        
                popup.append("button")
                    .attr("class", "close-button")
                    .style("position", "absolute")
                    .style("right", "0")
                    .style("top", "0")
                    .text("关闭")
                    .style("z-index", "10000")
                    .on("click", function(event) {
                        popup.remove();
                    });
                
                // 在弹出框中添加一个SVG元素
                let popupSvg = popup.append("svg")
                        .attr("id", "popupSvg")
                        .attr("width", (svgWidth / 2) + "px")
                        .attr("height", (svgHeight / 2) + "px")
                        .attr("viewBox", `0 0 ${svgWidth / 2} ${svgHeight / 2}`)
                        .attr("preserveAspectRatio", "xMinYMin meet")
                
                // 定义间隙的宽度
                var gapWidth = 3; 

                let xval = svgWidth / 4;
                let yval = svgHeight / 4;

                // 原始的左半圆弧的arc生成器
                var arcLeft = d3.arc()
                                .innerRadius(innerRadius_single)
                                .outerRadius(outerRadius_single)
                                .startAngle(0) 
                                .endAngle(-Math.PI); 

                // 创建原始的左半圆弧
                popupSvg.append("path")
                    .attr("d", arcLeft())
                    .attr("id", "arcLeft")
                    .attr("transform", "translate(" + (xval - gapWidth / 2) + "," + yval + ")") 
                    .style("fill", "white") 
                    .style("stroke", "black");
                
                // 原始的右半圆弧的arc生成器
                var arcRight = d3.arc()
                                .innerRadius(innerRadius_single)
                                .outerRadius(outerRadius_single)
                                .startAngle(0) 
                                .endAngle(Math.PI); 

                // 创建原始的右半圆弧
                popupSvg.append("path")
                        .attr("d", arcRight())
                        .attr("id", "arcRight")
                        .attr("transform", "translate(" + (xval + gapWidth / 2) + "," + yval + ")") 
                        .style("fill", "white") 
                        .style("stroke", "black"); 
                
                // var scaleLeft = d3.scaleLinear()
                //                 .domain([0, that.maxVal_outboundSum])
                //                 .range([0, -Math.PI]);

                var scaleLeft = d3.scaleSymlog()
                                .domain([0, that.maxVal_outboundSum])
                                .range([0, -Math.PI]);
                
                
                // var scaleRight = d3.scaleLinear()
                //                 .domain([0, that.maxVal_outboundFreq])
                //                 .range([0, Math.PI]);

                var scaleRight = d3.scaleSymlog()
                                .domain([0, that.maxVal_outboundFreq + 10])
                                .range([0, Math.PI]);
                    
                var outboundSum = d.outboundSum
                var outboundFreq = d.outboundFreq


                // outboundSum = Math.log(outboundSum) + 1
                // outboundFreq = Math.log(outboundFreq) + 1

                // 出库数量的半圆弧生成器
                var arcoutboundSum = d3.arc()
                                        .innerRadius(innerRadius_single)
                                        .outerRadius(outerRadius_single)
                                        .startAngle(0) 
                                        .endAngle(scaleLeft(outboundSum));
                
                // 创建一个div元素作为信息提示框
                let tooltip = d3.select("#projectionview")
                                .append("div")
                                .attr("id", "path_tooltip")
                                .style("z-index", "1000")
                                .style("position", "relative")
                                .style("opacity", 0)
                                .style("border", "0px")
                                .style("border-radius", "8px")
                                .style("background", "rgb(46, 50, 56)")
                                .style("color", "snow")
                                .style("font-family", "Times New Roman")
                                .style("width", "fit-content")
                                .style("height", "fit-content")
                                .style("padding", "5px")
                                .style("text-align", "left")

                               

                            
    
                // 创建出库数量的半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcoutboundSum())
                        .attr("id", "arcoutboundSum")
                        .attr("transform", "translate(" + (xval - gapWidth / 2) + "," + yval + ")")
                        .style("fill", "#B2DF8A") 
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "#92C56A");

                            let position = d3.pointer(event);

                            tooltip.html('outboundSum: ' + d.outboundSum)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);

                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "#B2DF8A");

                            // 鼠标移出时隐藏信息提示框
                            tooltip.style("opacity", 0);
                        });
                
                // 出库频次的半圆弧生成器
                var arcoutboundFreq = d3.arc()
                                        .innerRadius(innerRadius_single)
                                        .outerRadius(outerRadius_single)
                                        .startAngle(0) 
                                        .endAngle(scaleRight(outboundFreq));
                

                // 创建出库频次的半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcoutboundFreq())
                        .attr("id", "arcoutboundFreq")
                        .attr("transform", "translate(" + (xval + gapWidth / 2) + "," + yval + ")") 
                        .style("fill", "#D7EDF2") 
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "#B1D9E1");

                            let position = d3.pointer(event);

                            tooltip.html('outboundFreq: ' + d.outboundFreq)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "#D7EDF2");

                            tooltip.style("opacity", 0);
                        });


                var outboundSum_lowerQ = d.outboundSum_lowerQuartile;
                var outboundSum_upperQ = d.outboundSum_upperQuartile;

                var outboundFreq_lowerQ = d.outboundFreq_lowerQuartile;
                var outboundFreq_upperQ = d.outboundFreq_upperQuartile;


                // 创建出库数量的下四分位数的半圆弧生成器
                var arcoutboundSum_lower_up = d3.arc()
                                                .innerRadius(innerRadius_single)
                                                .outerRadius(outerRadius_single)
                                                .startAngle(scaleLeft(outboundSum_lowerQ)) 
                                                .endAngle(scaleLeft(outboundSum_upperQ));

                // 创建出库数量的下四分位数的半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcoutboundSum_lower_up())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + (xval - gapWidth / 2) + "," + yval + ")") 
                        .style("fill", "#D8D8D8") 
                        .style("opacity", 0.8)
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "#B8B8B8");

                            let position = d3.pointer(event);

                            tooltip.html('outboundSum_lowerQ: ' + d.outboundSum_lowerQuartile + '<br>' + 'outboundSum_upperQ: ' + d.outboundSum_upperQuartile)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "#D8D8D8");

                            tooltip.style("opacity", 0);
                        });
                
                // 创建出库频次的下四分位数的半圆弧生成器      
                var arcoutboundFreq_lower_up = d3.arc()
                                                .innerRadius(innerRadius_single)
                                                .outerRadius(outerRadius_single)
                                                .startAngle(scaleRight(outboundFreq_lowerQ)) 
                                                .endAngle(scaleRight(outboundFreq_upperQ));

                // 创建出库频次的下四分位数的半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcoutboundFreq_lower_up())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + (xval + gapWidth / 2) + "," + yval + ")") 
                        .style("fill", "#D8D8D8") 
                        .style("opacity", 0.8)
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "#B8B8B8");

                            let position = d3.pointer(event);

                            tooltip.html('outboundFreq_lowerQ: ' + d.outboundFreq_lowerQuartile + '<br>' + 'outboundFreq_upperQ: ' + d.outboundFreq_upperQuartile)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "#D8D8D8");
                            tooltip.style("opacity", 0);
                        });
                
                
                var outboundSum_mean = d.outboundSum_mean
                // outboundSum_mean = Math.log(outboundSum_mean) + 1
                var outboundSum_mean_mapped = scaleLeft(outboundSum_mean);
                
                
                // 计算Sum线的起点和终点
                var outboundSum_lineStart = {
                    x: (xval - gapWidth / 2) + outerRadius_single * Math.cos(outboundSum_mean_mapped - Math.PI / 2),
                    y: yval + outerRadius_single * Math.sin(outboundSum_mean_mapped - Math.PI / 2)
                };
                var outboundSum_lineEnd = {
                    x: (xval - gapWidth / 2) + innerRadius_single * Math.cos(outboundSum_mean_mapped - Math.PI / 2),
                    y: yval + innerRadius_single * Math.sin(outboundSum_mean_mapped - Math.PI / 2
                    )
                };


                // 在SVG中添加一条线Sum
                popupSvg.append("line")
                        .datum(d)
                        .attr("x1", outboundSum_lineStart.x)
                        .attr("y1", outboundSum_lineStart.y)
                        .attr("x2", outboundSum_lineEnd.x)
                        .attr("y2", outboundSum_lineEnd.y)
                        .style("stroke", "black") 
                        .style("stroke-width", 2) 
                        .style("stroke-dasharray", ("3, 3"))
                        .on("mousemove", function(event, d){
                            d3.select(this).style("stroke-width", 4);

                            let position = d3.pointer(event);

                            tooltip.html('outboundSum_mean: ' + d.outboundSum_mean)
                                    .style("left", (position[0] + 30) + "px")
                                    .style("top", (position[1] - 320) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("stroke-width", 2);
                            tooltip.style("opacity", 0);
                        });


                var outboundFreq_mean = d.outboundFreq_mean       
                // outboundFreq_mean = Math.log(outboundFreq_mean) + 1
                var outboundFreq_mean_mapped = scaleRight(outboundFreq_mean);
                

                // 计算Freq线的起点和终点
                var outboundFreq_lineStart = {
                    x: (xval + gapWidth / 2) + outerRadius_single * Math.cos(outboundFreq_mean_mapped - Math.PI / 2),
                    y: yval + outerRadius_single * Math.sin(outboundFreq_mean_mapped - Math.PI / 2)
                };
                var outboundFreq_lineEnd = {
                    x: (xval + gapWidth / 2) + innerRadius_single * Math.cos(outboundFreq_mean_mapped - Math.PI / 2),
                    y: yval + innerRadius_single * Math.sin(outboundFreq_mean_mapped - Math.PI / 2)
                };

                // 在SVG中添加一条线Freq
                popupSvg.append("line")
                        .datum(d)
                        .attr("x1", outboundFreq_lineStart.x)
                        .attr("y1", outboundFreq_lineStart.y)
                        .attr("x2", outboundFreq_lineEnd.x)
                        .attr("y2", outboundFreq_lineEnd.y)
                        .style("stroke", "black") 
                        .style("stroke-width", 2) 
                        .style("stroke-dasharray", ("3, 3"))
                        .on("mousemove", function(event, d){
                            d3.select(this).style("stroke-width", 4);

                            let position = d3.pointer(event);

                            tooltip.html('outboundFreq_mean: ' + d.outboundFreq_mean)
                                    .style("left", (position[0] + 30) + "px")
                                    .style("top", (position[1] - 320) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("stroke-width", 2);
                            tooltip.style("opacity", 0);
                        });
                
                // 创建内部圆形的生成器
                var circle = d3.arc()
                                .innerRadius(0)
                                .outerRadius(arc_innerRadius_single)
                                .startAngle(0)
                                .endAngle(2 * Math.PI);

                // 创建内部圆形
                popupSvg.append("path")
                        .attr("d", circle())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + xval + "," + yval + ")") 
                        .style("fill", "none") 
                        .style("stroke", "black"); 



                // 创建内部上半圆弧的生成器
                var arcTop = d3.arc()
                                .innerRadius(arc_innerRadius_single) 
                                .outerRadius(arc_outerRadius_single)
                                .startAngle(-Math.PI * 1/4)
                                .endAngle(Math.PI * 1/4)
                
                // 创建内部下半圆弧的生成器
                var arcBottom = d3.arc()
                                .innerRadius(arc_innerRadius_single) 
                                .outerRadius(arc_outerRadius_single)
                                .startAngle(Math.PI * 3/4)
                                .endAngle(Math.PI * 5/4); 

                // 创建内部上半圆弧
                popupSvg.append("path")
                        .attr("d", arcTop())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + xval + "," + (yval) + ")") 
                        .style("fill", "none") 
                        .style("stroke", "black"); 

                // 创建内部下半圆弧
                popupSvg.append("path")
                        .attr("d", arcBottom())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + xval + "," + (yval) + ")") 
                        .style("fill", "none") 
                        .style("stroke", "black");
                
                let type = d.type
                // 在圆形中添加文字
                var text;
                if (type === 1) {
                    text = "A";
                } else if (type === 200) {
                    text = "B";
                } else if (type === 3000) {
                    text = "C";
                }

                popupSvg.append("text")
                        .attr("class", "zoomobj")
                        .attr("x", xval)
                        .attr("y", yval)
                        .style('font-size', 16)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .text(text);

                var outboundFreqRatio = d.outboundFreqRatio
                var outboundSumRatio = d.outboundSumRatio
                console.log("outboundFreqRatio", outboundFreqRatio)
                console.log("outboundSumRatio", outboundSumRatio)


                var angleScale_outboundSumRatio = d3.scaleSymlog()
                                                    .domain([that.minVal_outboundSumRatio - 0.0000000001, that.maxVal_outboundSumRatio])
                                                    .range([-Math.PI * 1/4, Math.PI * 1/4]);

                var angleScale_outboundFreqRatio = d3.scaleSymlog()
                                                    .domain([that.minVal_outboundFreqRatio - 0.0000000001, that.maxVal_outboundFreqRatio])
                                                    .range([Math.PI * 5/4, Math.PI * 3/4]);

                // 创建出库数量占比的上半圆弧生成器
                var arcTop_outboundSumRatio = d3.arc()
                                                .innerRadius(arc_innerRadius_single) 
                                                .outerRadius(arc_outerRadius_single) 
                                                .startAngle(-Math.PI * 1/4)
                                                .endAngle(angleScale_outboundSumRatio(outboundSumRatio)); 

                // 定义上半圆弧的直线纹理
                popupSvg.append("defs")
                    .append("pattern")
                    .attr("id", "stripe_outboundSumRatio")
                    .attr("width", "4")
                    .attr("height", "4")
                    .attr("patternUnits", "userSpaceOnUse")
                    .append("path")
                    .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                    .attr("stroke", "#B2DF8A")
                    .attr("stroke-width", "1");
                
                popupSvg.append("defs")
                    .append("pattern")
                    .attr("id", "stripe_outboundSumRatio_mouseover")
                    .attr("width", "4")
                    .attr("height", "4")
                    .attr("patternUnits", "userSpaceOnUse")
                    .append("path")
                    .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                    .attr("stroke", "#B2DF8A")
                    .attr("stroke-width", "3");


                // 创建出库数量占比的上半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcTop_outboundSumRatio())
                        .attr("transform", "translate(" + xval + "," + (yval) + ")")
                        .style("fill", "url(#stripe_outboundSumRatio)") 
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "url(#stripe_outboundSumRatio_mouseover)");

                            let position = d3.pointer(event);

                            tooltip.html('outboundSumRatio: ' + d.outboundSumRatio)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "url(#stripe_outboundSumRatio)");
                            tooltip.style("opacity", 0);
                        });
                
                // 创建出库频次占比的下半圆弧生成器
                var arcBottom_outboundFreqRatio = d3.arc()
                                                    .innerRadius(arc_innerRadius_single) 
                                                    .outerRadius(arc_outerRadius_single) 
                                                    .startAngle(Math.PI * 5/4)
                                                    .endAngle(angleScale_outboundFreqRatio(outboundFreqRatio)); 

                // 定义下半圆弧的直线纹理
                popupSvg.append("defs")
                        .append("pattern")
                        .attr("id", "stripe_outboundFreqRatio")
                        .attr("width", "4")
                        .attr("height", "4")
                        .attr("patternUnits", "userSpaceOnUse")
                        .append("path")
                        .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                        .attr("stroke", "#D7EDF2")
                        .attr("stroke-width", "1");
                
                popupSvg.append("defs")
                        .append("pattern")
                        .attr("id", "stripe_outboundFreqRatio_mouseover")
                        .attr("width", "4")
                        .attr("height", "4")
                        .attr("patternUnits", "userSpaceOnUse")
                        .append("path")
                        .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                        .attr("stroke", "#D7EDF2")
                        .attr("stroke-width", "3");
            

                // 创建出库频次占比的下半圆弧
                popupSvg.append("path")
                        .datum(d)
                        .attr("d", arcBottom_outboundFreqRatio())
                        .attr("class", "zoomobj")
                        .attr("transform", "translate(" + xval + "," + (yval) + ")")
                        .style("fill", "url(#stripe_outboundFreqRatio)") 
                        .style("stroke", "black")
                        .on("mousemove", function(event, d){
                            d3.select(this).style("fill", "url(#stripe_outboundFreqRatio_mouseover)");

                            let position = d3.pointer(event);

                            tooltip.html('outboundFreqRatio: ' + d.outboundFreqRatio)
                                    .style("left", (position[0] + 220) + "px")
                                    .style("top", (position[1] - 230) + "px")
                                    .style("opacity", .9);
                        })
                        .on("mouseout", function(event, d){
                            d3.select(this).style("fill", "url(#stripe_outboundFreqRatio)");
                            tooltip.style("opacity", 0);
                        });

            })
                    // .on("mouseout", function(event, d){
                    //     d3.selectAll(".popup").remove();
                    // })
 

            // 定义zoom事件的监听器
            function zoomed(event) {
                gCircle.attr("transform", event.transform);
                gCnter.attr("transform", event.transform);
                d3.select("#contourGroup").attr("transform", event.transform);
            }

            let rectWidth = 15; // 矩形的宽度
            let rectHeight = 15; // 矩形的高度

            let gCnter = svg.selectAll("g.rectangleCenter")
                            .data(center_coordinates)
                            .enter()
                            .append("g")
                            .attr("class", "rectangleCenter")        
                
           
            gCnter.append("rect")
                .attr("x", function(d) { 
                    return width  * d[0] - rectWidth / 2; // 矩形中心的x坐标减去矩形宽度的一半
                })
                .attr("y", function(d) { 
                    return height * d[1] - rectHeight / 2; // 矩形中心的y坐标减去矩形高度的一半
                })
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("rx", 2) // 设置矩形的圆角的x半径
                .attr("ry", 2) // 设置矩形的圆角的y半径
                .style("stroke", "grey")
                .style("stroke-width", "2")
                .style("fill", "none")
                .on("click", function(event, d){
                    let filterData;
                    filterData =  goodsinfo.filter((record) => {
                        return JSON.stringify(record.clusterCenter_tsneHierarchical_relative) === JSON.stringify(d)
                    });
                    console.log(filterData)
                })
        }      
                
        
    },
    mounted() {
        this.width = this.$refs.downview.offsetWidth
        this.height = this.$refs.downview.offsetHeight
        this.rawData_goodsinfo = require('@/assets/goodsinfo_202301_202305.json')
        this.initData()
        this.drawprojection()
        
    },
    watch: {
        monthvalue: function(newVal, oldVal) {
            this.initData();
            this.drawprojection();
        }
    },
}

</script>

<style scoped>
.projection{
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

.mid{
    width: cal(100% - 5px);
    height: 10%;
    padding-left: 5px;
    /* padding-top: 5px; */
}
.down{
    width: 100%;
    height: 85%;
    /* overflow: scroll; */
}

.customer_select{
    width: 80px;
    height: 15px;
    padding-top: 2px;
    margin: 0;
    font-size: 5px;
    float: left;
    transform: scale(0.9);
}
#path_tooltip{
    font-family: 'Times New Roman';
    font: 12px sans-serif;
    color: snow;
    background: rgb(46, 50, 56);
    border: 0px;
    border-radius: 8px;
}

</style>
