import axios from 'axios';
import {ElMessage} from "element-plus";

const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    // baseURL: 'https://www.easy-mock.com/mock/592501a391470c0ac1fab128',
    timeout: 5000
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            let data = response.data;
            if (data.status === 200) {
                if (data.msg !== '' && data.msg !== undefined) {
                    ElMessage.success(data.msg);
                }
            } else {
                // 业务报错
                ElMessage.error(data.msg);
            }
            return data;
        } else {
            Promise.reject();
        }
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

export default service;
