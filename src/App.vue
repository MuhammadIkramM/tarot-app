<template>
  <div class="fixed inset-0 bg-[#0A0D11] text-[#F5F6FA] overflow-x-hidden overflow-y-auto font-sans scroll-smooth">

    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0984E3] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-pulse-slow"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00CEC9] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-pulse-slow" style="animation-delay: 2s;"></div>

      <div class="stars-layer-1"></div>
      <div class="floating-dust"></div>

      <div class="background-stars absolute inset-0">
        <div
          v-for="star in staticStars"
          :key="star.id"
          class="star-static"
          :style="star.style"
        ></div>
      </div>

      <div class="shooting-stars-canvas absolute inset-0">
        <div
          v-for="star in shootingStars"
          :key="star.id"
          class="star-shooting"
          :style="star.style"
        ></div>
      </div>
    </div>

    <audio ref="bgMusic" :src="`${baseUrl}sounds/bg-mystic.mp3`" loop></audio>
    <audio ref="sfxReveal" :src="`${baseUrl}sounds/card-reveal.mp3`"></audio>
    <audio ref="sfxMagic" :src="`${baseUrl}sounds/magic-chime.mp3`"></audio>

    <div class="relative z-10 min-h-[100dvh] w-full flex flex-col items-center justify-center py-12 px-4 md:px-8 box-border">
      <main class="w-full max-w-6xl flex flex-col items-center justify-center">

        <transition name="fade">
          <div v-if="step === 0" class="flex flex-col items-center gap-10 md:gap-16 z-50">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-center drop-shadow-[0_0_20px_rgba(0,206,201,0.8)] title-glow uppercase">
              KARTU TAROT
            </h1>
            <button
              @click="startReading"
              class="px-10 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-[#0984E3] to-[#00CEC9] text-[#1E272E] hover:scale-110 shadow-[0_0_30px_#0984E3] hover:shadow-[0_0_50px_#00CEC9] transition-all duration-500 cursor-pointer border-none uppercase tracking-widest whitespace-nowrap"
            >
              Mulai ?
            </button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="step >= 1 && step <= 6" class="flex flex-col items-center w-full perspective-1000 z-10">
            <div class="relative flex flex-row gap-4 md:gap-10 justify-center items-start w-full z-30 mb-4">
              <div
                v-for="(card, index) in drawnCards"
                :key="index"
                class="flex flex-col items-center w-[28vw] sm:w-[22vw] md:w-[11rem] max-w-[176px]"
                :ref="el => setSlotRef(el, index)"
              >
                <div
                  class="card-wrapper w-full aspect-[1/1.6] preserve-3d overflow-visible"
                  :class="[
                    !card.readyToFly ? 'opacity-0 pointer-events-none' : 'opacity-100',
                    card.focused ? 'card-flying z-50' : 'z-10',
                    (anyCardFocused && !card.focused) ? '!opacity-30 blur-sm scale-95' : ''
                  ]"
                  :style="getCardStyle(card)"
                >
                  <div class="card-inner w-full h-full relative preserve-3d" :class="{ 'rotate-y-180': card.revealed }">
                    <div class="card-face card-back absolute inset-0 bg-[#1A2026] border-[1.5px] border-[#00CEC9]/60 rounded-lg shadow-[0_0_20px_rgba(9,132,227,0.4)] overflow-hidden">
                      <img :src="`${baseUrl}assets/back-card.jpg`" alt="Card Back" class="w-full h-full object-cover" />
                    </div>
                    <div class="card-face card-front absolute inset-0 bg-[#1A2026] border-[1.5px] border-[#00CEC9] rounded-lg shadow-[0_0_30px_rgba(0,206,201,0.6)] rotate-y-180 overflow-hidden pointer-events-auto">
                      <img
                        :src="getCardImage(card)"
                        :alt="card.name"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        @error="onImageError"
                      />
                      <div class="absolute inset-0 shadow-[inset_0_0_15px_rgba(30,39,46,0.8)] pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                <div
                  class="mt-3 md:mt-5 text-center transition-all duration-1000 w-full"
                  :class="card.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
                >
                  <h3 class="text-[10px] md:text-sm font-extrabold text-[#F5F6FA] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,206,201,0.5)]">{{ card.name }}</h3>
                  <p v-if="card.type === 'Major Arcana'" class="text-[8px] md:text-[10px] text-[#00CEC9] mt-1 md:mt-2 font-black tracking-widest opacity-90 uppercase">{{ card.id }} - {{ card.type }}</p>
                  <p v-else class="text-[8px] md:text-[10px] text-[#00CEC9] mt-1 md:mt-2 font-black tracking-widest opacity-90 uppercase">{{ card.type }}</p>
                </div>
              </div>
            </div>

            <transition name="fade">
              <div v-show="step <= 5" class="relative flex items-center justify-center w-full h-[25vw] md:h-[13rem] z-20 mt-8">

                <transition name="deck-fade-center">
                  <div
                    ref="deckRef"
                    v-if="showDeck"
                    @click="drawSingleCard"
                    class="absolute z-20 w-[28vw] sm:w-[22vw] md:w-[11rem] max-w-[176px] aspect-[1/1.6] preserve-3d transition-all duration-700 cursor-pointer"
                    :class="{ 'opacity-0 scale-50 blur-[8px] translate-y-4': deckExploding }"
                  >
                    <div v-if="!deckExploding && cardsDrawn < 3" class="absolute -top-12 left-1/2 -translate-x-1/2 text-[9px] md:text-xs text-[#00CEC9] tracking-widest uppercase font-bold whitespace-nowrap animate-pulse z-30">
                      Pilih Kartu ({{ cardsDrawn }}/3)
                    </div>

                    <div
                      v-for="(card, index) in deckVisuals"
                      :key="card.id"
                      class="deck-card absolute inset-0 rounded-lg bg-[#1A2026] overflow-hidden"
                      :class="{
                        'deck-top-hover': !isDrawing && index === deckVisuals.length - 1
                      }"
                      :style="{
                        '--idx': index,
                        zIndex: index,
                        border: `1.5px solid rgba(0, 206, 201, ${0.2 + (index * 0.15)})`
                      }"
                    >
                      <img :src="`${baseUrl}assets/back-card.jpg`" class="w-full h-full object-cover transition-all duration-400 ease-out"
                           :style="{ filter: `brightness(${0.4 + (index * 0.1)})` }" />
                    </div>
                  </div>
                </transition>

                <div v-if="deckExploding" class="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div
                    v-for="p in particles"
                    :key="p.id"
                    class="absolute bg-[#00CEC9] shadow-[0_0_15px_#F5F6FA]"
                    :class="p.isStar ? 'clip-star' : 'rounded-full'"
                    :style="{
                      width: p.size + 'px',
                      height: p.size + 'px',
                      '--tx': p.tx + 'px',
                      '--ty': p.ty + 'px',
                      animation: `particle-explode 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`
                    }"
                  ></div>
                </div>

                <transition name="fade">
                  <div v-if="step === 5" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <button
                      @click="translateCards"
                      class="px-6 md:px-8 py-3 text-sm md:text-lg font-bold border-2 border-[#00CEC9] text-[#00CEC9] rounded-full hover:bg-[#00CEC9] hover:text-[#1E272E] shadow-[0_0_20px_rgba(0,206,201,0.3)] hover:shadow-[0_0_40px_#00CEC9] transition-all duration-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Terjemahkan Takdir
                    </button>
                  </div>
                </transition>
              </div>
            </transition>
          </div>
        </transition>

        <transition name="slide-up-content">
          <div v-if="step === 6" class="w-full max-w-5xl flex flex-col gap-6 md:gap-8 mt-12 md:mt-20 z-20">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#1A2026]/90 border border-[#00CEC9]/40 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div v-for="(card, index) in drawnCards" :key="'res-'+index" class="flex flex-col items-center text-center p-4 group">
                <span class="text-[10px] md:text-xs font-bold text-[#00CEC9] tracking-[0.2em] uppercase border-b-2 border-[#0984E3] pb-2 mb-4 md:mb-5">{{ spreadLabels[index] }}</span>
                <h4 class="text-lg md:text-xl font-extrabold text-[#F5F6FA] mb-3 md:mb-4 group-hover:text-[#00CEC9] transition-colors uppercase tracking-tight">{{ card.name }}</h4>
                <p class="text-xs md:text-sm leading-relaxed text-[#F5F6FA]/80 group-hover:text-[#F5F6FA] transition-colors italic">"{{ getDynamicText(card, index) }}"</p>
              </div>
            </div>

            <div class="p-6 md:p-8 bg-gradient-to-r from-[#0984E3]/20 to-[#00CEC9]/20 border border-[#00CEC9]/50 rounded-3xl text-center shadow-lg">
              <h3 class="text-base md:text-lg font-bold text-[#00CEC9] mb-3 tracking-widest uppercase">Kesimpulan Energi Semesta</h3>
              <p class="text-sm md:text-base text-[#F5F6FA] italic leading-relaxed">{{ dynamicSummary }}</p>
            </div>

            <button @click="resetReading" class="mt-4 px-6 py-2 text-sm text-[#00CEC9] uppercase border border-[#00CEC9] rounded-full hover:bg-[#00CEC9] hover:text-[#1A2026] transition-all self-center">Baca Ulang</button>
          </div>
        </transition>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const baseUrl = import.meta.env.BASE_URL;

