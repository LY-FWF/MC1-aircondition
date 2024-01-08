<script setup>
import { ref, inject, onMounted } from "vue";

const worker = inject("worker");

onMounted(() => {
  worker.onmessage = (event) => {
    const message = event.data;
    // 在这里处理接收到的消息
  };
});


</script>

<template>
  <div></div>
</template>

<style scoped></style>
