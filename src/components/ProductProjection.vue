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

export default {
    name: "ProductProjection",
    data() {
        return {
            width: '',
            height: '',
            rawData_goodsinfo: '',
            options: [{
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
            
            minVal_outboundSum = d3.min(rawData_goodsinfo[monthvalue], function(d) { return d.outboundSum;})
            maxVal_outboundSum = d3.max(rawData_goodsinfo[monthvalue], function(d) { return d.outboundSum;})

            // console.log("minVal_outboundSum", minVal_outboundSum)
            // console.log("maxVal_outboundSum", maxVal_outboundSum)

            minVal_outboundSum = Math.log(minVal_outboundSum) + 1
            maxVal_outboundSum = Math.log(maxVal_outboundSum) + 1

            // console.log("minVal_outboundSum", minVal_outboundSum)
            // console.log("maxVal_outboundSum", maxVal_outboundSum)

            minVal_outboundFreq = d3.min(rawData_goodsinfo[monthvalue], function(d) { return d.outboundFreq;})
            maxVal_outboundFreq = d3.max(rawData_goodsinfo[monthvalue], function(d) { return d.outboundFreq;})

            minVal_outboundFreq = Math.log(minVal_outboundFreq) + 1
            maxVal_outboundFreq = Math.log(maxVal_outboundFreq) + 1

            this.minVal_outboundSum = minVal_outboundSum
            this.maxVal_outboundSum = maxVal_outboundSum
            this.minVal_outboundFreq = minVal_outboundFreq
            this.maxVal_outboundFreq = maxVal_outboundFreq
        },
        drawprojection(){
            d3.select('#projectionview').selectAll('*').remove();
            // console.log(this.rawData_goodsinfo["2023-01"])
            let width = this.width
            let height = this.height
            let rawData_goodsinfo = this.rawData_goodsinfo
            

            const svg = d3.select("#projectionview")
                            .append('svg')
                            .attr('width', width)
                            .attr('height', height)
            

            const data_json = {
                    "goodsNum": "6926313578200",
                    "outboundFreq": "23254",
                    "outboundSum": "100235",
                    "date": "2023-05",
                    "outboundSum_upperQuartile": 1918,
                    "outboundSum_lowerQuartile": 28,
                    "outboundSum_mean": 3021,
                    "outboundSum_median": 345,
                    "outboundSum_max": 111175,
                    "outboundFreq_upperQuartile": 1154,
                    "outboundFreq_lowerQuartile": 18,
                    "outboundFreq_mean": 1782,
                    "outboundFreq_median": 227,
                    "outboundFreq_max": 37542,
                    "outboundFreq_min": 1,
                    "type": 1,
                    "locations": "B427",
                    "locationCnt": "1"
            }; 

            // 定义间隙的宽度
            var gapWidth = 3; // in pixels

            // 创建一个arc生成器
            var arcLeft = d3.arc()
                .innerRadius(60)
                .outerRadius(100)
                .startAngle(0) 
                .endAngle(-Math.PI); 

            // 在SVG中添加一个路径元素，并使用arc生成器来创建半圆弧
            svg.append("path")
                .attr("d", arcLeft())
                .attr("transform", "translate(" + (width / 2 - gapWidth / 2) + "," + height / 2 + ")") // shift the arc left
                .style("fill", "white") // set the fill color to white
                .style("stroke", "black");

            // 创建一个对称的arc生成器
            var arcRight = d3.arc()
                .innerRadius(60)
                .outerRadius(100)
                .startAngle(0) // 0 degrees in radians
                .endAngle(Math.PI); // 180 degrees in radians

            // 在SVG中添加一个路径元素，并使用arc生成器来创建右半圆弧
            svg.append("path")
                .attr("d", arcRight())
                .attr("transform", "translate(" + (width / 2 + gapWidth / 2) + "," + height / 2 + ")") // shift the arc right
                .style("fill", "white") // set the fill color to white
                .style("stroke", "black"); // set the stroke color to black
            
            // 创建一个线性比例尺，将outboundSum_max映射到最大的周长
            // var scaleLeft = d3.scaleLinear()
            //     .domain([0, data_json.outboundSum_max])
            //     .range([0, -Math.PI]);
            var scaleLeft = d3.scaleLinear()
                            .domain([0, this.maxVal_outboundSum])
                            .range([0, -Math.PI]);


            // 创建一个线性比例尺，将outboundFreq_max映射到最大的周长
            // var scaleRight = d3.scaleLinear()
            //     .domain([0, data_json.outboundFreq_max])
            //     .range([0, Math.PI]);
            var scaleRight = d3.scaleLinear()
                            .domain([0, this.maxVal_outboundFreq])
                            .range([0, Math.PI]);
            
            var outboundSum = rawData_goodsinfo["2023-01"][50]["outboundSum"]
            var outboundFreq = rawData_goodsinfo["2023-01"][50]["outboundFreq"]
            console.log("outboundSum", outboundSum)

            outboundSum = Math.log(outboundSum) + 1
            outboundFreq = Math.log(outboundFreq) + 1
            console.log("log outboundSum", outboundSum)
           
            var arcoutboundSum = d3.arc()
                                    .innerRadius(60)
                                    .outerRadius(100)
                                    .startAngle(0) 
                                    .endAngle(scaleLeft(outboundSum));
            console.log("scaleLeft(outboundSum)", scaleLeft(outboundSum))
            
            // 在SVG中添加一个路径元素，并使用arc生成器来创建半圆弧
            svg.append("path")
                .attr("d", arcoutboundSum())
                .attr("transform", "translate(" + (width / 2 - gapWidth / 2) + "," + height / 2 + ")") // shift the arc left
                .style("fill", "#B2DF8A") // set the fill color to white
                .style("stroke", "black");                       
            
            var arcoutboundFreq = d3.arc()
                                    .innerRadius(60)
                                    .outerRadius(100)
                                    .startAngle(0) 
                                    .endAngle(scaleRight(outboundFreq));

            // 在SVG中添加一个路径元素，并使用arc生成器来创建半圆弧
            svg.append("path")
                .attr("d", arcoutboundFreq())
                .attr("transform", "translate(" + (width / 2 + gapWidth / 2) + "," + height / 2 + ")") // shift the arc left
                .style("fill", "#D7EDF2") // set the fill color to white
                .style("stroke", "black"); 



            

            var outboundSum_lowerQ = rawData_goodsinfo["2023-01"][50]["outboundSum_lowerQuartile"];
            var outboundSum_upperQ = rawData_goodsinfo["2023-01"][50]["outboundSum_upperQuartile"];

            var outboundFreq_lowerQ = rawData_goodsinfo["2023-01"][50]["outboundFreq_lowerQuartile"];
            var outboundFreq_upperQ = rawData_goodsinfo["2023-01"][50]["outboundFreq_upperQuartile"];

            outboundSum_lowerQ = Math.log(outboundSum_lowerQ) + 1
            outboundSum_upperQ = Math.log(outboundSum_upperQ) + 1
            outboundFreq_lowerQ = Math.log(outboundFreq_lowerQ) + 1
            outboundFreq_upperQ = Math.log(outboundFreq_upperQ) + 1
           
            var arcoutboundSum_lower_up = d3.arc()
                                    .innerRadius(60)
                                    .outerRadius(100)
                                    .startAngle(scaleLeft(outboundSum_lowerQ)) 
                                    .endAngle(scaleLeft(outboundSum_upperQ));
            
            // 在SVG中添加一个路径元素，并使用arc生成器来创建半圆弧
            svg.append("path")
                .attr("d", arcoutboundSum_lower_up())
                .attr("transform", "translate(" + (width / 2 - gapWidth / 2) + "," + height / 2 + ")") // shift the arc left
                .style("fill", "#D8D8D8") 
                .style("stroke", "black");                       
            
            var arcoutboundFreq_lower_up = d3.arc()
                                    .innerRadius(60)
                                    .outerRadius(100)
                                    .startAngle(scaleRight(outboundFreq_lowerQ)) 
                                    .endAngle(scaleRight(outboundFreq_upperQ));

            // 在SVG中添加一个路径元素，并使用arc生成器来创建半圆弧
            svg.append("path")
                .attr("d", arcoutboundFreq_lower_up())
                .attr("transform", "translate(" + (width / 2 + gapWidth / 2) + "," + height / 2 + ")") // shift the arc left
                .style("fill", "#D8D8D8") // set the fill color to white
                .style("stroke", "black");
            
            // 映射outboundSum_mean
            var outboundSum_mean = rawData_goodsinfo["2023-01"][50]["outboundSum_mean"]
            console.log("outboundSum_mean", outboundSum_mean)
            outboundSum_mean = Math.log(outboundSum_mean) + 1
            console.log("log outboundSum_mean", outboundSum_mean)
            var outboundSum_mean_mapped = scaleLeft(outboundSum_mean);
            console.log("scale outboundSum_mean", outboundSum_mean_mapped)


            var outboundSum_lowerQ = rawData_goodsinfo["2023-01"][50]["outboundSum_lowerQuartile"]
            console.log("outboundSum_lowerQ", outboundSum_lowerQ)
            console.log("log outboundSum_lowerQ", Math.log(outboundSum_lowerQ) + 1)
            console.log("scale outboundSum_lowerQ", scaleLeft(Math.log(outboundSum_lowerQ) + 1))

            var outboundSum_upperQ = rawData_goodsinfo["2023-01"][50]["outboundSum_upperQuartile"]
            console.log("outboundSum_upperQ", outboundSum_upperQ)
            console.log("log outboundSum_upperQ", Math.log(outboundSum_upperQ) + 1)
            console.log("scale outboundSum_upperQ", scaleLeft(Math.log(outboundSum_upperQ) + 1))
            
            console.log("maxsum", rawData_goodsinfo["2023-01"][50]["outboundSum_max"]) 
            console.log("log maxVal_outboundSum", this.maxVal_outboundSum)
            console.log("scale sum_max", scaleLeft(this.maxVal_outboundSum))




            // 计算Sum线的起点和终点
            var outboundSum_lineStart = {
                x: (width / 2 - gapWidth / 2) + 100 * Math.cos(outboundSum_mean_mapped - Math.PI / 2),
                y: height / 2 + 100 * Math.sin(outboundSum_mean_mapped - Math.PI / 2)
            };
            var outboundSum_lineEnd = {
                x: (width / 2 - gapWidth / 2) + 60 * Math.cos(outboundSum_mean_mapped - Math.PI / 2),
                y: height / 2 + 60 * Math.sin(outboundSum_mean_mapped - Math.PI / 2
                )
            };

            // 在SVG中添加一条线Sum
            svg.append("line")
                .attr("x1", outboundSum_lineStart.x)
                .attr("y1", outboundSum_lineStart.y)
                .attr("x2", outboundSum_lineEnd.x)
                .attr("y2", outboundSum_lineEnd.y)
                .style("stroke", "black") 
                .style("stroke-width", 2) 
                .style("stroke-dasharray", ("3, 3")); 


            // 映射outboundFreq_mean
            var outboundFreq_mean = rawData_goodsinfo["2023-01"][50]["outboundFreq_mean"]
            // console.log("outboundFreq_mean", outboundFreq_mean)
            outboundFreq_mean = Math.log(outboundFreq_mean) + 1
            // console.log("log outboundFreq_mean", outboundFreq_mean)
            var outboundFreq_mean_mapped = scaleRight(outboundFreq_mean);
            // console.log("scale outboundFreq_mean", outboundFreq_mean_mapped)

            var outboundFreq_lowerQ = rawData_goodsinfo["2023-01"][50]["outboundFreq_lowerQuartile"]
            // console.log("outboundFreq_lowerQ", outboundFreq_lowerQ)
            // console.log("log outboundFreq_lowerQ", Math.log(outboundFreq_lowerQ) + 1)
            // console.log("scale outboundFreq_lowerQ", scaleRight(Math.log(outboundFreq_lowerQ) + 1))

            var outboundFreq_upperQ = rawData_goodsinfo["2023-01"][50]["outboundFreq_upperQuartile"]
            // console.log("outboundFreq_upperQ", outboundFreq_upperQ)
            // console.log("log outboundFreq_upperQ", Math.log(outboundFreq_upperQ) + 1)
            // console.log("scale outboundFreq_upperQ", scaleRight(Math.log(outboundFreq_upperQ) + 1))
            
            // console.log("maxfreq", rawData_goodsinfo["2023-01"][50]["outboundFreq_max"]) 
            // console.log("log maxVal_outboundFreq", this.maxVal_outboundFreq)
            // console.log("scale freq_max", scaleRight(this.maxVal_outboundFreq))
            
            // 计算Freq线的起点和终点
            var outboundFreq_lineStart = {
                x: (width / 2 + gapWidth / 2) + 100 * Math.cos(outboundFreq_mean_mapped - Math.PI / 2),
                y: height / 2 + 100 * Math.sin(outboundFreq_mean_mapped - Math.PI / 2)
            };
            var outboundFreq_lineEnd = {
                x: (width / 2 + gapWidth / 2) + 60 * Math.cos(outboundFreq_mean_mapped - Math.PI / 2),
                y: height / 2 + 60 * Math.sin(outboundFreq_mean_mapped - Math.PI / 2)
            };

            // 在SVG中添加一条线Freq
            svg.append("line")
                .attr("x1", outboundFreq_lineStart.x)
                .attr("y1", outboundFreq_lineStart.y)
                .attr("x2", outboundFreq_lineEnd.x)
                .attr("y2", outboundFreq_lineEnd.y)
                .style("stroke", "black") 
                .style("stroke-width", 2) 
                .style("stroke-dasharray", ("3, 3")); 

            



            
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
            // this.drawCalendar();
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

</style>
