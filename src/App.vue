<template>
  <div class="fixed inset-0 bg-[#0A0D11] text-[#F5F6FA] overflow-x-hidden overflow-y-auto font-sans scroll-smooth">

    <CosmicBackground />

    <audio ref="bgMusic" :src="`${baseUrl}sounds/bg-mystic.mp3`" loop></audio>
    <audio ref="sfxReveal" :src="`${baseUrl}sounds/card-reveal.mp3`"></audio>
    <audio ref="sfxMagic" :src="`${baseUrl}sounds/magic-chime.mp3`"></audio>

    <div class="relative z-10 min-h-[100dvh] w-full flex flex-col items-center py-8 md:py-12 px-2 sm:px-4 md:px-8 box-border">
      <main class="w-full max-w-6xl flex flex-col items-center justify-center my-auto">

        <transition name="fade">
          <div v-if="step === 0" class="flex flex-col items-center gap-8 md:gap-16 z-50 px-2">
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-center drop-shadow-[0_0_20px_rgba(0,206,201,0.8)] uppercase">
              KARTU TAROT
            </h1>
            <button @click="handleStart" class="px-8 md:px-10 py-3 md:py-4 text-lg md:text-xl font-bold rounded-full bg-gradient-to-r from-[#0984E3] to-[#00CEC9] text-[#1E272E] hover:scale-110 shadow-[0_0_30px_#0984E3] hover:shadow-[0_0_50px_#00CEC9] transition-all duration-500 uppercase tracking-widest">
              Mulai ?
            </button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="step >= 1 && step <= 6" class="flex flex-col items-center w-full perspective-1000 z-10">

            <div class="relative flex flex-row gap-2 sm:gap-4 md:gap-10 justify-center items-start w-full z-30 mb-2 md:mb-4">
              <div v-for="(card, index) in drawnCards" :key="index" class="flex flex-col items-center w-[28vw] sm:w-[22vw] md:w-[11rem] max-w-[176px]" :ref="el => setSlotRef(el, index)">

                <div class="card-wrapper w-full aspect-[1/1.6] preserve-3d overflow-visible"
                  :class="[
                    !card.readyToFly ? 'opacity-0 pointer-events-none' : 'opacity-100',
                    card.focused ? 'card-flying z-50' : 'z-10',
                    (anyCardFocused && !card.focused) ? '!opacity-30 blur-sm scale-95' : ''
                  ]"
                  :style="getCardStyle(card)">

                  <div class="card-inner w-full h-full relative preserve-3d" :class="{ 'rotate-y-180': card.revealed }">
                    <div class="card-face card-back absolute inset-0 bg-[#1A2026] border-[1.5px] border-[#00CEC9]/60 rounded-lg shadow-[0_0_20px_rgba(9,132,227,0.4)] overflow-hidden">
                      <img :src="`${baseUrl}assets/back-card.jpg`" class="w-full h-full object-cover" />
                    </div>
                    <div class="card-face card-front absolute inset-0 bg-[#1A2026] border-[1.5px] border-[#00CEC9] rounded-lg shadow-[0_0_30px_rgba(0,206,201,0.6)] rotate-y-180 overflow-hidden pointer-events-auto">
                      <img :src="getCardImage(card)" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" @error="onImageError" />
                      <div class="absolute inset-0 shadow-[inset_0_0_15px_rgba(30,39,46,0.8)] pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                <div class="mt-2 md:mt-5 text-center transition-all duration-1000 w-full px-1" :class="card.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
                  <h3 class="text-[11px] md:text-sm font-extrabold text-[#F5F6FA] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,206,201,0.5)]">{{ card.name }}</h3>
                  <p class="text-[9px] md:text-[10px] text-[#00CEC9] mt-1 md:mt-2 font-black tracking-widest opacity-90 uppercase">
                    {{ card.type === 'Major Arcana' ? `${card.id} - ${card.type}` : card.type }}
                  </p>
                </div>
              </div>
            </div>

            <transition name="fade">
              <div v-show="step <= 5" class="relative flex items-center justify-center w-full h-[35vw] md:h-[14rem] z-20 mt-6 md:mt-8">

                <transition name="deck-fade-center">
                  <div ref="deckRef" v-if="showDeck" @click="handleDrawSingleCard" class="absolute z-20 w-[28vw] sm:w-[22vw] md:w-[11rem] max-w-[176px] aspect-[1/1.6] preserve-3d cursor-pointer transition-all duration-700" :class="{ 'opacity-0 scale-50 blur-[8px] translate-y-4': deckExploding }">
                    <div v-if="!deckExploding && cardsDrawn < 3" class="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-[#00CEC9] tracking-widest uppercase font-bold whitespace-nowrap animate-pulse z-30">
                      Pilih Kartu ({{ cardsDrawn }}/3)
                    </div>

                    <div v-for="(card, index) in deckVisuals" :key="card.id" class="deck-card absolute inset-0 rounded-lg bg-[#1A2026] overflow-hidden" :class="{ 'deck-top-hover': !isDrawing && index === deckVisuals.length - 1 }" :style="{ '--idx': index, zIndex: index, border: `1.5px solid rgba(0, 206, 201, ${0.2 + (index * 0.15)})` }">
                      <img :src="`${baseUrl}assets/back-card.jpg`" class="w-full h-full object-cover transition-all duration-400 ease-out" :style="{ filter: `brightness(${0.4 + (index * 0.1)})` }" />
                    </div>
                  </div>
                </transition>

                <div v-if="deckExploding" class="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div v-for="p in particles" :key="p.id" class="absolute bg-[#00CEC9] shadow-[0_0_15px_#F5F6FA]" :class="p.isStar ? 'clip-star' : 'rounded-full'" :style="{ width: p.size + 'px', height: p.size + 'px', '--tx': p.tx + 'px', '--ty': p.ty + 'px', animation: `particle-explode 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards` }"></div>
                </div>

                <transition name="fade">
                  <div v-if="step === 5" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <button @click="handleTranslateCards" class="px-5 sm:px-6 md:px-8 py-2 md:py-3 text-xs sm:text-sm md:text-lg font-bold border-2 border-[#00CEC9] text-[#00CEC9] rounded-full hover:bg-[#00CEC9] hover:text-[#1E272E] shadow-[0_0_20px_rgba(0,206,201,0.3)] hover:shadow-[0_0_40px_#00CEC9] transition-all duration-500 uppercase tracking-wider whitespace-nowrap">
                      Terjemahkan Takdir
                    </button>
                  </div>
                </transition>
              </div>
            </transition>
          </div>
        </transition>

        <transition name="slide-up-content">
          <TarotResult
            v-if="step === 6"
            :drawnCards="drawnCards"
            :dynamicSummary="dynamicSummary"
            @reset="resetReading"
          />
        </transition>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// Import komponen & composables
import CosmicBackground from './components/CosmicBackground.vue'
import TarotResult from './components/TarotResult.vue'
import { useTarot } from './composables/useTarot'

const baseUrl = import.meta.env.BASE_URL;

// Destructure logic dari composable
const {
  step, showDeck, deckExploding, isDrawing, drawnCards, cardsDrawn,
  dynamicSummary, anyCardFocused, startReading, generateSummary, resetReading
} = useTarot()

// Referensi DOM Lokal
const bgMusic = ref(null)
const sfxReveal = ref(null)
const sfxMagic = ref(null)
const deckRef = ref(null)
const slotRefs = ref([])

const setSlotRef = (el, index) => {
  if (el) slotRefs.value[index] = el
}

const deckVisuals = ref([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }])
let nextDeckId = 8
const particles = ref([])

