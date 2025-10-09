<template>
  <el-dialog v-model="dialogVisible" title="" :width="dialogWidth" class="login-dialog" :before-close="closeLogin">
    <el-row>
      <el-row class="text-[20px] text-[#222529] font-semibold leading-snug justify-center">
        {{loginInfo}} ورود
      </el-row>
      <el-row class="text-[12px] mt-[10px] justify-center">
        این فقط برای شناسایی هویت استفاده می شود. ما هیچ یک از اطلاعات خصوصی شما را به دست نخواهیم آورد.
      </el-row>
      <el-row v-if="loginType === 1">
        <div
          class="overflow-hidden relative mt-[20px] mx-auto p-[10px] border border-solid border-[rgba(0, 0, 0, .08)] rounded-[8px] justify-center">
          <div class="w-[150px] h-[150px] ">
            <el-image :src="qrcode" v-loading="!qrcode" class="w-full h-full"></el-image>
          </div>
        </div>
      </el-row>
      <el-row v-if="loginType === 2" class="content-center">
        <el-row class="h-[170px] mx-auto mt-[20px] content-center">
          <el-form ref="loginFormRef" :model="ruleForm" :rules="rules" class="w-[235px]">
            <el-form-item prop="email">
              <el-input type="email" autocomplete="off" :prefix-icon="Message" v-model="ruleForm.email" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input type="password" autocomplete="off" :prefix-icon="Lock" v-model="ruleForm.password"
                show-password />
            </el-form-item>
            <el-form-item v-if="checkType === 1" class="captcha">
              <el-input style="width: 120px;" v-model="ruleForm.captcha" />
              <div class="w-[90px] h-full captcha-image" @click="getOauthCaptcha">
                <img :src="loginCaptchaImage" alt="" v-loading="loginCaptchaLoading">
              </div>
            </el-form-item>
            <el-form-item v-if="checkType === 2" class="captcha">
              <el-input style="width: 120px;" v-model="ruleForm.captcha" />
              <el-button @click="getEmailCaptcha">دریافت کد تایید</el-button>
            </el-form-item>
          </el-form>
        </el-row>
        <el-row class="content-center">
          <el-button class="w-[230px]" type="primary" @click="handleVerify">{{ checkType === 1 ? 'Log in' : 'register'
            }}</el-button>
        </el-row>
        <el-row class="content-center mt-[5px] text-[12px]">
          <span v-if="checkType === 1">حسابی ندارید؟ کلیک کنید<a href="javascript:;" class="text-[#1e2ad7] font-[800]"
              @click="changeCheckType(2)">ثبت حساب</a></span>
          <span v-if="checkType === 2">قبلاً یک حساب کاربری دارید!<a href="javascript:;"
              class="text-[#1e2ad7] font-[800]" @click="changeCheckType(1)">اکنون وارد شوید</a></span>
        </el-row>
      </el-row>
    </el-row>
    <template #footer>
      <el-row class="justify-center text-[12px] text-[#9da3ac]">
        با ورود به سیستم، با <strong><a href="" class="hover:text-blue-700">قرارداد سرویس کاربر</a></strong>》 موافقت می
        کنید.
      </el-row>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { oauthWechat, oauthTokenGithub } from '@/api/oauth'
import { UserResult } from '@/api/oauth/types'
import { isMobile } from '@/utils/common'
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store';
import { localStorage } from '@/utils/storage';
import { Lock, User, Message } from '@element-plus/icons-vue'
import { OauthVerifyData } from '@/api/oauth/types';
import { imageCaptcha, emailCaptcha, oauthRegister, oauthLogin } from '@/api/oauth';
import { ElMessage, type FormRules } from 'element-plus'

