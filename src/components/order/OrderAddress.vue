<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import {ElMessage, ElMessageBox} from "element-plus";
import type {DeliveryAddressVO} from "@/type/deliveryAddressVO.ts";
import type {DeliveryAddressSaveRO} from "@/type/deliveryAddressSaveRO.ts";
import type {DeliveryAddressUpdateRO} from "@/type/deliveryAddressUpdateRO.ts";

const props = defineProps<{
  userId: number;
}>();

const emit = defineEmits<{
  (e: 'update-daId', daId: number | null): void;
}>();

// 安全获取 token 和 id
function getTokenAndId() {
  const str = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
  if (!str) throw new Error('未找到访问令牌！');
  const parsed = JSON.parse(str);
  if (!parsed.token) throw new Error('未找到 token！');
  if (!parsed.id) throw new Error('未找到用户ID！');
  return { token: parsed.token as string, id: Number(parsed.id) };
}

// 状态变量
const addresses = ref<DeliveryAddressVO[]>([]);
const selectedAddress = ref<DeliveryAddressVO | null>(null);
const dialogVisible = ref(false);
const addEditDialogVisible = ref(false);
const isEditing = ref(false);
const currentEditAddress = ref<DeliveryAddressVO | null>(null);

// 新增或编辑表单
const form = ref<{
  daId?: number;
  contactName: string;
  contactSex: number;
  contactTel: string;
  address: string;
}>({
  contactName: '',
  contactSex: 1,
  contactTel: '',
  address: '',
});

