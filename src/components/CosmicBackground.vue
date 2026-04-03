<template>
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0984E3] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-pulse-slow"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00CEC9] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-pulse-slow" style="animation-delay: 2s;"></div>

    <div class="stars-layer-1"></div>
    <div class="floating-dust"></div>

    <div class="background-stars absolute inset-0">
      <div v-for="star in staticStars" :key="star.id" class="star-static" :style="star.style"></div>
    </div>

    <div class="shooting-stars-canvas absolute inset-0">
      <div v-for="star in shootingStars" :key="star.id" class="star-shooting" :style="star.style"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const staticStars = ref([])
const shootingStars = ref([])
let shootingStarInterval = null

function generateStaticStars() {
  const starsCount = 200
  for (let i = 0; i < starsCount; i++) {
    staticStars.value.push({
      id: i,
      style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`, animationDuration: `${3 + Math.random() * 4}s`, animationDelay: `${Math.random() * 5}s` },
    })
  }
}

function generateShootingStar() {
  const id = Date.now()
  shootingStars.value.push({
    id,
    style: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${150 + Math.random() * 150}px`, '--angle': `${Math.random() * 360}deg`, animationDuration: `${0.5 + Math.random() * 1.5}s` },
  })
  setTimeout(() => { shootingStars.value = shootingStars.value.filter(star => star.id !== id) }, 2000)
}

function startShootingStars() {
  shootingStarInterval = setInterval(() => {
    generateShootingStar()
    if (Math.random() > 0.7) setTimeout(generateShootingStar, 300)
  }, 2000 + Math.random() * 2000)
}

onMounted(() => {
  generateStaticStars()
  startShootingStars()
})

onBeforeUnmount(() => {
  if (shootingStarInterval) clearInterval(shootingStarInterval)
})
</script>

<style scoped>
.floating-dust {
  position: absolute; inset: 0;
  background-image: radial-gradient(1.5px 1.5px at 25% 25%, #F5F6FA 100%, transparent),
                    radial-gradient(1px 1px at 75% 75%, #00CEC9 100%, transparent);
  background-size: 150px 150px;
  animation: float 25s linear infinite;
  opacity: 0.15;
}
@keyframes float {
  from { transform: translateY(0); }
  to { transform: translateY(-150px); }
}

.background-stars { z-index: 1; }
.star-static {
  position: absolute; background-color: #F5F6FA; border-radius: 50%; transform: translate(-50%, -50%);
  animation: staticStarTwinkle 5s infinite;
}
@keyframes staticStarTwinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

.shooting-stars-canvas { z-index: 2; }
.star-shooting {
  position: absolute; height: 2px; background: linear-gradient(90deg, transparent, #00CEC9, #F5F6FA);
  animation: shootingStarFall linear infinite; transform-origin: left;
}
@keyframes shootingStarFall {
  0% { opacity: 0; transform: rotate(var(--angle)) translateX(0) scaleX(0); }
  10% { opacity: 1; transform: rotate(var(--angle)) translateX(0) scaleX(1); }
  20% { opacity: 0.8; }
  30%, 100% { opacity: 0; transform: rotate(var(--angle)) translateX(150vw) scaleX(1); }
}
</style>
