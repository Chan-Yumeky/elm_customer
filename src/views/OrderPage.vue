<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import axios from 'axios';
import OrderHeader from "@/components/order/OrderHeader.vue";
import OrderAddress from "@/components/order/OrderAddress.vue";
import type { OrdersFoodVO } from "@/type/ordersFoodVO.ts";
import type { OrdersBusinessVO } from "@/type/ordersBusinessVO.ts";

const route = useRoute();
const router = useRouter();

const orderId = ref<number>(Number(route.query.orderId));

// 安全获取 token 和 id
function getTokenAndId() {
  const str = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
  if (!str) throw new Error('未找到访问令牌！');
  const parsed = JSON.parse(str);
  if (!parsed.token) throw new Error('未找到 token！');
  if (!parsed.id) throw new Error('未找到用户ID！');
  return { token: parsed.token as string, id: Number(parsed.id) };
}

const { id } = getTokenAndId();

const selectedDaId = ref<number | null>(null);

const handleDaIdChange = async (daId: number | null) => {
  selectedDaId.value = daId;
  try {
    const { token } = getTokenAndId();
    await axios.post('/api/orders/update-address', {
      orderId: orderId.value,
      daId: selectedDaId.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
  } catch (error) {
    console.error('更新地址失败:', error);
  }
};

const businessInfo = ref<OrdersBusinessVO | null>(null);
const foodInfo = ref<OrdersFoodVO[]>([]);

const fetchOrderData = async () => {
  try {
    const { token } = getTokenAndId();
    // 获取商家信息
    const businessResponse = await axios.get('/api/orders/get-business-info', {
      params: {
        orderId: orderId.value
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (businessResponse.data && businessResponse.data.code === 200) {
      businessInfo.value = businessResponse.data.data;
    } else {
      businessInfo.value = null;
      console.error('获取商家信息失败:', businessResponse.data?.message || '未知错误');
    }

    // 获取食物信息
    const foodResponse = await axios.get('/api/orders/get-food-info', {
      params: {
        orderId: orderId.value
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (foodResponse.data && foodResponse.data.code === 200) {
      foodInfo.value = foodResponse.data.data;
    } else {
      foodInfo.value = [];
      console.error('获取食物信息失败:', foodResponse.data?.message || '未知错误');
    }
  } catch (error) {
    console.error('获取订单数据失败:', error);
  }
};

const NavigateToPayment = () => {
  router.push({ name: 'payment', query: { orderId: orderId.value } });
};

onMounted(() => {
  fetchOrderData();
});
</script>

<template>
  <OrderHeader/>
  <OrderAddress :userId="id" @update-daId="handleDaIdChange" />

  <template v-if="businessInfo">
    <h3 class="m-0 box-border p-[3vw] text-[5vw] text-[#666] border-b border-[#DDD] font-bold">
      {{ businessInfo.businessName }}
    </h3>

    <div class="w-full">
      <div v-for="(food, index) in foodInfo" :key="index" class="w-full h-[16vw] p-[3vw] text-[#666] flex justify-between items-center">
        <div class="flex items-center">
          <img :src="food.foodImg || '/img/sp01.png'" alt="" class="w-[10vw] h-[10vw]" />
          <span class="text-[4vw] ml-[3vw]">{{ food.foodName }} x {{ food.quantity }}</span>
        </div>
        <span class="text-[4vw]">&#165;{{ food.foodPrice }}</span>
      </div>
    </div>

    <div class="w-full h-[16vw] p-[3vw] text-[#666] flex justify-between items-center text-[4vw] mb-[14vw]">
      <span>配送费</span>
      <span>¥ {{ businessInfo.deliveryPrice }}</span>
    </div>

    <div class="w-full h-[14vw] fixed bottom-0 left-0 flex">
      <div class="w-[66%] bg-[#505051] text-white text-[4.5vw] font-bold flex justify-center items-center">
        &#165; {{ businessInfo.totalPrice }}
      </div>
      <div @click="NavigateToPayment"
           class="w-[34%] bg-[#38CA73] text-white text-[4.5vw] font-bold flex justify-center items-center cursor-pointer">
        去支付
      </div>
    </div>
  </template>
</template>

<style scoped>

</style>