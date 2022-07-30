<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcostoms-alearance"></i> 学生信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div style="margin-bottom: 10px">
        <el-input v-model="queryObject.id" placeholder="学号（可模糊查询）" style="width: 229px;margin-right: 10px"></el-input>
        <el-input v-model="queryObject.personName" placeholder="姓名（可模糊查询）" style="width: 229px;margin-right: 10px"></el-input>
        <el-select v-model="queryObject.sex" placeholder="性别" style="width: 229px;margin-right: 5px">
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
        <br>
        <el-select v-model="queryObject.grade" placeholder="年级" style="margin-right: 10px">
          <el-option v-for="(item,index) in grades" :label="item" :value="item" :key="index"/>
        </el-select>
        <el-select v-model="queryObject.department.id" placeholder="学院" @change="handleDepartmentChange" style="margin-right: 10px">
          <el-option v-for="(item,index) in departments" :label="item.name" :value="item.id" :key="index"/>
        </el-select>
        <el-select v-model="queryObject.major.id" placeholder="专业" style="margin-right: 10px">
          <el-option v-for="(item,index) in majors" :label="item.name" :value="item.id" :key="index"/>
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="pagedData.content" border>
        <el-table-column label="序号" width="50" align="center">
          <template #default="scope">
            {{ pagedData.pageable.pageNumber * pagedData.pageable.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="学号" prop="id"></el-table-column>
        <el-table-column label="姓名" prop="personName"></el-table-column>
        <el-table-column label="性别" prop="sex"></el-table-column>
        <el-table-column label="年级" prop="grade"></el-table-column>
        <el-table-column label="学院" prop="department.name"></el-table-column>
        <el-table-column label="专业" prop="major.name"></el-table-column>
        <el-table-column label="班级" prop="myClass"></el-table-column>
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
  name: "Students",
  setup() {
    const state = reactive({
      queryObject: {
        id: "",
        personName: "",
        sex: "",
        grade: "",
        major: {
          id: ""
        },
        department: {
          id: "",
        }
      },
      departments: [],
      majors:[],
      grades:[],
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
      service.post(`/api/student/query/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
      /ASC/id`,state.queryObject).then(res=>{
        state.pagedData = res.obj;
      })
    };
    onMounted(()=>{
      getData();
      service.get("/api/department/all").then(res => {
        state.departments = res.obj;
      })
      service.get("/api/student/allGrades").then(res=>{
        state.grades=res.obj;
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
    const handleDepartmentChange = () => {
      state.queryObject.major.id='';
      service.get(`/api/major/queryList/${state.queryObject.department.id}`).then(res=>{
        state.majors=res.obj;
      })
    };
    return {
      ...toRefs(state),
      handlePageChange,handleSearch,handleDepartmentChange
    }
  },
}
</script>

<style scoped>

</style>