// DATABASE 78 KARTU TAROT LENGKAP
const TAROT_DATABASE = [
  // MAJOR ARCANA (0-21)
  { id: 0, name: 'The Fool', type: 'Major Arcana', meaning: 'Awal baru, kepolosan, kebebasan, dan keberanian mengambil risiko.' },
  { id: 1, name: 'The Magician', type: 'Major Arcana', meaning: 'Kekuatan manifestasi, kreativitas, keahlian, dan pemanfaatan peluang.' },
  { id: 2, name: 'The High Priestess', type: 'Major Arcana', meaning: 'Intuisi, misteri, kebijaksanaan batin, dan rahasia yang tersembunyi.' },
  { id: 3, name: 'The Empress', type: 'Major Arcana', meaning: 'Kesuburan, kelimpahan, keibuan, dan ekspresi alam.' },
  { id: 4, name: 'The Emperor', type: 'Major Arcana', meaning: 'Struktur, otoritas, stabilitas, dan kepemimpinan logis.' },
  { id: 5, name: 'The Hierophant', type: 'Major Arcana', meaning: 'Tradisi, bimbingan spiritual, institusi, dan sistem kepercayaan.' },
  { id: 6, name: 'The Lovers', type: 'Major Arcana', meaning: 'Cinta, harmoni, hubungan yang mendalam, dan pilihan hidup yang penting.' },
  { id: 7, name: 'The Chariot', type: 'Major Arcana', meaning: 'Tekad, fokus, kemenangan, dan kendali atas rintangan.' },
  { id: 8, name: 'Strength', type: 'Major Arcana', meaning: 'Keberanian, kasih sayang, kesabaran, dan kekuatan batin.' },
  { id: 9, name: 'The Hermit', type: 'Major Arcana', meaning: 'Pencarian jiwa, introspeksi, kesendirian, dan bimbingan dari dalam.' },
  { id: 10, name: 'Wheel of Fortune', type: 'Major Arcana', meaning: 'Perubahan nasib, karma, siklus kehidupan, dan takdir.' },
  { id: 11, name: 'Justice', type: 'Major Arcana', meaning: 'Keadilan, kebenaran, keseimbangan, dan hukum sebab-akibat.' },
  { id: 12, name: 'The Hanged Man', type: 'Major Arcana', meaning: 'Pengorbanan, melepaskan kendali, dan melihat dari perspektif baru.' },
  { id: 13, name: 'Death', type: 'Major Arcana', meaning: 'Akhir dari sebuah siklus, transformasi mendalam, dan transisi pembaruan.' },
  { id: 14, name: 'Temperance', type: 'Major Arcana', meaning: 'Keseimbangan, moderasi, kedamaian batin, dan penyembuhan.' },
  { id: 15, name: 'The Devil', type: 'Major Arcana', meaning: 'Keterikatan, kecanduan, bayangan diri, dan belenggu material.' },
  { id: 16, name: 'The Tower', type: 'Major Arcana', meaning: 'Kehancuran tiba-tiba, wahyu yang mengejutkan, dan runtuhnya ego.' },
  { id: 17, name: 'The Star', type: 'Major Arcana', meaning: 'Harapan, pembaruan spiritual, inspirasi, dan kedamaian.' },
  { id: 18, name: 'The Moon', type: 'Major Arcana', meaning: 'Ilusi, ketakutan bawah sadar, intuisi, dan hal-hal yang belum jelas.' },
  { id: 19, name: 'The Sun', type: 'Major Arcana', meaning: 'Kebahagiaan, kesuksesan, vitalitas, dan pencerahan.' },
  { id: 20, name: 'Judgement', type: 'Major Arcana', meaning: 'Panggilan batin, kebangkitan, evaluasi diri, dan pengampunan.' },
  { id: 21, name: 'The World', type: 'Major Arcana', meaning: 'Penyelesaian, pencapaian utuh, perjalanan yang sukses, dan keutuhan.' },

  // MINOR ARCANA - WANDS (API)
  { id: 22, name: 'Ace of Wands', type: 'Wands (Api)', meaning: 'Inspirasi baru, ide kreatif, dan percikan semangat yang menggebu.' },
  { id: 23, name: 'Two of Wands', type: 'Wands (Api)', meaning: 'Perencanaan masa depan, penemuan, dan keputusan arah hidup.' },
  { id: 24, name: 'Three of Wands', type: 'Wands (Api)', meaning: 'Ekspansi, pertumbuhan, dan melihat melampaui batas saat ini.' },
  { id: 25, name: 'Four of Wands', type: 'Wands (Api)', meaning: 'Perayaan, harmoni keluarga, reuni, dan lingkungan yang stabil.' },
  { id: 26, name: 'Five of Wands', type: 'Wands (Api)', meaning: 'Konflik ringan, persaingan, perbedaan pendapat, dan ketegangan.' },
  { id: 27, name: 'Six of Wands', type: 'Wands (Api)', meaning: 'Kemenangan, pengakuan, kesuksesan publik, dan rasa bangga.' },
  { id: 28, name: 'Seven of Wands', type: 'Wands (Api)', meaning: 'Mempertahankan posisi, ketekunan menghadapi tantangan, dan perlindungan.' },
  { id: 29, name: 'Eight of Wands', type: 'Wands (Api)', meaning: 'Pergerakan cepat, tindakan yang terburu-buru, dan kedatangan berita.' },
  { id: 30, name: 'Nine of Wands', type: 'Wands (Api)', meaning: 'Ketahanan, keberanian meski terluka, dan hampir mencapai batas akhir.' },
  { id: 31, name: 'Ten of Wands', type: 'Wands (Api)', meaning: 'Beban yang terlalu berat, stres, dan tanggung jawab yang menumpuk.' },
  { id: 32, name: 'Page of Wands', type: 'Wands (Api)', meaning: 'Antusiasme, eksplorasi potensi, dan semangat tanpa batas.' },
  { id: 33, name: 'Knight of Wands', type: 'Wands (Api)', meaning: 'Tindakan yang didorong gairah, energi, dan petualangan spontan.' },
  { id: 34, name: 'Queen of Wands', type: 'Wands (Api)', meaning: 'Kepercayaan diri, kemandirian, keberanian, dan pesona sosial.' },
  { id: 35, name: 'King of Wands', type: 'Wands (Api)', meaning: 'Kepemimpinan bervisi besar, wirausaha, dan daya cipta yang kuat.' },

  // MINOR ARCANA - CUPS (AIR)
  { id: 36, name: 'Ace of Cups', type: 'Cups (Air)', meaning: 'Cinta baru, hubungan emosional, dan limpahan kasih sayang.' },
  { id: 37, name: 'Two of Cups', type: 'Cups (Air)', meaning: 'Kemitraan yang seimbang, persatuan, dan cinta yang saling berbalas.' },
  { id: 38, name: 'Three of Cups', type: 'Cups (Air)', meaning: 'Perayaan, persahabatan, dan kebersamaan dalam komunitas yang bahagia.' },
  { id: 39, name: 'Four of Cups', type: 'Cups (Air)', meaning: 'Apatis, perenungan diri, dan mengabaikan peluang di depan mata.' },
  { id: 40, name: 'Five of Cups', type: 'Cups (Air)', meaning: 'Kehilangan, kekecewaan, kesedihan akan masa lalu, dan penyesalan.' },
  { id: 41, name: 'Six of Cups', type: 'Cups (Air)', meaning: 'Nostalgia, kenangan masa kecil, kepolosan, dan reuni.' },
  { id: 42, name: 'Seven of Cups', type: 'Cups (Air)', meaning: 'Banyak pilihan, lamunan, ilusi, dan godaan fana.' },
  { id: 43, name: 'Eight of Cups', type: 'Cups (Air)', meaning: 'Meninggalkan sesuatu yang tak lagi memuaskan, pencarian makna batin.' },
  { id: 44, name: 'Nine of Cups', type: 'Cups (Air)', meaning: 'Kepuasan, harapan yang terkabul, dan kebanggaan emosional ("Kartu Keinginan").' },
  { id: 45, name: 'Ten of Cups', type: 'Cups (Air)', meaning: 'Harmoni keluarga, kebahagiaan sejati, dan kedamaian spiritual.' },
  { id: 46, name: 'Page of Cups', type: 'Cups (Air)', meaning: 'Kreativitas, datangnya pesan emosional, dan intuisi yang polos.' },
  { id: 47, name: 'Knight of Cups', type: 'Cups (Air)', meaning: 'Romansa, pesona, mengikuti kata hati, dan idealisme cinta.' },
  { id: 48, name: 'Queen of Cups', type: 'Cups (Air)', meaning: 'Kasih sayang, empati yang dalam, kelembutan, dan kebijaksanaan emosional.' },
  { id: 49, name: 'King of Cups', type: 'Cups (Air)', meaning: 'Kontrol emosional, diplomasi, keseimbangan perasaan, dan ketenangan.' },

  // MINOR ARCANA - SWORDS (UDARA)
  { id: 50, name: 'Ace of Swords', type: 'Swords (Udara)', meaning: 'Kejelasan mental, kebenaran mutlak, dan terobosan intelektual.' },
  { id: 51, name: 'Two of Swords', type: 'Swords (Udara)', meaning: 'Keputusan sulit, jalan buntu, dan menghindari konfrontasi.' },
  { id: 52, name: 'Three of Swords', type: 'Swords (Udara)', meaning: 'Patah hati, kesedihan, luka emosional, dan rasa sakit.' },
  { id: 53, name: 'Four of Swords', type: 'Swords (Udara)', meaning: 'Istirahat, pemulihan mental, meditasi, dan persiapan diri.' },
  { id: 54, name: 'Five of Swords', type: 'Swords (Udara)', meaning: 'Konflik, kemenangan yang merugikan orang lain, atau kekalahan.' },
  { id: 55, name: 'Six of Swords', type: 'Swords (Udara)', meaning: 'Transisi, pemulihan, meninggalkan rintangan menuju tempat yang tenang.' },
  { id: 56, name: 'Seven of Swords', type: 'Swords (Udara)', meaning: 'Penipuan, taktik tersembunyi, kelicikan, dan pengkhianatan.' },
  { id: 57, name: 'Eight of Swords', type: 'Swords (Udara)', meaning: 'Pembatasan diri, merasa terjebak, dan ketakutan yang tidak beralasan.' },
  { id: 58, name: 'Nine of Swords', type: 'Swords (Udara)', meaning: 'Kecemasan, mimpi buruk, trauma, dan kekhawatiran berlebihan.' },
  { id: 59, name: 'Ten of Swords', type: 'Swords (Udara)', meaning: 'Akhir yang menyakitkan, titik terendah, pengkhianatan, namun tidak bisa lebih buruk lagi.' },
  { id: 60, name: 'Page of Swords', type: 'Swords (Udara)', meaning: 'Ide baru, rasa ingin tahu yang tajam, komunikasi, dan kejujuran.' },
  { id: 61, name: 'Knight of Swords', type: 'Swords (Udara)', meaning: 'Tindakan terburu-buru, ambisi menggebu, dan agresivitas mental.' },
  { id: 62, name: 'Queen of Swords', type: 'Swords (Udara)', meaning: 'Persepsi tajam, kemandirian, pemikiran logis tanpa emosi buta.' },
  { id: 63, name: 'King of Swords', type: 'Swords (Udara)', meaning: 'Otoritas intelektual, kebenaran, ketegasan, dan keadilan.' },

  // MINOR ARCANA - PENTACLES (TANAH)
  { id: 64, name: 'Ace of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Peluang material baru, kemakmuran, dan fondasi finansial.' },
  { id: 65, name: 'Two of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Keseimbangan prioritas, manajemen waktu, dan adaptasi perubahan.' },
  { id: 66, name: 'Three of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kerja sama tim, keterampilan, kolaborasi, dan perencanaan.' },
  { id: 67, name: 'Four of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Konservasi, keterikatan material yang kaku, dan keengganan berbagi.' },
  { id: 68, name: 'Five of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kesulitan finansial, merasa terasingkan, dan masa-masa sulit.' },
  { id: 69, name: 'Six of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kemurahan hati, amal, dan keseimbangan antara memberi dan menerima.' },
  { id: 70, name: 'Seven of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kesabaran, investasi jangka panjang, dan menunggu hasil panen.' },
  { id: 71, name: 'Eight of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Dedikasi, pembelajaran tekun, dan pengembangan keterampilan/karir.' },
  { id: 72, name: 'Nine of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kemandirian finansial, kenyamanan mewah, dan hasil kerja keras.' },
  { id: 73, name: 'Ten of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kekayaan jangka panjang, warisan, dan stabilitas keluarga besar.' },
  { id: 74, name: 'Page of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Peluang proyek baru, studi, dan manifestasi ide praktis.' },
  { id: 75, name: 'Knight of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kerja keras, rutinitas, ketekunan, dan langkah perlahan yang pasti.' },
  { id: 76, name: 'Queen of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Praktis, sifat mengayomi, dan kelimpahan yang dibagikan.' },
  { id: 77, name: 'King of Pentacles', type: 'Pentacles (Tanah)', meaning: 'Kesuksesan bisnis, kekayaan besar, dan stabilitas material.' }
]

