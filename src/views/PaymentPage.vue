<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import PaymentHead from "@/components/payment/PaymentHead.vue";
import type { OrdersBusinessVO } from "@/type/ordersBusinessVO.ts";
import type { OrdersFoodVO } from "@/type/ordersFoodVO.ts";
import axios from "axios";
import { ElMessage } from "element-plus";

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

const selectedPayment = ref<'ALiPay' | 'WeChatPay' | null>('ALiPay');

const togglePayment = (payment: 'ALiPay' | 'WeChatPay') => {
  if (selectedPayment.value === payment) {
    selectedPayment.value = null;
  } else {
    selectedPayment.value = payment;
  }
};

const isFoodListVisible = ref(false);

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
      ElMessage.error('获取商家信息失败');
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
      ElMessage.error('获取食物信息失败');
    }
  } catch (error) {
    console.error('获取订单数据失败:', error);
    ElMessage.error('获取订单数据失败');
    businessInfo.value = null;
    foodInfo.value = [];
  }
}

const payment = async () => {
  if (!selectedPayment.value) {
    ElMessage.warning('请选择支付方式');
    return;
  }

  try {
    const { token, id } = getTokenAndId();

    const response = await axios.post('/api/orders/payment', {
      userId: id,
      orderId: orderId.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (response.data && response.data.code === 200) {
      const isPay = response.data.data;
      if (isPay) {
        ElMessage.success("支付成功！");
        await router.push('/home');
      } else {
        ElMessage.error("支付失败，请稍后重试！");
      }
    } else {
      console.error('支付失败:', response.data?.message || '未知错误');
      ElMessage.error("支付失败，请稍后重试！");
    }
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error("支付失败，请稍后重试！");
  }
}

onMounted(() => {
  fetchOrderData();
});
</script>

<template>
  <PaymentHead/>

  <h3 class="mt-[12vw] mb-0 px-[4vw] pt-[4vw] text-[4vw] font-light text-[#777]">
    订单信息：
  </h3>

  <div v-if="businessInfo" class="flex justify-between items-center p-[4vw] text-[#666] text-[4.5vw]">
    <span class="flex">
      {{ businessInfo.businessName }}
      <i-octicon-triangle-down-24
          v-if="!isFoodListVisible"
          @click="isFoodListVisible = !isFoodListVisible"
          class="ml-[1vw] mt-[0.5vw] align-center cursor-pointer"
      />
      <i-octicon-triangle-up-24
          v-else
          @click="isFoodListVisible = !isFoodListVisible"
          class="ml-[1vw] mt-[0.5vw] align-center cursor-pointer"
      />
    </span>
    <span class="text-[orangered]">¥ {{ businessInfo.totalPrice }}</span>
  </div>
  <div class="w-full" v-show="isFoodListVisible">
    <div v-for="(food, index) in foodInfo" :key="index" class="flex justify-between items-center px-[4vw] py-[1vw]">
      <span class="text-[3.5vw] text-[#666]">{{ food.foodName }} x {{ food.quantity }}</span>
      <span class="text-[3.5vw] text-[#666]">¥ {{ food.foodPrice * food.quantity }}</span>
    </div>
    <!-- 配送费 -->
    <div v-if="businessInfo" class="flex justify-between items-center px-[4vw] py-[1vw]">
      <span class="text-[3.5vw] text-[#666]">配送费</span>
      <span class="text-[3.5vw] text-[#666]">¥ {{ businessInfo.deliveryPrice }}</span>
    </div>
  </div>

  <div class="w-full">
    <div class="flex flex-col w-full">
      <div
          class="flex justify-between items-center px-[4vw] py-[4vw] pb-[1vw]"
          @click="togglePayment('ALiPay')"
      >
        <img src="/img/alipay.png" alt="支付宝" class="w-[33vw] h-[8.6vw]" />
        <i-material-symbols-check-circle
            class="text-[5vw]"
            :class="{'text-[#38CA73]': selectedPayment === 'ALiPay', 'text-[#ccc]': selectedPayment !== 'ALiPay'}"
        />
      </div>
      <div
          class="flex justify-between items-center px-[4vw] py-[4vw] pb-[1vw]"
          @click="togglePayment('WeChatPay')"
      >
        <img src="/img/wechat.png" alt="微信支付" class="w-[33vw] h-[8.6vw]" />
        <i-material-symbols-check-circle
            class="text-[5vw]"
            :class="{'text-[#38CA73]': selectedPayment === 'WeChatPay', 'text-[#ccc]': selectedPayment !== 'WeChatPay'}"
        />
      </div>
    </div>

    <div class="w-full px-[4vw] pb-[14vw] pt-[3vw] flex justify-center items-center">
      <el-button @click="payment" type="success" class="w-[95vw]">
        确认支付
      </el-button>
    </div>
  </div>
</template>

<style scoped>

</style>