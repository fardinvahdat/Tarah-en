<template>
  <div>
    <el-tour v-model="open" @close="closeTour()" @finish="closeTour()">
      <el-tour-step target=".left-top-tabs" title="">
        <div>
          به سرعت طرح ها را ایجاد کنید، فایل ها را آپلود کنید و از خطوط مرجع
          برای موقعیت دقیق آنها استفاده کنید!
        </div>
      </el-tour-step>
      <el-tour-step
        target="#left-tabs-editor"
        title="Edit"
        description="داستان های گرافیکی خود را ایجاد کنید، به راحتی ویرایش کنید، از رابط عملیات بصری اطلاعات مختلف لذت ببرید، و اجازه دهید خلاقیت شما آزادانه جریان یابد!"
      />
      <el-tour-step
        target="#left-tabs-template"
        title="Template"
        description="الگوهای پیشنهادی را کاوش کنید، الگوهای من و میراث تیم را ادغام کنید، مرزهای خلاقانه را گسترش دهید، و آثار برجسته را با هم خلق کنید."
      />
      <el-tour-step
        target="#left-tabs-material"
        title="Material"
        description="مطالب توصیه شده را کشف کنید، مجموعه من را مدیریت کنید، خریدهای من را بررسی کنید، همه در یک مکان، و خلاقیت خود را بی نهایت گسترش دهید."
      />
      <el-tour-step
        target="#left-tabs-text"
        title="Text"
        description="ترکیبات افقی و عمودی، خالی کردن بدیع، و ایجاد هنر حروفچینی متن."
      />
      <el-tour-step
        target="#left-tabs-image"
        title="Image"
        description="تصاویر مورد علاقه خود را آپلود کنید، توصیه های ویژه را کاوش کنید، مجموعه من را سازماندهی کنید، و تمام تصاویر زیبا را در دسترس خود نگه دارید."
      />
      <el-tour-step
        target="#left-tabs-toolkit"
        title="Tool"
        description="بارکدها و کدهای QR، فناوری برش هوشمند هوش مصنوعی را به سرعت تولید کنید، کارایی را بهبود بخشید و انتخاب هوشمندانه را تجربه کنید."
      />
      <el-tour-step
        target="#left-tabs-layer"
        title="Layer"
        description="برای مرتب کردن، نمایش یا پنهان کردن عناصر با یک کلیک بکشید. به راحتی لایه ها را قفل و باز کنید، خلاقیت نامحدود، به دلخواه حذف کنید و روند Tarahی خود را کنترل کنید."
      />
      <el-tour-step
        target="#left-tabs-help"
        title="Help"
        description="مشکل دارید؟ از مرکز راهنمایی دیدن کنید! راهنماها، آموزش‌ها و میانبرهای مبتدی به شما کمک می‌کنند تا کارایی را بهبود ببخشید، بازخورد فوری دریافت کنید و پاسخ‌های بی‌درنگ از خدمات مشتریان آنلاین دریافت کنید."
      />
    </el-tour>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { localStorage } from "@/utils/storage";

const open = ref(localStorage.get("EDITOR_TOUR") ?? true);
const closeTour = () => {
  open.value = false;
  localStorage.set("EDITOR_TOUR", false);
};
</script>

<style lang="scss" scoped></style>
