<template>
    <div class="otp-input max-w-full justify-between">
        <input v-for="(digit, index) in length" :key="index" :id="index == 0 && 'first_otp'"
            :ref="(el) => (inputs[index] = el)" v-model="otp[index]" type="tel" maxlength="1"
            :class="['otp-input__field ', index, { 'has-error': hasError }]" @input="handleInput(index, $event)"
            @keydown.delete="handleDelete(index, $event)" @paste="handlePaste" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    length: {
        type: Number,
        default: 6, // Default OTP length
    },
    hasError: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'complete']);

const otp = ref(Array(props.length).fill(''));
const inputs = ref([]);

// Watch for changes in the OTP and emit the value
watch(
    otp,
    (newOtp) => {
        const otpValue = newOtp.join('');
        emit('update:modelValue', otpValue);
        if (otpValue.length === props.length) {
            emit('complete', otpValue);
        }
    },
    { deep: true }
);

// Handle input in each field
const handleInput = (index, event) => {
    const value = event.target.value;
    if (/^\d+$/.test(value)) {
        otp.value[index] = value;
        if (index < props.length - 1) {
            inputs.value[index + 1].focus();
        }
    } else {
        otp.value[index] = '';
    }
};

// Handle backspace/delete key
const handleDelete = (index, event) => {
    if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
        inputs.value[index - 1].focus();
    }
};

// Handle paste event
const handlePaste = (event) => {
    // event.preventDefault();
    // const pasteData = event.clipboardData.getData('text').slice(0, props.length);
    // if (/^\d+$/.test(pasteData)) {
    //     pasteData.split('').forEach((char, i) => {
    //         if (i < props.length) {
    //             otp.value[i] = char;
    //         }
    //     });
    //     if (pasteData.length === props.length) {
    //         emit('complete', pasteData);
    //     }
    // }
};

onMounted(() => {
    const el = document.getElementById('first_otp')
    el.focus()
})
</script>

<style scoped>
.otp-input {
    display: flex;
    flex-flow: row-reverse;
    gap: 8px;
}

.otp-input__field {
    min-width: 40px;
    height: 40px;
    text-align: center;
    font-size: 18px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
}

.otp-input__field:focus {
    border-color: #000;
}

.otp-input__field.has-error {
    border-color: #ff0000;
}
</style>