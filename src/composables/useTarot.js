import { ref, computed } from 'vue'
import { TAROT_DATABASE } from '../data/tarotDb'

export function useTarot() {
  const step = ref(0)
  const showDeck = ref(false)
  const deckExploding = ref(false)
  const isDrawing = ref(false)
  const drawnCards = ref([])
  const cardsDrawn = ref(0)
  const dynamicSummary = ref('')

  const anyCardFocused = computed(() => drawnCards.value.some(c => c.focused))

  const startReading = () => {
    // Shuffle 78 Kartu secara acak
    const shuffled = [...TAROT_DATABASE].sort(() => 0.5 - Math.random())

    // Ambil 3 kartu teratas dan persiapkan statenya
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
    step.value = 1
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

  const resetReading = () => {
    step.value = 0
    drawnCards.value = []
    cardsDrawn.value = 0
    dynamicSummary.value = ''
    showDeck.value = false
    deckExploding.value = false
    isDrawing.value = false
  }

  return {
    step,
    showDeck,
    deckExploding,
    isDrawing,
    drawnCards,
    cardsDrawn,
    dynamicSummary,
    anyCardFocused,
    startReading,
    generateSummary,
    resetReading
  }
}
