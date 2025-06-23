<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { EditPen, Lock, Message } from "@element-plus/icons-vue";
import router from "@/router";
import { ElMessage } from "element-plus";
import { get, post } from "@/net/index.ts";

// 定义响应式数据
const active = ref<number>(0);
const formRef = ref<any>();  // formRef 类型可以进一步明确
const coldTime = ref<number>(0);

// 表单数据
const form = reactive({
  email: '',
  code: '',
  password: '',
  password_repeat: ''
});

// 密码验证函数，声明参数类型
const validatePassword = (rules: any, value: string, callback: (error?: Error) => void): void => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮件地址', trigger: 'blur' },
    { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入获取的验证码', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码的长度必须在6-20个字符之间', trigger: ['blur'] }
  ],
  password_repeat: [
    { validator: validatePassword, trigger: ['blur', 'change'] },
  ],
};

// 获取验证码
const askCode = () => {
  if (isEmailValid.value) {  // 计算属性的值
    coldTime.value = 60;
    get(`/auth/ask-code?email=${form.email}&type=reset`, () => {
      ElMessage.success(`验证码已发送到邮箱: ${form.email}，请注意查收`);
      const handle = setInterval(() => {
        coldTime.value--;
        if (coldTime.value === 0) {
          clearInterval(handle);
        }
      }, 1000);
    }, (message: string) => {
      ElMessage.warning(message);
      coldTime.value = 0;
    });
  } else {
    ElMessage.warning("请输入正确的电子邮件！");
  }
};

// 验证邮箱是否合法
const isEmailValid = computed(() => /^[\w.-]+@[\w.-]+\.\w+$/.test(form.email));

// 确认重置
const confirmReset = () => {
  formRef.value.validate((isValid: boolean) => {  // 为 isValid 添加类型声明
    if (isValid) {
      post('/auth/reset-confirm', {
        email: form.email,
        code: form.code
      }, () => active.value++);
    }
  });
};

// 重置密码
const doReset = () => {
  formRef.value.validate((isValid: boolean) => {  // 为 isValid 添加类型声明
    if (isValid) {
      post('/auth/reset-password', { ...form }, () => {
        ElMessage.success('密码重置成功，请重新登录');
        router.push('/login');
      });
    }
  });
};
</script>

<template>
  <div class="w-full h-full">
    <div class="flex justify-center items-center mt-[30%]">
      <img src="@/assets/elm.svg" class="w-[70%]" alt="">
    </div>
    <div class="mt-[10vw] ml-[6vw] mr-[6vw] text-center">
      <div class="mt-[1vw]">
        <el-steps :active="active" finish-status="success" align-center>
          <el-step title="验证电子邮件"/>
          <el-step title="重新设定密码"/>
        </el-steps>
      </div>
      <div v-if="active === 0" class="my-0 mx-2vw">
        <div class="mt-[5vw]">
          <div class="text-3xl font-semibold">重置密码</div>
          <div class="text-[1em] mt-[8px] text-gray-500">请输入需要重置密码的电子邮件地址</div>
        </div>
        <div class="mt-[5vw]">
          <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item prop="email">
              <el-input v-model="form.email" type="email" placeholder="电子邮件地址">
                <template #prefix>
                  <el-icon>
                    <Message/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <el-row :gutter="10" class="w-full">
                <el-col :span="16">
                  <el-input v-model="form.code" :maxlength="6" type="text" placeholder="请输入验证码">
                    <template #prefix>
                      <el-icon>
                        <EditPen/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="6">
                  <el-button @click="askCode" :disabled="!isEmailValid || coldTime > 0" type="success">
                    {{ coldTime > 0 ? `请稍后 ${coldTime} 秒` : '获取验证码' }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </div>
        <div class="my-[3vw]] mx-0">
          <el-button @click="confirmReset" type="warning" plain class="w-[80vw]">开始重置密码</el-button>
        </div>
      </div>
      <div v-if="active === 1" class="my-0 mx-2vw">
        <div class="mt-[5vw]">
          <div class="text-3xl font-semibold">重置密码</div>
          <div class="text-[1em] mt-[8px] text-gray-500">请填写你的新密码，并牢记防止丢失</div>
        </div>
        <div class="mt-[5vw]">
          <el-form :model="form" :rules="rules" ref="formRef">
            <el-form-item prop="password">
              <el-input v-model="form.password" maxlength="20" type="password" placeholder="密码">
                <template #prefix>
                  <el-icon>
                    <Lock/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password_repeat">
              <el-input v-model="form.password_repeat" maxlength="20" type="password" placeholder="重复密码">
                <template #prefix>
                  <el-icon>
                    <Lock/>
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="my-[3vw]] mx-0">
          <el-button @click="doReset" type="danger" plain class="w-[80vw]">立即重置密码</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>