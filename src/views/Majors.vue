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
      <div style="margin-bottom: 10px">
        <el-select v-model="departmentId" placeholder="归属学院" style="margin-right: 10px">
          <el-option v-for="(item,index) in departments" :label="item.name" :value="item.id" :key="index"/>
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="warning" icon="el-icon-plus" @click="dialogVisible=true">新增专业</el-button>
      </div>
      <el-table :data="pagedData.content" border>
        <el-table-column label="序号" width="50" align="center">
          <template #default="scope">
            {{ pagedData.pageable.pageNumber * pagedData.pageable.pageSize + scope.$index + 1 }}
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

    <el-dialog title="新增专业" v-model="dialogVisible" width="40%">
      <el-form label-width="70px" :model="newMajor">
        <el-form-item label="新专业id">
          <el-input v-model="newMajor.id"></el-input>
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="newMajor.name"></el-input>
        </el-form-item>
        <el-form-item label="归属学院">
          <el-select v-model="newMajor.department.id" placeholder="归属学院">
            <el-option v-for="(item,index) in departments" :label="item.name" :value="item.id" :key="index"/>
          </el-select>
        </el-form-item>
        <el-tag type="danger" size="large">Tips:专业属于系统重要基础数据，请联系学校确定信息无误后准确录入。</el-tag>
      </el-form>
      <template #footer>
                <span>
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleAdd">确 定</el-button>
                </span>
      </template>
    </el-dialog>
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
      },
      departments: [],
      departmentId: '',
      dialogVisible:false,
      newMajor:{
        id:'',
        name:'',
        department:{
          id:''
        }
      }
    });
    const getData = () => {
      service.get(`/api/major/query/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
      /ASC/department?departmentId=${state.departmentId}`).then(res => {
        state.pagedData = res.obj;
      })
    }
    onMounted(() => {
      getData();
      service.get("/api/department/all").then(res => {
        state.departments = res.obj;
      })
    })
    const handlePageChange = (pageIndex) => {
      state.pagedData.pageable.pageNumber = pageIndex;
      getData();
    }
    const handleSearch = () => {
      //设置回到第一页，以免页数错误导致查询失败
      state.pagedData.pageable.pageNumber=1;
      getData();
    }
    const handleAdd = () => {
      service.post("/api/major/add",state.newMajor).then(()=>{
        state.dialogVisible=false;
        //设置回到第一页，以免页数错误导致查询失败
        state.pagedData.pageable.pageNumber=1;
        getData();
      })
    }
    return {
      ...toRefs(state),
      handlePageChange, handleSearch,handleAdd
    }
  },
}
</script>

<style scoped>

</style>