const step = ref(0)
const showDeck = ref(false)
const deckExploding = ref(false)
const isDrawing = ref(false)
const drawnCards = ref([])
const cardsDrawn = ref(0)
const particles = ref([])
const dynamicSummary = ref('')
const spreadLabels = ['Masa Lalu', 'Masa Kini', 'Masa Depan']

const deckRef = ref(null)
const slotRefs = ref([])
const setSlotRef = (el, index) => {
  if (el) slotRefs.value[index] = el
}

const deckVisuals = ref([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }])
let nextDeckId = 8

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

const bgMusic = ref(null)
const sfxReveal = ref(null)
const sfxMagic = ref(null)

const anyCardFocused = computed(() => drawnCards.value.some(c => c.focused))

const playSound = (audioRef) => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(() => {})
  }
}

// FORMAT NAMA FILE YANG COCOK DENGAN MAJOR ARCANA & MINOR ARCANA
const getCardImage = (card) => {
  const formattedName = card.name.toLowerCase().replace(/\s+/g, '-')
  return card.type === 'Major Arcana'
    ? `${baseUrl}assets/${card.id}-${formattedName}.png`
    : `${baseUrl}assets/${formattedName}.png`
}

const onImageError = (e) => { e.target.style.display = 'none' }

const delay = (ms) => new Promise(res => setTimeout(res, ms))

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

