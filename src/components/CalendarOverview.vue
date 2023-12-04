<template>
    <div id="CalendarOverview"  ref="calendarOverview" class="calendar">
        <div class="up">Calendar Overview</div>
        <div class="mid" id="legend" ref="midview">
            <!-- <el-select v-model="value" style="height: 10px;" class="customer_select" clearable placeholder="请选择">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select> -->
            <div id="left" style="width: 50%; height: 100%; float: left;" ref="midviewLeft">
                <el-select v-model="value" style="height: 10px;" class="customer_select" clearable placeholder="请选择">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div id="right" style="width: 50%; height: 100%; float: left;" ref="midviewRight"></div>    
        </div>
        <div class="down" id="view"  ref="downview">
            
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3'

export default {
    name: "CalendarOverview",
    data() {
        return {
            width: '',
            height: '',
            rawData: '',
            options: [{
                value: '波次数量',
                label: '波次数量'
            }, 
            {
                value: '订单数量',
                label: '订单数量'
            }, 
            {
                value: '货品数量',
                label: '货品数量'
            }, 
            {
                value: '货品类型数',
                label: '货品类型数'
            }],
            value: '波次数量',
            lowerQuartile: 0,
            upperQuartile: 0,
            minVal: 0,
            maxVal: 0,
            mincolor: "#2C7BB6",
            lowercolor: "#ABD9E9",
            upcolor: "#FDAE61",
            maxcolor: "#D7191C",
        }
    },
    methods: {
        initData(){
            // 读取一年的概览数据
            var rawData = this.rawData

            var value = this.value
            console.log("value", value)

            var lowerQuartile = 0
            var upperQuartile = 0
            var minVal = 0
            var maxVal = 0

            if(value === "波次数量"){
                lowerQuartile = d3.quantile(rawData.map(function(d) {
                                    return d.batchNum;
                                }), 0.25);
                upperQuartile = d3.quantile(rawData.map(function(d) {
                                        return d.batchNum
                                    }), 0.75);

                minVal = d3.min(rawData, function(d) { return d.batchNum;})
                maxVal = d3.max(rawData, function(d) { return d.batchNum;})
            } else if(value === "订单数量"){
                lowerQuartile = d3.quantile(rawData.map(function(d) {
                                    return d.orderNum;
                                }), 0.25);
                upperQuartile = d3.quantile(rawData.map(function(d) {
                                        return d.orderNum
                                    }), 0.75);

                minVal = d3.min(rawData, function(d) { return d.orderNum;})
                maxVal = d3.max(rawData, function(d) { return d.orderNum;})
            } else if(value === "货品数量"){
                lowerQuartile = d3.quantile(rawData.map(function(d) {
                                    return d.quantity;
                                }), 0.25);
                upperQuartile = d3.quantile(rawData.map(function(d) {
                                        return d.quantity
                                    }), 0.75);

                minVal = d3.min(rawData, function(d) { return d.quantity;})
                maxVal = d3.max(rawData, function(d) { return d.quantity;})
            } else {
                lowerQuartile = d3.quantile(rawData.map(function(d) {
                                    return d.goodsNum;
                                }), 0.25);
                upperQuartile = d3.quantile(rawData.map(function(d) {
                                        return d.goodsNum
                                    }), 0.75);

                minVal = d3.min(rawData, function(d) { return d.goodsNum;})
                maxVal = d3.max(rawData, function(d) { return d.goodsNum;})
            } 

            this.lowerQuartile = lowerQuartile
            this.upperQuartile = upperQuartile
            this.minVal = minVal
            this.maxVal = maxVal
            console.log("lowerQuartile", lowerQuartile)
            console.log("upperQuartile", upperQuartile)
            console.log("minVal", minVal)
            console.log("maxVal", maxVal)

        },
        drawLegend(){
            var width = this.$refs.midviewRight.offsetWidth
            var height = this.$refs.midviewRight.offsetHeight

            const rightsvg = d3.select("#right")
                            .append('svg')
                            .attr('width', width)
                            .attr('height', height)

            var mincolor = this.mincolor
            var lowercolor = this.lowercolor
            var upcolor = this.upcolor
            var maxcolor = this.maxcolor
            
            

            // 创建图例
            var legendWidth = 100, legendHeight = 12;

            // 创建一个线性渐变
            var gradient = rightsvg.append("defs")
                .append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            // 定义渐变的颜色和位置
            gradient.selectAll("stop")
                .data([
                    {offset: "0%", color: mincolor},
                    {offset: "33%", color: lowercolor},
                    {offset: "66%", color: upcolor},
                    {offset: "100%", color: maxcolor}
                ])
                .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            var textoffsetX = 40
            var textoffsetY = 15
            var textgap = legendWidth / 3

            // 添加一个使用渐变的矩形
            rightsvg.append("rect")
                .attr("x",  textoffsetX)
                .attr("y", textoffsetY)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#gradient)");

            // 添加文字说明
            var legendText = ["Min", "Q1", "Q2", "Max"];

            rightsvg.selectAll(".legendtext")
                .data(legendText)
                .enter().append("text")
                .attr("x", function(d, i) { 
                    var str = 0
                    if(i == 0)
                        str = textoffsetX
                    else if(i == 1)
                        str = textoffsetX + i * textgap
                    else if(i == 2)
                        str = textoffsetX + i * textgap
                    else
                        str = textoffsetX + legendWidth
                    return str; 
                })
                .attr("y", 34)
                // .attr("text-anchor", "middle")
                .attr("text-anchor", function(d, i) {
                    var str = ""
                    if(i == 0)
                        str = "start"
                    else if(i == 1 || i == 2)
                        str = "middle"
                    else
                        str = "end"
                    return str;
                })
                .style('font-size', 8)
                .style('font-family', 'Times New Roman')
                .style("font-weight", "bold")
                .text(function(d) { return d; });
        },
        drawCalendar(){
            d3.select('#view').selectAll('*').remove();
            let width = this.width
            let height = this.height

            const svg = d3.select("#view")
                            .append('svg')
                            .attr('width', width)
                            .attr('height', height)
                            .attr('viewBox', `${-width/2} ${-height/2} ${width} ${height}`)

            // 创建日期数组
            var dates = d3.timeDays(new Date(2023, 0, 1), new Date(2024, 0, 1)); // 包含1月-12月的日期
            
            // 读取一年的概览数据
            var rawData = this.rawData


            // 使用 d3.quantile() 方法计算上下四分位数
            var lowerQuartile = this.lowerQuartile
            var upperQuartile = this.upperQuartile

            var batchNumMin = this.minVal
            var batchNumMax = this.maxVal
            
            var mincolor = this.mincolor
            var lowercolor = this.lowercolor
            var upcolor = this.upcolor
            var maxcolor = this.maxcolor

            var colorScale = d3.scaleLinear()
                                .domain([batchNumMin, lowerQuartile, upperQuartile, batchNumMax])
                                .range([mincolor, lowercolor, upcolor, maxcolor])
                                

            // 添加文字标签
            var labels = ["日", "一", "二", "三", "四", "五", "六"];

            // 创建两个g元素，分别代表1月份和2月份
            var months = svg.selectAll("g")
                            .data([0, 1, 2, 3, 4, 5,6,7,8,9,10,11]) // 会控制旋转的角度，旋转n*30
                            .enter()
                            .append("g")
                            .attr("transform", function(d) {                            
                                return "translate(0,0) rotate(" + (d * 30) + ", 0, 0) scale(0.18)" 
                            });
            
            var radius = 21; // 圆形的半径
            var verticalPos_text = -790 // 文字标签的垂直位置
            var verticalPos_circle = -750 // 圆形圆心的垂直位置

            var that = this

            // 在每个g元素中添加文字标签和圆形
            months.each(function(month, i){
                var monthDates = dates.filter(function(d) { 
                    return d.getMonth() === i; // 过滤出当前月份的数据
                });

                // 计算每个月的波次数量的平均值
                var monthData = rawData.filter(function(o) {
                    return new Date(o.pickingTime).getMonth() === month;
                });
                var avgBatchNum = d3.mean(monthData, function(d) { return d.batchNum; });
                console.log("avgBatchNum", avgBatchNum)

                var radiusScale = d3.scaleLinear()
                                    .domain([batchNumMin, batchNumMax])
                                    .range([0, 20]);


                // 添加环形图
                // var arc = d3.arc()
                //             .innerRadius(50) // 内半径
                //             .outerRadius(50 + avgBatchNum / 25) // 外半径
                //             .startAngle(0) // 起始角度
                //             .endAngle(2 * Math.PI); // 终止角度

                // d3.select(this).append("path")
                //     .attr("d", arc)
                //     .attr("fill", "grey");
                
                d3.select(this).selectAll("text")
                    .data(labels)
                    .enter()
                    .append("text")
                    .attr("x", function(d, i) { return (i - 3) * radius * 2; })
                    .attr("y", verticalPos_text)
                    .attr("text-anchor", "middle")
                    .style('font-size', 24)
                    .style('font-family', 'Times New Roman')
                    .style("font-weight", "bold")
                    .text(function(d) { return d; })
                    
                
                d3.select(this).selectAll("circle")
                    .data(monthDates)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d, i) { 
                        // console.log("d", d)
                        var day = d.getDay() // 一周中的某一天
                        var date = d.getDate() //  一个月中的某一天
                        return (day - 3) * radius * 2;  
                    }) 
                    .attr("cy", function(d) { 
                        const firstDay = new Date(2023, month, 1); // 当前月份的第一天
                        const startingDay = firstDay.getDay(); // 第一天是周几
                        const targetDate = d.getDate(); // 一个月中的某一天
                        const row = Math.ceil((targetDate - 7 + startingDay) / 7); // 计算行
                        return verticalPos_circle + row * radius * 2;           
                    })
                    .attr("fill", (d, i) => {
                        var scaleData = rawData.find(function(o) {
                            return new Date(o.pickingTime).getTime() === new Date(d).getTime(); // new Date创建日期对象；getTime() 方法获取日期对象的时间戳
                        });
                        console.log("value", that.value)
                        var val = that.value
                        if(val === "波次数量"){
                            return scaleData ? colorScale(scaleData.batchNum) : 'black';
                        } else if(val === "订单数量"){
                            return scaleData ? colorScale(scaleData.orderNum) : 'black';
                        } else if(val === "货品数量"){
                            return scaleData ? colorScale(scaleData.quantity) : 'black';
                        } else {
                            return scaleData ? colorScale(scaleData.goodsNum) : 'black';
                        }

                    })
                    .attr("r", radius)}) 
            }  
    },
    mounted() {
        this.width = this.$refs.downview.offsetWidth
        this.height = this.$refs.downview.offsetHeight
        this.rawData = require('@/assets/overviewData_202301_202305.json')
        this.initData()
        this.drawLegend()
        this.drawCalendar()
    },
    watch: {
        value: function(newVal, oldVal) {
            this.initData();
            this.drawCalendar();
        }
    },
}

</script>

<style scoped>
.calendar{
    width: 100%;
    height: 100%;
}

.up{
    width: cal(100% - 5px);
    /* height: calc(5% - 5px); */
    height: 5%;
    padding-left: 5px;
    /* padding-top: 5px; */
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
    width: 100px;
    height: 15px;
    padding-top: 2px;
    margin: 0;
    font-size: 5px;
    float: left;
}

</style>
