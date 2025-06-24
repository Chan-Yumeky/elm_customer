<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import router from "@/router/index.ts";
import axios from 'axios';

const cartStore = useCartStore();

const props = defineProps<{
  businessId: number;
}>();

const cartQuantity = computed(() => cartStore.totalQuantity);
const cartAmount = computed(() => cartStore.totalPrice);
const deliveryFee = ref<number>(0);

// 获取配送费
const fetchDeliveryFee = async () => {
  try {
    const tokenData = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
    if (!tokenData) throw new Error('未找到访问令牌！');
    const token = JSON.parse(tokenData).token;
    const response = await axios.get('/api/business/get-delivery-price', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { businessId: props.businessId }
    });
    if (response.data && response.data.code === 200) {
      deliveryFee.value = response.data.data;
    } else {
      deliveryFee.value = 0;
      console.error('获取配送费失败:', response.data?.message || '未知错误');
    }
  } catch (error) {
    console.error('获取配送费失败:', error);
    deliveryFee.value = 0;
  }
};

const buttonClass = computed(() => {
  return cartQuantity.value > 0
      ? 'bg-[#38CA73] cursor-pointer'
      : 'bg-[#D3D3D3] cursor-not-allowed';
});

// 创建订单并跳转
const NavigateToOrderPage = async () => {
  try {
    const tokenData = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
    if (!tokenData) throw new Error('未找到访问令牌！');
    const parsed = JSON.parse(tokenData);
    const token = parsed.token;
    const id = parsed.id;
    const response = await axios.post('/api/orders/create-orders', {
      userId: id,
      businessId: props.businessId,
      totalPrice: cartAmount.value + deliveryFee.value,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (response.data && response.data.code === 200) {
      const orderId = response.data.data;
      console.log("AAAAAA  " + orderId);
      await router.push({ name: 'order', query: { orderId: orderId } });
    } else {
      console.log(1);
      console.error('创建订单失败:', response.data?.message || '未知错误');
    }
  } catch (error) {
    console.log(2);
    console.error('创建订单失败:', error);
  }
}

onMounted(() => {
  fetchDeliveryFee();
  // 不需要再 fetchCartList，只要 FoodList.vue 里 fetch 过，Pinia 就有数据
});
</script>

<template>
  <div class="w-full h-[14vw] fixed bottom-0 left-0 flex">
    <div class="w-[66%] bg-[#505051] flex">
      <div
          class="w-[16vw] h-[16vw] border-[1.6vw] border-[#444] rounded-full bg-[#3190E8] flex justify-center items-center -mt-[4vw] ml-[3vw] relative">
        <i-material-symbols-shopping-cart class="text-[7vw] text-white"/>
        <div
            class="absolute top-[-1.5vw] right-[-1.5vw] w-[5vw] h-[5vw] rounded-full bg-red-500 text-white text-[3.6vw] flex justify-center items-center">
          {{ cartQuantity }}
        </div>
      </div>
      <div class="ml-[1vw] flex flex-col justify-center">
        <span class="text-white text-[5vw]">{{ '¥' + cartAmount }}</span>
        <span class="text-[#AAA] text-[3vw] mt-[0.5vw]">另需配送费¥{{ deliveryFee }}</span>
      </div>
    </div>
    <div class="w-[34%]">
      <div @click="NavigateToOrderPage"
           :class="buttonClass"
           class="w-full h-full text-white text-[4.5vw] font-bold flex justify-center items-center cursor-pointer">
        去结算
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>