const getCardStyle = (card) => {
  if (!card.readyToFly) return {}

  if (!card.dealt) {
    return {
      transform: `translate3d(${card.startX}px, ${card.startY}px, 0)`,
      transition: 'none',
      pointerEvents: 'none'
    }
  }
  return {
    transform: `translate3d(0, 0, 0)`,
    transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease, filter 0.4s ease',
    pointerEvents: 'auto'
  }
}

const startReading = async () => {
  const shuffled = [...TAROT_DATABASE].sort(() => 0.5 - Math.random())
  drawnCards.value = shuffled.slice(0, 3).map(card => ({
    ...card,
    dealt: false,
    readyToFly: false,
    focused: false,
    revealed: false,
    startX: 0,
    startY: 0
  }))

  cardsDrawn.value = 0
  playSound(bgMusic)
  step.value = 1

  await delay(500)
  showDeck.value = true
}

const drawSingleCard = async () => {
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

    const deckTopX = deckRect.left - 4.5;
    const deckTopY = deckRect.top - 9;

    drawnCards.value[currentIndex].startX = deckTopX - slotRect.left;
    drawnCards.value[currentIndex].startY = deckTopY - slotRect.top;
  }

  drawnCards.value[currentIndex].readyToFly = true;
  deckVisuals.value.pop();
  deckVisuals.value.unshift({ id: nextDeckId++ });

  await nextTick();
  if (deckEl) deckEl.offsetHeight;

  setTimeout(() => {
    drawnCards.value[currentIndex].dealt = true;
  }, 30);

  await delay(650);
  cardsDrawn.value++;
  isDrawing.value = false;

  if (cardsDrawn.value === 3) {
    step.value = 2
    await delay(800)

    generateParticles()
    deckExploding.value = true
    playSound(sfxMagic)

    await delay(1000)

    showDeck.value = false
    deckExploding.value = false
    particles.value = []

    await delay(300)
    step.value = 4

    for (let i = 0; i < 3; i++) {
      const idx = order[i];
      drawnCards.value[idx].focused = true
      playSound(sfxReveal)
      await delay(700)

      drawnCards.value[idx].revealed = true
      playSound(sfxMagic)
      await delay(2000)

      drawnCards.value[idx].focused = false
      await delay(600)
    }

    step.value = 5
  }
}

