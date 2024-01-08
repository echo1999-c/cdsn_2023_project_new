<template>
    <div id="container" style="height: 100vh;">
        <div class="first_row" style="width: 100%; height: 50%;">
            <div class="col" style="height: calc(100% - 3px); width: calc(20% - 3px);" >
                <CalendarOverview></CalendarOverview>
            </div>
            <div class="col" style="height: calc(100% - 3px); width: calc(40% - 3px);">
                <TimeLine></TimeLine>
            </div>
            <div class="col" style="height: calc(100% - 3px); width: calc(40% - 3px);">item1</div>
        </div>
        <div class="second_row" style="width: 100%; height: 50%;">
            <div class="col" style="height: calc(100% - 3px); width: calc(35% - 3px);" >
                <ProductProjection></ProductProjection>
            </div>
            <div class="col" style="height: calc(100% - 3px); width: calc(30% - 3px);">item2</div>
            <div class="col" style="height: calc(100% - 3px); width: calc(35% - 3px);">item3</div>
        </div>
    </div>
</template>
<script>


import CalendarOverview from '@/components/CalendarOverview.vue';
import ProductProjection from '@/components/ProductProjection.vue';
import TimeLine from '@/components/TimeLine.vue';
  
export default {
    name: "homepage",
    components: {
        CalendarOverview,
        ProductProjection,
        TimeLine
    }
};
</script>
  
<style scoped>
#container{
    height: 100%;
    width: 100%;
    
    position: absolute; 
    left: 0;
    top: 0; 
    overflow: auto;
}
.first_row{
   float: left;
}
.second_row{
    float: left;
}
.col{
    float: left;
    box-sizing: border-box;
    display: inline-block;
    border: 1px solid #D8D8D8;
    margin-right: 3px;
    margin-bottom: 3px;
}
</style>
  