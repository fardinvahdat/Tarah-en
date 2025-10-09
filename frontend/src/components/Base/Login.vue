<template>
    <div class="!gap-4 flex flex-col p-5">
        <div class="h-32 flex items-center justify-center">
            <img src="/logo.png" class="w-32 mx-auto h-full rounded-md " />
        </div>
        <form class="flex flex-col gap-8 w-full" @submit.prevent="handleCheckOTP">
            <h2 class="font-bold text-2xl">کد تایید را وارد کنید</h2>
            <div class="flex flex-col gap-8">
                <p class="text-sm text-gray-b2">برای ساخت حساب جدید، کد پیامک‌ شده به شمارۀ «{{ number }}» را
                    وارد کنید. <button @click="currentLoginStep = 1" class="text-primary-b1 font-bold">تغییر
                        شماره</button>
                </p>
                <OtpInput v-model="otp" :length="6" @complete="handleOtpComplete" />
            </div>
            <button
                class="flex justify-center items-center gap-1 text-sm text-gray-b1 cursor-pointer disabled:text-gray-b5 disabled:cursor-wait"
                :disabled="!isResendAllowed" type="button" @click="handleSendCode()">
                <template v-if="!isResendAllowed">
                    <el-countdown format="mm:ss" :value="expired_at" />
                    <p class="text-[12px]">مانده تا دریافت مجدد کد</p>
                </template>
                <template v-else>
                    <p v-if="!isResendCodeLoading">دریافت مجدد کد</p>
                    <Loading class="py-2" v-else />
                </template>
            </button>
            <Button :disabled="isLoading || ('' + otp).length !== 6" class="min-h-12">
                {{ !isLoading ? 'تایید' : 'منتظر بمانید...' }}
            </Button>
        </form>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ElNotification } from 'element-plus'
import { useAuthStore } from '@/store'
import Button from "./Button"
import OtpInput from "./OtpInput"
import Loading from "./Loading"


const { handleLogin: loginHandler, handleRequestOTP, getUser } = useAuthStore()
const { currentLoginStep, isLoginDialogVisible } = storeToRefs(useAuthStore())

const number = ref('')
const otp = ref('');
const isLoading = ref(false)
const isResendCodeLoading = ref(false)
// const token = useCookie('token')
const remainingTimeToResend = ref(Date.now() + 1000 * 60)
const isResendAllowed = ref(true)
const expired_at = ref('')

onMounted(() => {
    const userData = sessionStorage.getItem('user');
    if (JSON.parse(userData)?.number) {
        number.value = JSON.parse(userData).number
        expired_at.value = (JSON.parse(userData).expired_at)
        expired_at.value > new Date() ? (isResendAllowed.value = false, setTimeout(() => {
            isResendAllowed.value = true
        }, expired_at.value - new Date())) : isResendAllowed.value = true
    } else {
        currentLoginStep.value = 1
    }
})

const handleOtpComplete = async (value) => {
    otp.value = value
    handleCheckOTP()
};

const handleCheckOTP = async () => {
    isLoading.value = true
    try {
        const response = await loginHandler({
            mobile: number.value,
            code: otp.value,
        })

        // Handle the response
        ElMessage({
            message: "با موفقیت وارد شدید",
            type: 'success',
        })
        await getUser()
        sessionStorage.setItem('user', null);
        isLoginDialogVisible.value = false

    } catch (err) {
        ElMessage({
            message: ' ورود با خطا مواجه شد',
            type: 'error',
        })
        console.log(err)
    } finally {
        isLoading.value = false
    }
}


const handleSendCode = async () => {

    if (!isResendAllowed.value) return
    isResendCodeLoading.value = true

    //fetch api
    try {
        // Call the server API route
        const response = await handleRequestOTP({
            mobile: number.value,
        });

        // Handle the response
        console.log('Login response:', response);
        ElMessage({
            message: response.message,
            type: 'success',
        })
        const user = {
            number: number.value,
            expired_at: Date.now() + (1000 * 300)
        }
        sessionStorage.setItem('user', JSON.stringify(user));
        expired_at.value = Date.now() + (1000 * 300)
        isResendAllowed.value = false
        setTimeout(() => {
            isResendAllowed.value = true
        }, expired_at.value - new Date());
    } catch (err) {
        ElMessage({
            message: 'ناموفق',
            type: 'error',
        })
    } finally {
        isResendCodeLoading.value = false
    }
}
</script>
<style>
.el-statistic__content {
    color: inherit !important;
    font-size: 12px !important;
}
</style>