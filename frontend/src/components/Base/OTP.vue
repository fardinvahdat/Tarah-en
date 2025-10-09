<template>
    <div class="!gap-4 p-5">
        <div class="h-32 flex items-center justify-center">
            <img src="/logo.png" class="w-32 h-full rounded-md mx-auto" />
        </div>
        <form class="flex flex-col gap-8" @submit.prevent="handleLogin">
            <h2 class="font-bold text-2xl">ورود</h2>
            <div>
                <label class="text-sm text-gray-b4">لطفا شماره موبایل خود را وارد کنید</label>
                <input v-model="number" type="tel" placeholder="مثلا: ۰۹۱۲۱۲۳۴۵۶۷" @input="isInputValid"
                    class="w-full py-[10px] px-3 mt-1 placeholder:text-right ltr text-left rounded-md border-[1px] outline-none focus:border-black text-base" />
                <p class="text-xs text-red-600" v-if="errorMessageNumber">{{ errorMessageNumber }}</p>
            </div>
            <Button :disabled="isLoading" type="submit" class=" w-full">
                {{ !isLoading ? 'ادامه' : 'منتظر بمانید...' }}
            </Button>
        </form>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store'
import Button from "./Button"

const { handleLogin: loginHandler, handleRequestOTP } = useAuthStore()
const { currentLoginStep } = storeToRefs(useAuthStore())
const number = ref(null)
const errorMessageNumber = ref('')
const isLoading = ref(false)


onMounted(() => {
    const userData = sessionStorage.getItem('user');
    if (JSON.parse(userData)?.number) {
        number.value = JSON.parse(userData).number
    }
})

const isInputValid = () => {
    if (!number.value) {
        errorMessageNumber.value = 'وارد کردن شماره الزامیست.'
        return false
    } else if (!(number.value + '').startsWith('09')) {
        errorMessageNumber.value = "شماره وارد شده معتبر نمی باشد(شماره وارد شده باید با ۰۹ شروع شود)"
        return false
    } else if ((number.value + '').length !== 11) {
        errorMessageNumber.value = "شماره وارد شده معتبر نمی باشد."
        return false
    } else {
        errorMessageNumber.value = ''
        return true
    }
}
const handleLogin = async () => {
    if (!isInputValid()) return
    isLoading.value = true

    //fetch api
    try {
        await handleRequestOTP({
            mobile: number.value
        })
        ElMessage({
            message: "کد ورود 123456 می باشد",
            // message: response.message,
            type: 'success',
        })
        const user = {
            number: number.value,
            expired_at: Date.now() + (1000 * 300)
        }
        sessionStorage.setItem('user', JSON.stringify(user));
        currentLoginStep.value = 2

    } catch (err) {
        console.log('error', err)
        ElMessage({
            message: "ورود ناموفق بود",
            type: 'error',
        })
    } finally {
        isLoading.value = false
    }
}

</script>