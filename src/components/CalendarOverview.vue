<template>
    <div id="CalendarOverview"  ref="calendarOverview" class="calendar">
        <div class="up">Calendar Overview</div>
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
            monthDates: [],
        }
    },
    methods: {
        draw(){
            let width = this.width
            let height = this.height

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

            const svg = d3.select("#view")
                            .append('svg')
                            .attr('width', width)
                            .attr('height', height)
                            // .attr('style', 'border: 1px solid #D8D8D8')
                            .attr('viewBox', `${-width/2} ${-height/2} ${width} ${height}`)

            
            // 创建日期数组
            var dates = d3.timeDays(new Date(2023, 0, 1), new Date(2024, 0, 1)); // 包含1月-12月的日期
            
            var ordersData = [
                { date: new Date(2023, 0, 1), orders: 10 },
                { date: new Date(2023, 0, 2), orders: 20 },
                { date: new Date(2023, 0, 3), orders: 60 },
                { date: new Date(2023, 0, 4), orders: 50 },
                { date: new Date(2023, 0, 5), orders: 10 },
                { date: new Date(2023, 0, 6), orders: 20 },
                { date: new Date(2023, 0, 7), orders: 60 },
                { date: new Date(2023, 0, 8), orders: 50 },
                { date: new Date(2023, 0, 9), orders: 60 },
                { date: new Date(2023, 0, 10), orders: 50 },
                { date: new Date(2023, 0, 11), orders: 10 },
                { date: new Date(2023, 0, 12), orders: 20 },
                { date: new Date(2023, 0, 13), orders: 60 },
                { date: new Date(2023, 0, 14), orders: 50 },
                { date: new Date(2023, 0, 15), orders: 10 },
                { date: new Date(2023, 0, 16), orders: 20 },
                { date: new Date(2023, 0, 17), orders: 60 },
                { date: new Date(2023, 0, 18), orders: 50 },
                { date: new Date(2023, 0, 19), orders: 60 },
                { date: new Date(2023, 0, 20), orders: 50 },
                { date: new Date(2023, 0, 21), orders: 10 },
                { date: new Date(2023, 0, 22), orders: 20 },
                { date: new Date(2023, 0, 23), orders: 60 },
                { date: new Date(2023, 0, 24), orders: 50 },
                { date: new Date(2023, 0, 25), orders: 10 },
                { date: new Date(2023, 0, 26), orders: 20 },
                { date: new Date(2023, 0, 27), orders: 60 },
                { date: new Date(2023, 0, 28), orders: 50 },
                { date: new Date(2023, 0, 29), orders: 60 },
                { date: new Date(2023, 0, 30), orders: 50 },
                { date: new Date(2023, 0, 31), orders: 60 },
                { date: new Date(2023, 1, 1), orders: 50 },
            ];

            // 创建颜色比例尺
            var colorScale = d3.scaleSequential(d3.interpolateBlues)
                                .domain([0, d3.max(dates, function(d) { return d.orders; })]);

            // 创建颜色比例尺
            var colorScale = d3.scaleSequential(d3.interpolateBlues)
                    .domain([0, d3.max(ordersData, function(d) { return d.orders; })]);

            // 添加文字标签
            var labels = ["日", "一", "二", "三", "四", "五", "六"];

            // 创建两个g元素，分别代表1月份和2月份
            var months = svg.selectAll("g")
                            .data([0, 1, 2, 3, 4, 5,6,7,8,9,10,11]) // 会控制旋转的角度，旋转n*30
                            .enter()
                            .append("g")
                            .attr("transform", function(d) {                            
                                return "rotate(" + (d * 30) + ", 0, 0) scale(0.3)" 
                            });
            
            var radius = 15; // 圆形的半径
            var verticalPos_text = -610 // 文字标签的垂直位置
            var verticalPos_circle = -580 // 圆形圆心的垂直位置


          
            // 在每个g元素中添加文字标签和圆形
            months.each(function(month, i){
                var monthDates = dates.filter(function(d) { 
                    return d.getMonth() === i; // 过滤出当前月份的数据
                });
                // console.log("monthDates", monthDates)
                // that.monthDates = monthDates
                
                d3.select(this).selectAll("text")
                    .data(labels)
                    .enter()
                    .append("text")
                    .attr("x", function(d, i) { return (i - 3) * radius * 2; })
                    .attr("y", verticalPos_text)
                    .attr("text-anchor", "middle")
                    .style('font-size', 16)
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
                        
                        var orderData = ordersData.find(function(o) {
                            return new Date(o.date).getTime() === new Date(d).getTime(); // new Date创建日期对象；getTime() 方法获取日期对象的时间戳
                        });
                        return orderData ? colorScale(orderData.orders) : 'black'; // 如果找到订单数据，使用颜色比例尺计算颜色，否则使用默认颜色
                    })
                    .attr("r", radius)})
                    
            }  
    },
    mounted() {
        this.width = this.$refs.downview.offsetWidth
        this.height = this.$refs.downview.offsetHeight
        this.draw()
    }
}

</script>

<style scoped>
.calendar{
    width: 100%;
    height: 100%;
}

.up{
    width: 100%;
    height: calc(5% - 1px);
    padding-left: 5px;
    padding-top: 5px;
    font-size: 15px;
    font-weight: bold;
    text-decoration: underline;
}

.down{
    width: 100%;
    height: calc(95% - 1px);
}
</style>
