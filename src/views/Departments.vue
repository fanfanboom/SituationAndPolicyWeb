<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcostoms-alearance"></i> 学院信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-table :data="tableData" border>
        <el-table-column label="序号" type="index" width="50" align="center">
        </el-table-column>
        <el-table-column prop="id" label="学院代码" width="150" align="center"></el-table-column>
        <el-table-column prop="name" label="学院名称"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
import service from "../utils/request";

export default {
  name: "Departments",
  setup() {
    const state = reactive({
      tableData:[]
    });
    onMounted(()=>{
      service.get("/api/department/all").then(res=>{
        state.tableData=res.obj;
      })
    })
    return {
      ...toRefs(state)
    }
  },
}
</script>

<style scoped>

</style>