// Utility Functions
const playSound = (audioRef) => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(() => {})
  }
}
const delay = (ms) => new Promise(res => setTimeout(res, ms))
const onImageError = (e) => { e.target.style.display = 'none' }

const getCardImage = (card) => {
  const formattedName = card.name.toLowerCase().replace(/\s+/g, '-')
  return card.type === 'Major Arcana' ? `${baseUrl}assets/${card.id}-${formattedName}.png` : `${baseUrl}assets/${formattedName}.png`
}

const getCardStyle = (card) => {
  if (!card.readyToFly) return {}
  if (!card.dealt) {
    return { transform: `translate3d(${card.startX}px, ${card.startY}px, 0)`, transition: 'none', pointerEvents: 'none' }
  }
  return { transform: `translate3d(0, 0, 0)`, transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease, filter 0.4s ease', pointerEvents: 'auto' }
}

const generateParticles = () => {
  particles.value = Array.from({ length: 60 }).map((_, i) => {
    const angle = Math.random() * 360
    const distance = 60 + Math.random() * 200
    return {
      id: i, tx: Math.cos(angle * Math.PI / 180) * distance, ty: Math.sin(angle * Math.PI / 180) * distance,
      size: 3 + Math.random() * 8, delay: Math.random() * 0.15, isStar: Math.random() > 0.5
    }
  })
}

// Controller Actions
const handleStart = async () => {
  startReading()
  playSound(bgMusic)
  await delay(500)
  showDeck.value = true
}

const handleDrawSingleCard = async () => {
  if (cardsDrawn.value >= 3 || deckExploding.value || isDrawing.value) return;

  isDrawing.value = true;
  playSound(sfxReveal);

  const order = [0, 2, 1];
  const currentIndex = order[cardsDrawn.value];
  const deckEl = deckRef.value;
  const slotEl = slotRefs.value[currentIndex];

  if (deckEl && slotEl) {
    const deckRect = deckEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    drawnCards.value[currentIndex].startX = (deckRect.left - 4.5) - slotRect.left;
    drawnCards.value[currentIndex].startY = (deckRect.top - 9) - slotRect.top;
  }

  drawnCards.value[currentIndex].readyToFly = true;
  deckVisuals.value.pop();
  deckVisuals.value.unshift({ id: nextDeckId++ });

  await nextTick();
  if (deckEl) deckEl.offsetHeight;

  setTimeout(() => { drawnCards.value[currentIndex].dealt = true }, 30);
  await delay(650);

  cardsDrawn.value++;
  isDrawing.value = false;

  if (cardsDrawn.value === 3) {
    step.value = 2; await delay(800)

    generateParticles()
    deckExploding.value = true
    playSound(sfxMagic)
    await delay(1000)

    showDeck.value = false
    deckExploding.value = false
    particles.value = []

    await delay(300); step.value = 4;

    for (let i = 0; i < 3; i++) {
      const idx = order[i];
      drawnCards.value[idx].focused = true; playSound(sfxReveal); await delay(700);
      drawnCards.value[idx].revealed = true; playSound(sfxMagic); await delay(2000);
      drawnCards.value[idx].focused = false; await delay(600);
    }
    step.value = 5;
  }
}

const handleTranslateCards = () => {
  playSound(sfxMagic)
  generateSummary()
  step.value = 6
}
</script>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }
.card-face { backface-visibility: hidden; }