// 获取所有地址
const fetchAddresses = async () => {
  try {
    const { token } = getTokenAndId();
    const response = await axios.get('/api/deliveryAddress/get-all-address', {
      params: {
        userId: props.userId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 适配 RestBean 响应格式
    if (response.data && response.data.code === 200) {
      addresses.value = response.data.data;
      if (addresses.value.length > 0) {
        selectedAddress.value = addresses.value[0];
        emit('update-daId', selectedAddress.value.daId);
      } else {
        selectedAddress.value = null;
        emit('update-daId', null);
      }
    } else {
      addresses.value = [];
      selectedAddress.value = null;
      emit('update-daId', null);
      console.error('获取地址列表失败:', response.data?.message || '未知错误');
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
    addresses.value = [];
    selectedAddress.value = null;
    emit('update-daId', null);
  }
};

// 打开地址列表对话框
const openDialog = () => {
  dialogVisible.value = true;
};

// 关闭地址列表对话框
const closeDialog = () => {
  dialogVisible.value = false;
};

// 选择地址
const selectAddress = (address: DeliveryAddressVO) => {
  selectedAddress.value = address;
  emit('update-daId', address.daId);
  closeDialog();
};

// 打开新增地址对话框
const openAddDialog = () => {
  isEditing.value = false;
  form.value = {
    contactName: '',
    contactSex: 1,
    contactTel: '',
    address: '',
  };
  addEditDialogVisible.value = true;
};

// 打开编辑地址对话框
const openEditDialog = (address: DeliveryAddressVO) => {
  isEditing.value = true;
  currentEditAddress.value = address;
  form.value = {
    daId: address.daId,
    contactName: address.contactName,
    contactSex: address.contactSex,
    contactTel: address.contactTel,
    address: address.address,
  };
  addEditDialogVisible.value = true;
};

// 删除地址
const deleteAddress = async (daId: number) => {
  try {
    const { token } = getTokenAndId();
    const response = await axios.post('/api/deliveryAddress/remove-address', null, {
      params: {
        daId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 检查响应状态
    if (response.data && response.data.code === 200) {
      await fetchAddresses();
      if (selectedAddress.value?.daId === daId) {
        if (addresses.value.length > 0) {
          selectedAddress.value = addresses.value[0];
          emit('update-daId', selectedAddress.value.daId);
        } else {
          selectedAddress.value = null;
          emit('update-daId', null);
        }
      }
      ElMessage.success('地址删除成功');
    } else {
      console.error('删除地址失败:', response.data?.message || '未知错误');
      ElMessage.error('删除地址失败');
    }
  } catch (error) {
    console.error('删除地址失败:', error);
    ElMessage.error('删除地址失败');
  }
};

// 提交新增或编辑表单
const submitForm = async () => {
  if (!form.value.contactName || !form.value.contactTel || !form.value.address) {
    ElMessage.error('请填写完整的地址信息');
    return;
  }

  try {
    const { token } = getTokenAndId();

    if (isEditing.value && form.value.daId !== undefined) {
      const updateRO: DeliveryAddressUpdateRO = {
        daId: form.value.daId,
        contactName: form.value.contactName,
        contactSex: form.value.contactSex,
        contactTel: form.value.contactTel,
        address: form.value.address,
        userId: props.userId,
      };

      const response = await axios.post('/api/deliveryAddress/update-address', updateRO, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.code === 200) {
        await fetchAddresses();
        addEditDialogVisible.value = false;
        ElMessage.success('地址更新成功');
      } else {
        console.error('更新地址失败:', response.data?.message || '未知错误');
        ElMessage.error('更新地址失败');
      }
    } else {
      const saveRO: DeliveryAddressSaveRO = {
        contactName: form.value.contactName,
        contactSex: form.value.contactSex,
        contactTel: form.value.contactTel,
        address: form.value.address,
        userId: props.userId,
      };

      const response = await axios.post('/api/deliveryAddress/save-address', saveRO, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.code === 200) {
        await fetchAddresses();
        addEditDialogVisible.value = false;
        ElMessage.success('地址保存成功');
      } else {
        console.error('保存地址失败:', response.data?.message || '未知错误');
        ElMessage.error('保存地址失败');
      }
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 关闭新增/编辑对话框
const closeAddEditDialog = () => {
  addEditDialogVisible.value = false;
};

// 处理删除操作的确认
const confirmDelete = (daId: number) => {
  ElMessageBox.confirm('确定删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        deleteAddress(daId);
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消删除',
        });
      });
};

onMounted(() => {
  fetchAddresses();
});
</script>

<template>
  <div class="w-full mt-[12vw] bg-[#0097FF] p-[3vw] text-white">
    <h5 class="text-[3.5vw] font-light m-0">订单配送至：</h5>

    <div
        class="w-full flex justify-between items-center font-bold cursor-pointer user-select-none my-[1vw]"
        @click="openDialog"
    >
      <div class="w-[90%] text-[5vw]">
        <div v-if="selectedAddress">
          <div class="mb-1">
            {{ selectedAddress.address }}
          </div>
          <div class="text-[4vw] font-normal">
            {{ selectedAddress.contactName }}{{ selectedAddress.contactSex === 1 ? '先生' : '女士' }} {{ selectedAddress.contactTel }}
          </div>
        </div>
        <span v-else>暂无信息，请先添加地址</span>
      </div>
      <i-material-symbols-chevron-right class="text-[5vw] font-bold"/>
    </div>
  </div>

  <!-- 地址列表对话框 -->
  <div v-if="dialogVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white w-11/12 max-w-lg p-4 rounded shadow-lg relative">
      <h3 class="text-xl font-semibold mb-4">选择配送地址</h3>
      <div v-if="addresses.length > 0" class="max-h-80 overflow-y-auto">
        <div
            v-for="address in addresses"
            :key="address.daId"
            class="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-100"
            @click="selectAddress(address)"
        >
          <div>
            <div class="font-bold text-3.5">
              {{ address.contactName }}{{ address.contactSex === 1 ? '先生' : '女士' }} {{ address.contactTel }}
            </div>
            <div class="text-sm text-1 text-gray-600">{{ address.address }}</div>
          </div>
          <div class="flex space-x-2">
            <el-button
                type="warning" size="small"
                @click.stop="openEditDialog(address)"
            >
              修改
            </el-button>
            <el-button
                type="danger" size="small"
                @click.stop="confirmDelete(address.daId)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500">暂无信息，请先添加地址</div>
      <el-button type="primary"
          class="mt-4 w-full bg-blue-500 text-white py-2 rounded"
          @click="openAddDialog"
      >
        新增地址
      </el-button>
      <button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          @click="closeDialog"
      >
        ×
      </button>
    </div>
  </div>

  <!-- 新增/编辑地址对话框 -->
  <div v-if="addEditDialogVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white w-11/12 max-w-md p-4 rounded shadow-lg relative">
      <h3 class="text-xl font-semibold mb-4">{{ isEditing ? '编辑地址' : '新增地址' }}</h3>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1">联系人姓名</label>
          <el-input
              v-model="form.contactName"
              placeholder="请输入联系人姓名"
              size="default"
              class="w-full border rounded"
              required
          />
        </div>
        <div>
          <label class="block mb-1">联系人性别</label>
          <el-select
              v-model.number="form.contactSex"
              placeholder="请选择"
              size="default"
              class="w-full"
              popper-style="width: 80px;"
              required
          >
            <el-option label="先生" :value="1" />
            <el-option label="女士" :value="0" />
          </el-select>
        </div>
        <div>
          <label class="mb-1">联系电话</label>
          <el-input
              type="number"
              v-model="form.contactTel"
              placeholder="请输入联系电话"
              size="default"
              class="w-full border rounded"
              required
          />
        </div>
        <div>
          <label class="block mb-1">详细地址</label>
          <el-input
              type="textarea"
              v-model="form.address"
              placeholder="请输入详细地址"
              size="default"
              class="w-full border rounded"
              required
          />
        </div>
        <div class="flex justify-end space-x-2">
          <el-button
              type="info"
              size="small"
              class="px-4 py-2"
              @click="closeAddEditDialog"
          >
            取消
          </el-button>
          <el-button
              type="primary"
              size="small"
              class="px-4 py-2"
              native-type="submit"
          >
            {{ isEditing ? '保存修改' : '新增地址' }}
          </el-button>
        </div>
      </form>
      <el-button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          @click="closeAddEditDialog"
          type="text"
          icon="el-icon-close"
      />
    </div>
  </div>
</template>

<style scoped>

</style>