const getDynamicText = (card, index) => {
  const m = card.meaning.toLowerCase()
  if (index === 0) return `Masa lalu Anda diwarnai oleh aura ${card.name}. Sebelumnya, Anda mengalami ${m}`
  if (index === 1) return `Saat ini, semesta menempatkan Anda di bawah energi ${card.name}. Realitas Anda menunjukkan ${m}`
  return `Ke depannya, arah hidup dibimbing oleh pesan dari ${card.name}. Bersiaplah, karena akan ada ${m}`
}

const generateSummary = () => {
  let majorCount = 0
  let elements = { api: 0, air: 0, udara: 0, tanah: 0 }

  drawnCards.value.forEach(card => {
    if (card.type === 'Major Arcana') majorCount++
    if (card.type.includes('Api')) elements.api++
    if (card.type.includes('Air')) elements.air++
    if (card.type.includes('Udara')) elements.udara++
    if (card.type.includes('Tanah')) elements.tanah++
  })

  let summary = ''
  if (majorCount >= 2) summary += 'Tebaran ini didominasi oleh energi takdir Major Arcana, menandakan adanya perubahan besar, karma, dan transformasi mendalam yang sedang bekerja. '
  else if (majorCount === 0) summary += 'Energi saat ini berfokus pada kejadian praktis, tugas harian, dan respons terhadap lingkungan sekitar Anda. '

  // Cek dominasi elemen hanya untuk kartu Minor Arcana
  const maxElem = Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b)
  if (elements[maxElem] >= 2) {
    if (maxElem === 'api') summary += 'Elemen Api mendominasi; ambisi, gairah, dan tindakan cepat akan menentukan hasil Anda.'
    if (maxElem === 'air') summary += 'Elemen Air mendominasi; intuisi, cinta, dan hubungan emosional menjadi kunci utama.'
    if (maxElem === 'udara') summary += 'Elemen Udara mendominasi; logika, kejujuran, dan penyelesaian konflik mental mengambil alih panggung kehidupan.'
    if (maxElem === 'tanah') summary += 'Elemen Tanah mendominasi; stabilitas finansial, pekerjaan keras, dan hasil material menjadi sorotan terbesar.'
  } else {
    summary += 'Keseimbangan elemen tampak, meminta Anda menyelaraskan pikiran, perasaan, intuisi, dan tindakan praktis untuk melangkah maju.'
  }

  dynamicSummary.value = summary
}

