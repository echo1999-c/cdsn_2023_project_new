<template>
    <div id="TimeLine"  ref="timeLine" class="timeline">
        <div class="up">TimeLine</div>
        <div class="down" id="timelineview"  ref="downview"></div>
    </div>
</template>

<script>
import * as d3 from 'd3'

export default {
    name: "TimeLine",
    data() {
        return {
            
        }
    },
    methods: {
              
                
        
    },
    mounted() {
        
        
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
    height: 95%;
}


</style>
