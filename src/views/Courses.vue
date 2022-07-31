<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcostoms-alearance"></i> 课程信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-table :data="tableData" border>
        <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="kch" label="课程号" align="center"></el-table-column>
        <el-table-column prop="kcm" label="课程名称" align="center"></el-table-column>
        <el-table-column prop="xf" label="学分" align="center"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
import service from "../utils/request";

export default {
  name: "Courses",
  setup() {
    const state = reactive({
      tableData: []
    });
    onMounted(() => {
      service.get("/api/course/all").then(res => {
        state.tableData = res.obj;
      })
    });
    return {
      ...toRefs(state)
    }
  },
}
</script>

<style scoped>

</style>