const translateCards = () => {
  playSound(sfxMagic)
  generateSummary()
  step.value = 6
}

const resetReading = () => {
  step.value = 0
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

.card-flying {
  transform: scale(1.15) translateY(-25px) !important;
  filter: drop-shadow(0 0 50px rgba(0, 206, 201, 0.8));
}

@keyframes particle-explode {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(180deg); opacity: 0; }
}

.clip-star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  background-color: #F5F6FA !important;
}

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
  position: absolute;
  background-color: #F5F6FA;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: staticStarTwinkle 5s infinite;
}
@keyframes staticStarTwinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

.shooting-stars-canvas { z-index: 2; }
.star-shooting {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00CEC9, #F5F6FA);
  animation: shootingStarFall linear infinite;
  transform-origin: left;
}

@keyframes shootingStarFall {
  0% { opacity: 0; transform: rotate(var(--angle)) translateX(0) scaleX(0); }
  10% { opacity: 1; transform: rotate(var(--angle)) translateX(0) scaleX(1); }
  20% { opacity: 0.8; }
  30% { opacity: 0; transform: rotate(var(--angle)) translateX(150vw) scaleX(1); }
  100% { opacity: 0; transform: rotate(var(--angle)) translateX(150vw) scaleX(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-content-enter-active { transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-content-enter-from { opacity: 0; transform: translateY(30px); }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #0A0D11; }
::-webkit-scrollbar-thumb { background: #00CEC9; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #0984E3; }
</style>
