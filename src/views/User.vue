<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>基础信息</span>
            </div>
          </template>
          <div class="info">
            <div class="info-image">
              <img :src="avatarImg"/>
            </div>
            <div class="info-name">{{ name }}</div>
            <div class="info-desc">好好学习，天天向上！</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>账户编辑</span>
            </div>
          </template>
          <el-form label-width="90px" :model="form" :rules="formRules" ref="formRef">
            <el-form-item label="用户："> {{ name }}</el-form-item>
            <el-form-item label="旧密码：" prop="old">
              <el-input type="password" v-model="form.old" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码：" prop="new">
              <el-input type="password" v-model="form.new" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <i class="info">（Tips：新密码至少为8个字符，至少包含1个大写字母，1个小写字母和1个数字）</i>
            </el-form-item>
            <el-form-item label="个人简介：">
              <el-input v-model="form.desc" disabled></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {reactive, ref} from "vue";
import avatar from "../assets/img/aha.jpg";
import {ElMessage} from "element-plus";
import service from "../utils/request";

export default {
  name: "user",
  setup() {
    const name = JSON.parse(sessionStorage.getItem("loginUser")).personName;
    const form = reactive({
      old: "",
      new: "",
      desc: "好好学习，天天向上！",
    });
    const formRules = {
      old: [
        {required: true, message: "请输入密码", trigger: "blur"},
      ],
      new: [
        {required: true, message: "请输入密码", trigger: "blur"},
        {pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[^]{8,16}', message: '新密码不符合规则要求'}
      ],
    };
    const formRef=ref(null);
    const onSubmit = () => {
      formRef.value.validate(valid=>{
        if (valid) {
          if(form.old === JSON.parse(sessionStorage.getItem("loginUser")).password){
            service.post(`/api/user/repass/${form.new}`).then(res=>{
              sessionStorage.setItem("loginUser", JSON.stringify(res.obj));
              form.old="";
              form.new="";
            })
          }else{
            ElMessage.error("旧密码错误，不允许修改密码");
          }
        }
      })
    };

    const avatarImg = ref(avatar);

    return {
      name,
      form,
      avatarImg,
      formRules,
      formRef,
      onSubmit,
    };
  },
};
</script>

<style scoped>
.info {
  text-align: center;
  padding: 35px 0;
}

.info-image {
  position: relative;
  margin: auto;
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 50px;
  overflow: hidden;
}

.info-image img {
  width: 100%;
  height: 100%;
}

.info-name {
  margin: 15px 0 10px;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
}
</style>
