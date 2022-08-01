<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcustomization"></i> 教学班
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div style="margin-bottom: 10px">
        <el-select v-model="queryObject.xnm" placeholder="学年" style="margin-right: 10px;margin-bottom: 5px">
          <el-option v-for="(item,index) in xnms" :label="item" :value="item" :key="index"></el-option>
        </el-select>
        <el-select v-model="queryObject.xqm" placeholder="学期" style="margin-right: 10px;margin-bottom: 5px">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
        </el-select>
        <el-select v-model="queryObject.course.id" placeholder="课程" style="margin-right: 10px;margin-bottom: 5px">
          <el-option v-for="(item,index) in courses" :value="item.id" :key="index" style="margin-right: 10px">
            <template #default>
              {{item.id}}-{{item.kcm}}
            </template>
          </el-option>
        </el-select>
        <el-select v-model="queryObject.classType" placeholder="教学班类型" style="margin-right: 10px;margin-bottom: 5px">
          <el-option value="正考" label="正考"></el-option>
          <el-option value="补缓考" label="补缓考"></el-option>
        </el-select>
        <el-select v-model="queryObject.classState" placeholder="教学班状态" style="margin-right: 10px;margin-bottom: 5px">
          <el-option value="锁定" label="锁定"></el-option>
          <el-option value="录入" label="录入"></el-option>
          <el-option value="保存" label="保存"></el-option>
          <el-option value="部分提交" label="部分提交"></el-option>
          <el-option value="提交" label="提交"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="warning" icon="el-icon-plus">批量导入教学班&选课</el-button>
      </div>
      <el-table :data="pagedData.content" border>
        <el-table-column label="序号" width="50" align="center">
          <template #default="scope">
            {{ pagedData.pageable.pageNumber * pagedData.pageable.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="学年" prop="xnm" width="90"></el-table-column>
        <el-table-column label="学期" prop="xqm" width="50"></el-table-column>
        <el-table-column label="课程">
          <template #default="scope">
            {{scope.row.course.id}}-{{scope.row.course.kcm}}
          </template>
        </el-table-column>
        <el-table-column label="教学班名" prop="name"></el-table-column>
        <el-table-column label="教学班类型" prop="classType"></el-table-column>
        <el-table-column label="教学班状态" prop="classState"></el-table-column>
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
  name: "TeachingClasses",
  setup() {
    const state = reactive({
      xnms:[],
      courses:[],
      queryObject:{
        xnm:"",
        xqm:"",
        course:{
          id:""
        },
        classType:"",
        classState:"",
      },
      pagedData: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageable: {
          pageNumber: 1,
          pageSize: 10,
        }
      },
    });
    const getData = () => {
      service.post(`/api/teachingClass/query/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
      /ASC/name`,state.queryObject).then(res=>{
        state.pagedData = res.obj;
      })
    };
    onMounted(()=>{
      getData();
      service.get("/api/teachingClass/allXnms").then(res=>{
        state.xnms=res.obj;
      });
      service.get("/api/course/all").then(res=>{
        state.courses=res.obj;
      })
    });
    const handlePageChange = (pageIndex) => {
      state.pagedData.pageable.pageNumber = pageIndex;
      getData();
    };
    const handleSearch = () => {
      //设置回到第一页，以免页数错误导致查询失败
      state.pagedData.pageable.pageNumber=1;
      getData();
    };
    return {
      ...toRefs(state),
      handlePageChange,handleSearch
    }
  },
}
</script>

<style scoped>

</style>