const dialogVisible = ref(false)
const dialogWidth = computed(() => isMobile() ? '75%' : '35%')
const qrcode = ref('')
const checkType = ref(1)
const loginType = ref(2)
const loginInfo = ref('user')
const loginCaptchaImage = ref('')
const loginCaptchaLoading = ref(false)
const { loginStatus, username } = storeToRefs(useUserStore())
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const ruleForm = reactive<OauthVerifyData>({
  email: '',
  password: '',
  captcha: '',
})

const rules = reactive<FormRules<OauthVerifyData>>({
  email: [
    {
      required: true,
      message: 'لطفا آدرس ایمیل خود را وارد کنید',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: 'لطفا رمز عبور خود را وارد کنید',
      trigger: 'blur',
    },
  ],
  captcha: [
    {
      required: true,
      message: 'لطفا کد تایید را وارد کنید',
      trigger: 'blur',
    },
  ],
})

const emit = defineEmits<{
  (event: 'close', payload: boolean): void
}>()

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    getOauthCaptcha()
  }
})

const closeLogin = () => {
  emit('close', false)
  qrcode.value = ''
}

const changeCheckType = (val: number) => {
  checkType.value = val
}

const getOauthWechat = async () => {
  const result = await oauthWechat()
  if (result.data.code === 200) {
    qrcode.value = result.data.data.img
  }
}

const getOauthCaptcha = async () => {
  loginCaptchaLoading.value = true
  const result = await imageCaptcha()
  if (result.data.code === 200) {
    loginCaptchaImage.value = 'data:image/png;base64,' + result.data.data.image
    loginCaptchaLoading.value = false
  }
}

const getEmailCaptcha = async () => {
  if (!ruleForm.email) return
  const result = await emailCaptcha({email: ruleForm.email})
  if (result && result.data) {
    ElMessage.success(result.data.data.msg)
  }
}

const handleVerify = () => {
  if (checkType.value === 1) {
    handleLogin()
  } 
  else {
    handleRegister()
  }
}

const handleRegister = async () => {
  const result = await oauthRegister(ruleForm)
  if (result.data.code === 200 && result.data.data.code) {
    ElMessage.success('Successful registration')
    const code = result.data.data.code
    await handleLogin(code)
  }
}

const handleLogin = async (code?: string) => {
  if (code) ruleForm.captcha = code
  const result = await oauthLogin(ruleForm)
  if (result.data.code === 200) {
    loginStatus.value = true
    const userResult = result.data.data
    localStorage.set('access_token', userResult.access_token)
    username.value = userResult.user.username
    emit('close', false)
    ElMessage.success('Login successful')
  }
}

const loginGithub = async () => {
  const res = await oauthTokenGithub()
  if (res.data && res.data.code === 200) {
    const oauthWindow = window.open(res.data.data, '_blank', 'width=600,height=400,menubar=no,toolbar=no,location=no')
    window.addEventListener('message', (event: any) => {
      if (event.origin === window.location.origin) {
        loginStatus.value = true
        const userResult = event.data as UserResult
        localStorage.set('access_token', userResult.access_token)
        username.value = userResult.user.username
        oauthWindow?.close()
        emit('close', false)
      }
    });
  }
}

const loginQQ = () => {
  loginType.value = 1
  loginInfo.value = 'WeChat'
}

const loginEmail = () => {
  loginType.value = 2
  loginInfo.value = 'user'
  getOauthCaptcha()
}

// onMounted(() => {
//   getOauthCaptcha()
// })

</script>

<style lang="scss" scoped>
.h-full {
  height: 100%;
}
.content-center {
  justify-content: center
}
.captcha-image {
  cursor: pointer;
  outline: 1px solid $borderColor
}
</style>
<style>
.login-dialog .el-dialog__header {
  text-align: left
}
.login-dialog .el-upload__tip {
  text-align: left;
}
.login-dialog .el-upload-list__item-name {
  padding: 0;
}
.login-dialog .el-upload-list__item-info {
  width: 100%;
  margin-left: 0;
}
.captcha .el-form-item__content {
  justify-content: space-between;
}
</style>