.deck-fade-center-enter-active { transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
.deck-fade-center-enter-from { opacity: 0; transform: scale(0.6) translateY(50px); }

.deck-card {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease;
  transform: translate3d(calc((var(--idx) - 3) * -1.5px), calc((var(--idx) - 3) * -3px), 0);
  box-shadow: 1px 1px 4px rgba(0,0,0,0.5);
}
.deck-top-hover:hover {
  transform: translate3d(calc((var(--idx) - 3) * -1.5px - 5px), calc((var(--idx) - 3) * -3px - 15px), 0) rotate(-2deg);
  box-shadow: -5px 10px 20px rgba(0, 206, 201, 0.6);
}

.card-inner { transition: transform 1s cubic-bezier(0.25, 0.8, 0.25, 1); }
.card-front img { transform: scale(1.0); transition: transform 1s; }
.card-wrapper:hover .card-front img { transform: scale(1.03); }
.card-flying { transform: scale(1.15) translateY(-25px) !important; filter: drop-shadow(0 0 50px rgba(0, 206, 201, 0.8)); }

@keyframes particle-explode {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(180deg); opacity: 0; }
}

.clip-star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); background-color: #F5F6FA !important; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-content-enter-active { transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-content-enter-from { opacity: 0; transform: translateY(30px); }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #0A0D11; }
::-webkit-scrollbar-thumb { background: #00CEC9; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #0984E3; }
</style>
