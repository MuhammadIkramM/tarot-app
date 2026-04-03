<template>
  <div class="w-full max-w-5xl flex flex-col gap-4 md:gap-8 mt-8 md:mt-12 z-20 pb-8 md:pb-12">
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-[#1A2026]/90 border border-[#00CEC9]/40 rounded-2xl md:rounded-3xl backdrop-blur-xl shadow-2xl"
    >
      <div
        v-for="(card, index) in drawnCards"
        :key="'res-' + index"
        class="flex flex-col items-center text-center p-3 md:p-4 group"
      >
        <span
          class="text-[10px] md:text-xs font-bold text-[#00CEC9] tracking-[0.2em] uppercase border-b-2 border-[#0984E3] pb-2 mb-3 md:mb-5"
          >{{ spreadLabels[index] }}</span
        >
        <h4
          class="text-base md:text-xl font-extrabold text-[#F5F6FA] mb-2 md:mb-4 group-hover:text-[#00CEC9] transition-colors uppercase tracking-tight"
        >
          {{ card.name }}
        </h4>
        <p
          class="text-xs md:text-sm leading-relaxed text-[#F5F6FA]/80 group-hover:text-[#F5F6FA] transition-colors italic"
        >
          "{{ getDynamicText(card, index) }}"
        </p>
      </div>
    </div>

    <div
      class="p-5 md:p-8 bg-gradient-to-r from-[#0984E3]/20 to-[#00CEC9]/20 border border-[#00CEC9]/50 rounded-2xl md:rounded-3xl text-center shadow-lg"
    >
      <h3 class="text-sm md:text-lg font-bold text-[#00CEC9] mb-3 tracking-widest uppercase">
        Kesimpulan Ramalan
      </h3>
      <p class="text-xs md:text-base text-[#F5F6FA] italic leading-relaxed">{{ dynamicSummary }}</p>
    </div>

    <button
      @click="$emit('reset')"
      class="mt-2 md:mt-4 px-6 py-2 md:px-8 md:py-3 text-xs md:text-sm text-[#00CEC9] font-bold uppercase border border-[#00CEC9] rounded-full hover:bg-[#00CEC9] hover:text-[#1A2026] transition-all self-center shadow-[0_0_15px_rgba(0,206,201,0.2)] hover:shadow-[0_0_25px_#00CEC9]"
    >
      Baca Ulang
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  drawnCards: Array,
  dynamicSummary: String,
})

// Mendaftarkan event agar bisa ditangkap oleh App.vue
defineEmits(['reset'])

const spreadLabels = ['Masa Lalu', 'Masa Kini', 'Masa Depan']

const getDynamicText = (card, index) => {
  const m = card.meaning.toLowerCase()
  if (index === 0)
    return `Masa lalu Anda diwarnai oleh aura ${card.name}. Sebelumnya, Anda mengalami ${m}`
  if (index === 1)
    return `Saat ini, semesta menempatkan Anda di bawah energi ${card.name}. Realitas Anda menunjukkan ${m}`
  return `Ke depannya, arah hidup dibimbing oleh pesan dari ${card.name}. Bersiaplah, karena akan ada ${m}`
}
</script>
