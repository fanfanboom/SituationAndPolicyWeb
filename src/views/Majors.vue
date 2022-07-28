<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcostoms-alearance"></i> 专业信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-table :data="pagedData.content" border>
        <el-table-column label="序号" width="50" align="center">
          <template #default="scope">
            {{pagedData.pageable.pageNumber*pagedData.pageable.pageSize+scope.$index+1}}
          </template>
        </el-table-column>
        <el-table-column label="专业代码" prop="id"></el-table-column>
        <el-table-column label="专业名称" prop="name"></el-table-column>
        <el-table-column label="归属学院" prop="department.name"></el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="pagedData.pageable.pageNumber+1"
                       :page-size="pagedData.pageable.pageSize" :total="pagedData.totalElements"
                       @current-change="handlePageChange"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
import service from "../utils/request";

export default {
  name: "Majors",
  setup() {
    const state = reactive({
      pagedData: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageable: {
          pageNumber: 1,
          pageSize: 10,
        }
      }
    });
    const getData = ()=>{
      state.tableData = service.get(`/api/major/all/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}/ASC/department`).then(res => {
        state.pagedData=res.obj;
      })
    }
    onMounted(() => {
      getData();
    })
    const handlePageChange = (pageIndex) => {
      state.pagedData.pageable.pageNumber=pageIndex;
      getData();
    }
    return {
      ...toRefs(state),
      handlePageChange
    }
  },
}
</script>

<style scoped>

</style>
